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
