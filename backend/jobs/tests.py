import tempfile
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase, override_settings
from core.models import User
from jobs.models import Candidate, Job, JobApplication


def make_user(email="hr@test.com", role="hr_manager"):
    return User.objects.create_user(
        username=email, email=email, password="pass1234",
        first_name="Test", last_name="HR", role=role
    )


def make_job():
    return Job.objects.create(
        title="Chef", dept="Kitchen", location="Bluewater Maribago",
        type="Full-time", status="Active", posted="Mar 14, 2026",
        description="Leads kitchen operations and service execution.",
        qualifications="Hospitality kitchen experience and team leadership.",
    )


def make_resume():
    return SimpleUploadedFile("cv.pdf", b"resume content", content_type="application/pdf")


@override_settings(MEDIA_ROOT=tempfile.mkdtemp())
class SignalTest(TestCase):
    def test_candidate_created_on_application_submit(self):
        job = make_job()
        app = JobApplication.objects.create(
            job=job, name="Ana Reyes", email="ana@test.com",
            phone_number="09171234567", resume=make_resume(),
            expected_salary="25000.00", agreement=True, source="Website",
        )
        self.assertTrue(Candidate.objects.filter(application=app).exists())

    def test_candidate_defaults(self):
        job = make_job()
        app = JobApplication.objects.create(
            job=job, name="Ana Reyes", email="ana@test.com",
            phone_number="09171234567", resume=make_resume(),
            expected_salary="25000.00", agreement=True, source="Website",
        )
        c = Candidate.objects.get(application=app)
        self.assertEqual(c.stage, "Applied")
        self.assertEqual(c.rating, 0)
        self.assertFalse(c.is_pooled)
        self.assertIsNone(c.pooled_at)
        self.assertIsNone(c.recruiter)
        self.assertEqual(c.job, job)

    def test_no_duplicate_candidate_on_application_update(self):
        job = make_job()
        app = JobApplication.objects.create(
            job=job, name="Ana Reyes", email="ana@test.com",
            phone_number="09171234567", resume=make_resume(),
            expected_salary="25000.00", agreement=True, source="Website",
        )
        # Trigger a save (update, not create) — signal guard must not fire again
        app.name = "Ana Reyes Updated"
        app.save()
        self.assertEqual(Candidate.objects.filter(application=app).count(), 1)


from jobs.serializers import CandidateSerializer


@override_settings(MEDIA_ROOT=tempfile.mkdtemp())
class CandidateSerializerTest(TestCase):
    def test_serializer_contains_expected_fields(self):
        job = make_job()
        app = JobApplication.objects.create(
            job=job, name="Ana Reyes", email="ana@test.com",
            phone_number="09171234567", resume=make_resume(),
            expected_salary="25000.00", agreement=True, source="Website",
        )
        c = Candidate.objects.get(application=app)
        data = CandidateSerializer(c, context={"request": None}).data
        self.assertIn("id", data)
        self.assertIn("stage", data)
        self.assertIn("rating", data)
        self.assertIn("recruiter", data)
        self.assertIn("application", data)
        self.assertIn("job", data)
        self.assertIn("is_pooled", data)
        self.assertIn("pooled_at", data)
        # application nested fields
        self.assertIn("name", data["application"])
        self.assertIn("email", data["application"])
        self.assertNotIn("cover_letter", data["application"])
        self.assertNotIn("agreement", data["application"])
        # job nested fields
        self.assertIn("title", data["job"])
        self.assertIn("location", data["job"])


from rest_framework.test import APIRequestFactory
from jobs.permissions import CandidatePermission


class CandidatePermissionTest(TestCase):
    def setUp(self):
        self.factory = APIRequestFactory()
        self.perm = CandidatePermission()

    def _req(self, method, role):
        req = getattr(self.factory, method)("/")
        req.user = make_user(email=f"{role}@test.com", role=role)
        return req

    def test_get_allowed_for_all_roles(self):
        for role in ("hr_manager", "talent_acquisition_manager", "talent_acquisition_specialist"):
            req = self._req("get", role)
            self.assertTrue(self.perm.has_permission(req, None))

    def test_patch_allowed_for_all_roles(self):
        for role in ("hr_manager", "talent_acquisition_manager", "talent_acquisition_specialist"):
            req = self._req("patch", role)
            self.assertTrue(self.perm.has_permission(req, None))

    def test_post_restricted_to_full_access(self):
        req = self._req("post", "talent_acquisition_specialist")
        self.assertFalse(self.perm.has_permission(req, None))
        req = self._req("post", "hr_manager")
        self.assertTrue(self.perm.has_permission(req, None))

    def test_delete_restricted_to_full_access(self):
        req = self._req("delete", "talent_acquisition_specialist")
        self.assertFalse(self.perm.has_permission(req, None))
        req = self._req("delete", "talent_acquisition_manager")
        self.assertTrue(self.perm.has_permission(req, None))


import json
from django.urls import reverse
from rest_framework.test import APIClient


@override_settings(MEDIA_ROOT=tempfile.mkdtemp())
class CandidateAPITest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.manager = make_user(email="mgr@test.com", role="hr_manager")
        self.specialist = make_user(email="spec@test.com", role="talent_acquisition_specialist")
        self.job = make_job()
        # Create an application — signal auto-creates Candidate
        self.app = JobApplication.objects.create(
            job=self.job, name="Ana Reyes", email="ana@test.com",
            phone_number="09171234567", resume=make_resume(),
            expected_salary="25000.00", agreement=True, source="Website",
        )
        self.candidate = Candidate.objects.get(application=self.app)

    def _auth(self, user):
        from rest_framework_simplejwt.tokens import RefreshToken
        token = RefreshToken.for_user(user).access_token
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")

    # --- List ---

    def test_list_requires_auth(self):
        resp = self.client.get("/api/candidates/")
        self.assertEqual(resp.status_code, 401)

    def test_list_returns_candidates(self):
        self._auth(self.specialist)
        resp = self.client.get("/api/candidates/")
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(len(resp.data), 1)

    def test_filter_by_job(self):
        self._auth(self.specialist)
        resp = self.client.get(f"/api/candidates/?job={self.job.id}")
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(len(resp.data), 1)

        other_job = make_job()
        resp = self.client.get(f"/api/candidates/?job={other_job.id}")
        self.assertEqual(len(resp.data), 0)

    def test_filter_by_is_pooled(self):
        self._auth(self.manager)
        # Pool the candidate first
        self.client.patch(
            f"/api/candidates/{self.candidate.id}/",
            {"is_pooled": True}, format="json"
        )
        resp = self.client.get("/api/candidates/?is_pooled=true")
        self.assertEqual(len(resp.data), 1)

    # --- Detail ---

    def test_detail_returns_nested_data(self):
        self._auth(self.specialist)
        resp = self.client.get(f"/api/candidates/{self.candidate.id}/")
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.data["application"]["name"], "Ana Reyes")
        self.assertEqual(resp.data["job"]["title"], "Chef")
        self.assertEqual(resp.data["stage"], "Applied")

    # --- Update ---

    def test_patch_stage(self):
        self._auth(self.specialist)
        resp = self.client.patch(
            f"/api/candidates/{self.candidate.id}/",
            {"stage": "Screening"}, format="json"
        )
        self.assertEqual(resp.status_code, 200)
        self.candidate.refresh_from_db()
        self.assertEqual(self.candidate.stage, "Screening")

    def test_pool_toggle_sets_pooled_at(self):
        self._auth(self.manager)
        resp = self.client.patch(
            f"/api/candidates/{self.candidate.id}/",
            {"is_pooled": True}, format="json"
        )
        self.assertEqual(resp.status_code, 200)
        self.candidate.refresh_from_db()
        self.assertTrue(self.candidate.is_pooled)
        self.assertIsNotNone(self.candidate.pooled_at)

    def test_pool_toggle_off_clears_pooled_at(self):
        self._auth(self.manager)
        self.client.patch(
            f"/api/candidates/{self.candidate.id}/",
            {"is_pooled": True}, format="json"
        )
        self.client.patch(
            f"/api/candidates/{self.candidate.id}/",
            {"is_pooled": False}, format="json"
        )
        self.candidate.refresh_from_db()
        self.assertFalse(self.candidate.is_pooled)
        self.assertIsNone(self.candidate.pooled_at)

    # --- Create ---

    def test_post_creates_candidate(self):
        self._auth(self.manager)
        resp = self.client.post("/api/candidates/", {
            "name": "Pedro Cruz",
            "email": "pedro@test.com",
            "phone_number": "09179999999",
            "resume": make_resume(),
            "expected_salary": "30000",
            "source": "LinkedIn",
            "job_id": self.job.id,
        }, format="multipart")
        self.assertEqual(resp.status_code, 201)
        self.assertEqual(resp.data["application"]["name"], "Pedro Cruz")
        self.assertEqual(resp.data["stage"], "Applied")

    def test_post_requires_source(self):
        self._auth(self.manager)
        resp = self.client.post("/api/candidates/", {
            "name": "Pedro Cruz",
            "email": "pedro@test.com",
            "phone_number": "09179999999",
            "resume": make_resume(),
            "expected_salary": "30000",
            "job_id": self.job.id,
        }, format="multipart")
        self.assertEqual(resp.status_code, 400)
        self.assertIn("source", resp.data)

    def test_post_restricted_to_manager_roles(self):
        self._auth(self.specialist)
        resp = self.client.post("/api/candidates/", {
            "name": "Pedro Cruz",
            "email": "pedro@test.com",
            "phone_number": "09179999999",
            "resume": make_resume(),
            "expected_salary": "30000",
            "source": "LinkedIn",
            "job_id": self.job.id,
        }, format="multipart")
        self.assertEqual(resp.status_code, 403)

    def test_post_requires_auth(self):
        resp = self.client.post("/api/candidates/", {
            "name": "Pedro Cruz",
            "email": "pedro@test.com",
            "phone_number": "09179999999",
            "resume": make_resume(),
            "expected_salary": "30000",
            "source": "LinkedIn",
            "job_id": self.job.id,
        }, format="multipart")
        self.assertEqual(resp.status_code, 401)

    # --- Delete ---

    def test_delete_restricted_to_manager_roles(self):
        self._auth(self.specialist)
        resp = self.client.delete(f"/api/candidates/{self.candidate.id}/")
        self.assertEqual(resp.status_code, 403)

    def test_delete_allowed_for_manager(self):
        self._auth(self.manager)
        resp = self.client.delete(f"/api/candidates/{self.candidate.id}/")
        self.assertEqual(resp.status_code, 204)
        self.assertFalse(Candidate.objects.filter(id=self.candidate.id).exists())
