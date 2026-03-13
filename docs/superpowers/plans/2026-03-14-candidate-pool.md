# Candidate & Talent Pool Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Persist Candidates to the database, auto-create them from JobApplications via a signal, and wire the frontend Pipeline/Candidates/TalentPool pages to the real API.

**Architecture:** A new `Candidate` model in the `jobs` app links to `JobApplication` (OneToOne) and `Job` (FK). A `post_save` signal on `JobApplication` auto-creates each `Candidate` at stage `"Applied"`. HR can also manually add candidates via `POST /api/candidates/`, which creates a `JobApplication` then reads back the signal-created `Candidate`. The Talent Pool is a filtered view (`is_pooled=True`) — no separate model.

**Tech Stack:** Django 5.x, Django REST Framework, React 18, TypeScript, Axios (or fetch with Bearer token header as per existing pattern in `frontend/src/api/jobs.ts`)

**Spec:** `docs/superpowers/specs/2026-03-14-candidate-pool-design.md`

---

## Chunk 1: Backend — Model, Signal, Migration

### File Map

| Action | File |
|---|---|
| Modify | `backend/jobs/models.py` |
| Create | `backend/jobs/signals.py` |
| Modify | `backend/jobs/apps.py` |
| Modify | `backend/jobs/admin.py` |
| Create | `backend/jobs/tests.py` |
| Create | `backend/jobs/migrations/0003_candidate.py` (auto-generated) |

---

### Task 1: Expand SOURCE_CHOICES and add Candidate model

**Files:**
- Modify: `backend/jobs/models.py`

- [ ] **Step 1: Write failing test for Candidate creation via signal**

Create `backend/jobs/tests.py`:

```python
import tempfile
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase, override_settings
from rest_framework.test import APIClient

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
```

- [ ] **Step 2: Run test — confirm it fails with ImportError on Candidate**

```bash
cd backend && python manage.py test jobs.tests.SignalTest -v 2
```

Expected: `ImportError: cannot import name 'Candidate' from 'jobs.models'`

- [ ] **Step 3: Expand SOURCE_CHOICES and add Candidate model to `backend/jobs/models.py`**

Replace the `SOURCE_CHOICES` in `JobApplication` and add the `Candidate` class at the bottom of the file:

```python
# In JobApplication — replace the existing SOURCE_CHOICES
SOURCE_CHOICES = [
    ("Website", "Website"),
    ("LinkedIn", "LinkedIn"),
    ("Indeed", "Indeed"),
    ("Referral", "Referral"),
    ("Endorsed", "Endorsed"),
    ("Other", "Other"),
]
```

Add after the `JobApplication` class:

```python
from django.conf import settings  # add this at top of file


class Candidate(models.Model):
    STAGE_CHOICES = [
        ("Applied", "Applied"),
        ("Screening", "Screening"),
        ("Initial Interview", "Initial Interview"),
        ("Exam", "Exam"),
        ("Departmental Interview", "Departmental Interview"),
        ("Final Interview", "Final Interview"),
        ("Job Offer", "Job Offer"),
        ("Hired", "Hired"),
        ("Rejected", "Rejected"),
    ]

    application = models.OneToOneField(
        JobApplication, on_delete=models.CASCADE, related_name="candidate"
    )
    # Deliberate denormalization of application.job for direct filtering
    # without joining through application.
    job = models.ForeignKey(Job, on_delete=models.CASCADE, related_name="candidates")
    recruiter = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL,
        related_name="assigned_candidates"
    )
    stage = models.CharField(max_length=50, choices=STAGE_CHOICES, default="Applied")
    rating = models.IntegerField(default=0)
    notes = models.TextField(blank=True, default="")
    exam_result = models.FileField(upload_to="exam-results/", null=True, blank=True)
    endorsed_from = models.CharField(max_length=200, blank=True, null=True)
    is_pooled = models.BooleanField(default=False)
    pooled_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "candidates"
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"{self.application.name} — {self.job.title}"
```

- [ ] **Step 4: Run the test again — still fails (signal not wired yet)**

```bash
cd backend && python manage.py test jobs.tests.SignalTest -v 2
```

Expected: `django.db.utils.OperationalError` or migration error — the model exists but no table yet. That's fine; we'll migrate after wiring the signal.

---

### Task 2: Create signal and register via ready()

**Files:**
- Create: `backend/jobs/signals.py`
- Modify: `backend/jobs/apps.py`

- [ ] **Step 1: Create `backend/jobs/signals.py`**

```python
from django.db.models.signals import post_save
from django.dispatch import receiver

from .models import Candidate, JobApplication


@receiver(post_save, sender=JobApplication)
def create_candidate_from_application(sender, instance, created, **kwargs):
    """Auto-create a Candidate at stage 'Applied' whenever a new JobApplication is saved."""
    if created:
        Candidate.objects.create(
            application=instance,
            job=instance.job,
        )
```

- [ ] **Step 2: Add `ready()` hook to `backend/jobs/apps.py`**

```python
from django.apps import AppConfig


class JobsConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "jobs"

    def ready(self):
        import jobs.signals  # noqa: F401
```

---

### Task 3: Generate and run migration

**Files:**
- Create: `backend/jobs/migrations/0003_candidate.py` (auto-generated)

- [ ] **Step 1: Generate migration**

```bash
cd backend && python manage.py makemigrations jobs --name candidate
```

Expected output: `Migrations for 'jobs': jobs/migrations/0003_candidate.py`

- [ ] **Step 2: Apply migration**

```bash
cd backend && python manage.py migrate
```

Expected: migration applies cleanly, `candidates` table created.

- [ ] **Step 3: Run signal tests — should pass now**

```bash
cd backend && python manage.py test jobs.tests.SignalTest -v 2
```

Expected: `OK` — 2 tests pass.

- [ ] **Step 4: Commit**

```bash
git add backend/jobs/models.py backend/jobs/signals.py backend/jobs/apps.py backend/jobs/migrations/0003_candidate.py backend/jobs/tests.py
git commit -m "feat: add Candidate model and auto-creation signal"
```

---

### Task 4: Register Candidate in admin

**Files:**
- Modify: `backend/jobs/admin.py`

- [ ] **Step 1: Read current admin.py to see what's registered**

```bash
cat backend/jobs/admin.py
```

- [ ] **Step 2: Register Candidate**

Add to `backend/jobs/admin.py`:

```python
from django.contrib import admin
from .models import Job, JobApplication, Candidate


@admin.register(Job)
class JobAdmin(admin.ModelAdmin):
    list_display = ("title", "dept", "location", "type", "status", "posted")
    list_filter = ("status", "location", "type")


@admin.register(JobApplication)
class JobApplicationAdmin(admin.ModelAdmin):
    list_display = ("name", "email", "job", "source", "created_at")
    list_filter = ("source", "job")


@admin.register(Candidate)
class CandidateAdmin(admin.ModelAdmin):
    list_display = ("__str__", "stage", "rating", "recruiter", "is_pooled", "created_at")
    list_filter = ("stage", "is_pooled", "job")
    raw_id_fields = ("application", "job", "recruiter")
```

- [ ] **Step 3: Commit**

```bash
git add backend/jobs/admin.py
git commit -m "feat: register Candidate in Django admin"
```

---

## Chunk 2: Backend API — Serializers, Permissions, Views, URLs

### File Map

| Action | File |
|---|---|
| Modify | `backend/jobs/serializers.py` |
| Modify | `backend/jobs/permissions.py` |
| Modify | `backend/jobs/views.py` |
| Create | `backend/jobs/urls_candidates.py` |
| Modify | `backend/config/urls.py` |
| Modify | `backend/core/serializers.py` |
| Modify | `backend/core/views.py` |
| Modify | `backend/core/urls.py` |
| Modify | `backend/jobs/tests.py` |

---

### Task 5: Add candidate serializers

> **Prerequisite:** Chunk 1 Task 1 must be complete — `JobApplication.SOURCE_CHOICES` must already include `LinkedIn`, `Indeed`, `Referral`, `Endorsed`, and `Other`. The `CandidateCreateSerializer` uses `JobApplication.SOURCE_CHOICES` for validation; if only `"Website"` is present, all other sources will return a `400` error at the modal.

**Files:**
- Modify: `backend/jobs/serializers.py`

- [ ] **Step 1: Write failing serializer tests**

Add to `backend/jobs/tests.py`:

```python
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
```

- [ ] **Step 2: Run — confirm ImportError**

```bash
cd backend && python manage.py test jobs.tests.CandidateSerializerTest -v 2
```

Expected: `ImportError: cannot import name 'CandidateSerializer'`

- [ ] **Step 3: Add serializers to `backend/jobs/serializers.py`**

Append to the existing file (keep existing `JobSerializer`, `PublicJobSerializer`, `JobApplicationSerializer`):

```python
from core.models import User
from .models import Candidate


class RecruiterSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ("id", "name")

    def get_name(self, obj) -> str:
        return obj.get_full_name()


class JobTrimmedSerializer(serializers.ModelSerializer):
    class Meta:
        model = Job
        fields = ("id", "title", "location")


class ApplicationNestedSerializer(serializers.ModelSerializer):
    """Trimmed read-only view of a JobApplication — excludes cover_letter and agreement."""

    class Meta:
        model = JobApplication
        fields = (
            "id",
            "name",
            "email",
            "phone_number",
            "resume",
            "expected_salary",
            "source",
            "created_at",
        )
        read_only_fields = fields


class CandidateSerializer(serializers.ModelSerializer):
    application = ApplicationNestedSerializer(read_only=True)
    job = JobTrimmedSerializer(read_only=True)
    recruiter = RecruiterSerializer(read_only=True)

    class Meta:
        model = Candidate
        fields = (
            "id",
            "stage",
            "rating",
            "recruiter",
            "notes",
            "exam_result",
            "endorsed_from",
            "is_pooled",
            "pooled_at",
            "created_at",
            "application",
            "job",
        )
        read_only_fields = ("id", "pooled_at", "created_at", "application", "job")


class CandidateCreateSerializer(serializers.Serializer):
    """Validates the payload for HR-initiated manual candidate creation."""

    # Application fields
    name = serializers.CharField(max_length=200)
    email = serializers.EmailField()
    phone_number = serializers.CharField(max_length=50)
    resume = serializers.FileField()
    expected_salary = serializers.DecimalField(max_digits=12, decimal_places=2)
    cover_letter = serializers.CharField(required=False, allow_blank=True, default="")
    source = serializers.ChoiceField(choices=JobApplication.SOURCE_CHOICES)

    # Candidate / HR fields
    job_id = serializers.PrimaryKeyRelatedField(
        queryset=Job.objects.filter(status="Active"), source="job"
    )
    recruiter_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(), source="recruiter", required=False, allow_null=True
    )
```

- [ ] **Step 4: Run serializer test — should pass**

```bash
cd backend && python manage.py test jobs.tests.CandidateSerializerTest -v 2
```

Expected: `OK`

- [ ] **Step 5: Commit**

```bash
git add backend/jobs/serializers.py backend/jobs/tests.py
git commit -m "feat: add candidate serializers"
```

---

### Task 6: Add CandidatePermission

**Files:**
- Modify: `backend/jobs/permissions.py`

- [ ] **Step 1: Write permission test**

Add to `backend/jobs/tests.py`:

```python
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
```

- [ ] **Step 2: Run — fails with ImportError**

```bash
cd backend && python manage.py test jobs.tests.CandidatePermissionTest -v 2
```

Expected: `ImportError: cannot import name 'CandidatePermission'`

- [ ] **Step 3: Add CandidatePermission to `backend/jobs/permissions.py`**

Append to the existing file (keep `JobPermission`):

```python
class CandidatePermission(BasePermission):
    """
    - GET (safe methods): any authenticated user.
    - PATCH: any authenticated user.
    - POST: hr_manager and talent_acquisition_manager only.
    - DELETE: hr_manager and talent_acquisition_manager only.
    """

    def has_permission(self, request, view) -> bool:
        if not request.user or not request.user.is_authenticated:
            return False
        if request.method in SAFE_METHODS or request.method == "PATCH":
            return True
        return getattr(request.user, "role", "") in FULL_ACCESS_ROLES
```

- [ ] **Step 4: Run permission tests — should pass**

```bash
cd backend && python manage.py test jobs.tests.CandidatePermissionTest -v 2
```

Expected: `OK`

- [ ] **Step 5: Commit**

```bash
git add backend/jobs/permissions.py backend/jobs/tests.py
git commit -m "feat: add CandidatePermission"
```

---

### Task 7: Add Candidate views

**Files:**
- Modify: `backend/jobs/views.py`

- [ ] **Step 1: Write API endpoint tests**

Add to `backend/jobs/tests.py`:

```python
import json
from django.urls import reverse


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
```

- [ ] **Step 2: Run tests — fail with 404 (URLs not registered yet)**

```bash
cd backend && python manage.py test jobs.tests.CandidateAPITest -v 2
```

Expected: multiple failures with `404` or `Connection refused`.

- [ ] **Step 3: Add views to `backend/jobs/views.py`**

Add these imports at the top:

```python
from django.utils import timezone
from .models import Candidate, Job, JobApplication
from .permissions import CandidatePermission
from .serializers import CandidateSerializer, CandidateCreateSerializer
```

Add these classes at the bottom of the file:

```python
class CandidateListCreateView(generics.ListCreateAPIView):
    permission_classes = [CandidatePermission]
    parser_classes = [MultiPartParser, FormParser]

    def get_serializer_class(self):
        if self.request.method == "POST":
            return CandidateCreateSerializer
        return CandidateSerializer

    def get_queryset(self):
        qs = Candidate.objects.select_related(
            "application", "job", "recruiter"
        ).all()
        job_id = self.request.query_params.get("job")
        is_pooled = self.request.query_params.get("is_pooled")
        if job_id:
            qs = qs.filter(job_id=job_id)
        if is_pooled == "true":
            qs = qs.filter(is_pooled=True)
        return qs

    def create(self, request, *args, **kwargs):
        serializer = CandidateCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        # Create the JobApplication — signal fires and creates Candidate
        app = JobApplication.objects.create(
            job=data["job"],
            name=data["name"],
            email=data["email"],
            phone_number=data["phone_number"],
            resume=data["resume"],
            expected_salary=data["expected_salary"],
            cover_letter=data.get("cover_letter", ""),
            source=data["source"],
            agreement=True,  # HR is submitting on behalf of the applicant
        )

        # Fetch the auto-created Candidate and optionally set recruiter
        candidate = app.candidate
        recruiter = data.get("recruiter")
        if recruiter:
            candidate.recruiter = recruiter
            candidate.save(update_fields=["recruiter"])

        out = CandidateSerializer(candidate, context={"request": request})
        return Response(out.data, status=201)


class CandidateRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Candidate.objects.select_related("application", "job", "recruiter").all()
    serializer_class = CandidateSerializer
    permission_classes = [CandidatePermission]
    http_method_names = ["get", "patch", "delete", "head", "options"]

    def perform_update(self, serializer):
        instance = serializer.instance
        is_pooled = serializer.validated_data.get("is_pooled", instance.is_pooled)
        pooled_at = instance.pooled_at

        if is_pooled and not instance.is_pooled:
            pooled_at = timezone.now()
        elif not is_pooled:
            pooled_at = None

        serializer.save(pooled_at=pooled_at)
```

---

### Task 8: Wire candidate URLs

**Files:**
- Create: `backend/jobs/urls_candidates.py`
- Modify: `backend/config/urls.py`

- [ ] **Step 1: Create `backend/jobs/urls_candidates.py`**

```python
from django.urls import path
from .views import CandidateListCreateView, CandidateRetrieveUpdateDestroyView

urlpatterns = [
    path("", CandidateListCreateView.as_view(), name="candidate-list-create"),
    path("<int:pk>/", CandidateRetrieveUpdateDestroyView.as_view(), name="candidate-detail"),
]
```

- [ ] **Step 2: Register in `backend/config/urls.py`**

Add the candidates path:

```python
urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/auth/", include("core.urls")),
    path("api/jobs/", include("jobs.urls")),
    path("api/candidates/", include("jobs.urls_candidates")),  # new
]
```

- [ ] **Step 3: Run all candidate API tests**

```bash
cd backend && python manage.py test jobs.tests.CandidateAPITest -v 2
```

Expected: all tests pass (`OK`).

- [ ] **Step 4: Commit**

```bash
git add backend/jobs/serializers.py backend/jobs/views.py backend/jobs/urls_candidates.py backend/config/urls.py backend/jobs/tests.py
git commit -m "feat: add Candidate API endpoints (list, create, detail, patch, delete)"
```

---

### Task 9: Add UserListView for recruiter dropdown

**Files:**
- Modify: `backend/core/serializers.py`
- Modify: `backend/core/views.py`
- Modify: `backend/core/urls.py`

- [ ] **Step 1: Add `UserListSerializer` to `backend/core/serializers.py`**

Append to existing file:

```python
class UserListSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ("id", "name")

    def get_name(self, obj) -> str:
        return obj.get_full_name()
```

- [ ] **Step 2: Add `UserListView` to `backend/core/views.py`**

Append to existing file:

```python
from .serializers import RegisterSerializer, UserSerializer, EmailTokenObtainPairSerializer, UserListSerializer


class UserListView(generics.ListAPIView):
    serializer_class = UserListSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return User.objects.filter(is_active=True).order_by("first_name", "last_name")
```

- [ ] **Step 3: Register URL in `backend/core/urls.py`**

```python
from .views import RegisterView, MeView, EmailTokenObtainPairView, UserListView

urlpatterns = [
    path("register/", RegisterView.as_view(), name="auth-register"),
    path("login/", EmailTokenObtainPairView.as_view(), name="auth-login"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token-refresh"),
    path("me/", MeView.as_view(), name="auth-me"),
    path("users/", UserListView.as_view(), name="user-list"),  # new
]
```

- [ ] **Step 4: Smoke-test the endpoint manually**

```bash
cd backend && python manage.py shell -c "
from django.test import RequestFactory
from core.views import UserListView
print('UserListView registered OK')
"
```

Expected: prints `UserListView registered OK` with no errors.

- [ ] **Step 5: Commit**

```bash
git add backend/core/serializers.py backend/core/views.py backend/core/urls.py
git commit -m "feat: add GET /api/auth/users/ endpoint for recruiter dropdown"
```

---

## Chunk 3: Frontend Foundation — Types, API Layer, Seeds, AppContext

### File Map

| Action | File |
|---|---|
| Modify | `frontend/src/data/types.ts` |
| Create | `frontend/src/api/candidates.ts` |
| Modify | `frontend/src/data/seeds.ts` |
| Modify | `frontend/src/context/AppContext.tsx` |

---

### Task 10: Update TypeScript types

**Files:**
- Modify: `frontend/src/data/types.ts`

- [ ] **Step 1: Replace `Candidate` interface and remove `PoolCandidate`**

The new `Candidate` type maps exactly to the API response shape. Replace the existing `Candidate` and `PoolCandidate` interfaces with:

```typescript
// Remove PoolCandidate entirely.
// Replace Candidate with:

export interface ApplicationNested {
  id: number;
  name: string;
  email: string;
  phone_number: string;
  resume: string;
  expected_salary: string;
  source: string;
  created_at: string;
}

export interface JobNested {
  id: number;
  title: string;
  location: string;
}

export interface RecruiterNested {
  id: number;
  name: string;
}

export interface Candidate {
  id: number;
  stage: Stage;
  rating: number;           // 0 = unrated, 1–5 stars
  recruiter: RecruiterNested | null;
  notes: string;
  exam_result: string | null;
  endorsed_from: string | null;
  is_pooled: boolean;
  pooled_at: string | null;
  created_at: string;
  application: ApplicationNested;
  job: JobNested;
}
```

Keep all other types (`Stage`, `Source`, `Job`, `Toast`, etc.) unchanged.

- [ ] **Step 2: Check for TypeScript errors**

```bash
cd frontend && npx tsc --noEmit 2>&1 | head -60
```

Expected: many errors — that's expected at this stage because AppContext and components still reference the old shape. We'll fix them in subsequent tasks.

---

### Task 11: Create candidates API layer

**Files:**
- Create: `frontend/src/api/candidates.ts`

- [ ] **Step 1: Create `frontend/src/api/candidates.ts`**

Model this after the existing pattern in `frontend/src/api/jobs.ts` — read that file first to confirm the auth header pattern, then write:

```typescript
/**
 * Candidate API — wraps all /api/candidates/ calls.
 * Uses the same Bearer-token pattern as api/jobs.ts.
 */

import type { Candidate } from "../data/types";

const API_BASE = "http://localhost:8000/api/candidates";

function authHeaders(): Record<string, string> {
  const token = localStorage.getItem("access_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export interface ListCandidatesParams {
  job?: number;
  is_pooled?: boolean;
}

export async function listCandidates(params?: ListCandidatesParams): Promise<Candidate[]> {
  const query = new URLSearchParams();
  if (params?.job !== undefined) query.set("job", String(params.job));
  if (params?.is_pooled !== undefined) query.set("is_pooled", String(params.is_pooled));
  const url = query.toString() ? `${API_BASE}/?${query}` : `${API_BASE}/`;
  const res = await fetch(url, { headers: authHeaders() });
  if (!res.ok) throw new Error("Failed to fetch candidates.");
  return res.json();
}

export async function getCandidate(id: number): Promise<Candidate> {
  const res = await fetch(`${API_BASE}/${id}/`, { headers: authHeaders() });
  if (!res.ok) throw new Error("Failed to fetch candidate.");
  return res.json();
}

export async function createCandidate(formData: FormData): Promise<Candidate> {
  const res = await fetch(`${API_BASE}/`, {
    method: "POST",
    headers: authHeaders(),   // no Content-Type — browser sets multipart boundary
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(JSON.stringify(err));
  }
  return res.json();
}

export async function updateCandidate(
  id: number,
  data: Partial<Pick<Candidate, "stage" | "rating" | "notes" | "is_pooled">> & {
    recruiter_id?: number | null;
  }
): Promise<Candidate> {
  const res = await fetch(`${API_BASE}/${id}/`, {
    method: "PATCH",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update candidate.");
  return res.json();
}

export async function deleteCandidate(id: number): Promise<void> {
  const res = await fetch(`${API_BASE}/${id}/`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Failed to delete candidate.");
}
```

---

### Task 12: Clean up seeds.ts

**Files:**
- Modify: `frontend/src/data/seeds.ts`

- [ ] **Step 1: Read seeds.ts to understand what it exports**

```bash
head -30 frontend/src/data/seeds.ts
```

- [ ] **Step 2: Remove INIT_CANDIDATES and INIT_POOL, keep INIT_JOBS**

In `frontend/src/data/seeds.ts`:
- Remove the `INIT_CANDIDATES` export and all candidate seed data
- Remove the `INIT_POOL` export and all pool seed data
- Keep `INIT_JOBS` unchanged (seeded jobs remain until fully migrated)

Replace the exports with:

```typescript
export const INIT_CANDIDATES: never[] = [];
export const INIT_POOL: never[] = [];
```

This preserves the named exports so AppContext doesn't break before we update it, but empties the seeded data.

---

### Task 13: Update AppContext

**Files:**
- Modify: `frontend/src/context/AppContext.tsx`

This is the largest single change. Read the file in full before making any edits.

- [ ] **Step 1: Update imports and state shape**

Remove `PoolCandidate` from imports. Add import for `listCandidates`:

```typescript
import type { Candidate, Job, FillTag, Toast } from "../data/types";
import { INIT_JOBS } from "../data/seeds";
import { listJobs } from "../api/jobs";
import { listCandidates, createCandidate, updateCandidate } from "../api/candidates";
```

Update `AppState` — remove `pool` and `selectedPoolCandidate`, add `nqCandidate` cleanup:

```typescript
export interface AppState {
  candidates: Candidate[];
  jobs: Job[];
  selectedCandidate: Candidate | null;
  showAddModal: boolean;
  showJobModal: boolean;
  editJob: Job | null;
  fillTags: Record<number, FillTag | undefined>;
  filterStage: string;
  filterRole: string;
  toasts: Toast[];
}
```

Update `initialState`:

```typescript
const initialState: AppState = {
  candidates: [],
  jobs: INIT_JOBS,
  selectedCandidate: null,
  showAddModal: false,
  showJobModal: false,
  editJob: null,
  fillTags: {},
  filterStage: "All",
  filterRole: "All",
  toasts: [],
};
```

- [ ] **Step 2: Update action types**

Remove these action types entirely:
- `SELECT_POOL_CANDIDATE`
- `SET_NQ_CANDIDATE` / `SET_NQ_ACTION` / `SET_NQ_JOB`
- `ENDORSE_CANDIDATE`
- `REACTIVATE_POOL`
- `MARK_NOT_QUALIFIED`
- `NQ_ENDORSE`

Keep and update:
- `ADD_CANDIDATE` — payload stays `Candidate` (the API response)
- `MOVE_STAGE` — stays the same shape
- `UPDATE_CANDIDATE` — stays the same shape

```typescript
export type AppAction =
  | { type: "SET_FILTER_STAGE"; payload: string }
  | { type: "SET_FILTER_ROLE"; payload: string }
  | { type: "SELECT_CANDIDATE"; payload: Candidate | null }
  | { type: "SET_SHOW_ADD_MODAL"; payload: boolean }
  | { type: "SET_SHOW_JOB_MODAL"; payload: boolean }
  | { type: "SET_EDIT_JOB"; payload: Job | null }
  | { type: "TOGGLE_FILL_TAG"; payload: { jobId: number; tag: FillTag } }
  | { type: "MOVE_STAGE"; payload: { id: number; stage: string } }
  | { type: "UPDATE_CANDIDATE"; payload: { id: number; updates: Partial<Candidate> } }
  | { type: "ADD_CANDIDATE"; payload: Candidate }
  | { type: "SET_API_CANDIDATES"; payload: Candidate[] }
  | { type: "ADD_JOB"; payload: Job }
  | { type: "UPDATE_JOB"; payload: Job }
  | { type: "DELETE_JOB"; payload: { id: number; source?: "api" } }
  | { type: "SET_API_JOBS"; payload: Job[] }
  | { type: "ADD_TOAST"; payload: Toast }
  | { type: "REMOVE_TOAST"; payload: string };
```

- [ ] **Step 3: Update reducer cases**

Replace candidate mutation cases with simplified API-backed versions:

```typescript
case "SET_API_CANDIDATES":
  return { ...state, candidates: action.payload };

case "ADD_CANDIDATE":
  return {
    ...state,
    candidates: [action.payload, ...state.candidates],
    showAddModal: false,
  };

case "MOVE_STAGE": {
  const { id, stage } = action.payload;
  const candidates = state.candidates.map((c) =>
    c.id === id ? { ...c, stage: stage as Candidate["stage"] } : c
  );
  const selectedCandidate =
    state.selectedCandidate?.id === id
      ? { ...state.selectedCandidate, stage: stage as Candidate["stage"] }
      : state.selectedCandidate;
  return { ...state, candidates, selectedCandidate };
}

case "UPDATE_CANDIDATE": {
  const { id, updates } = action.payload;
  const candidates = state.candidates.map((c) =>
    c.id === id ? { ...c, ...updates } : c
  );
  const selectedCandidate =
    state.selectedCandidate?.id === id
      ? { ...state.selectedCandidate, ...updates }
      : state.selectedCandidate;
  return { ...state, candidates, selectedCandidate };
}

// ADD_TO_POOL is NOT in the reducer — use UPDATE_CANDIDATE instead.
// CandidateDrawer calls updateCandidate(id, { is_pooled: true }), then
// dispatches UPDATE_CANDIDATE with the full API response so pooled_at
// is correctly set from the server timestamp (not a local approximation).
```

Remove `ENDORSE_CANDIDATE`, `REACTIVATE_POOL`, `MARK_NOT_QUALIFIED`, `NQ_ENDORSE`, `SELECT_POOL_CANDIDATE`, `SET_NQ_CANDIDATE`, `SET_NQ_ACTION`, `SET_NQ_JOB` cases entirely.

- [ ] **Step 4: Update AppProvider useEffect to fetch candidates**

Replace the existing `useEffect` that only fetches jobs:

```typescript
useEffect(() => {
  const token = localStorage.getItem("access_token");
  if (!token) return;

  listJobs()
    .then((apiJobs) => dispatch({ type: "SET_API_JOBS", payload: apiJobs }))
    .catch(() => {});

  listCandidates()
    .then((candidates) => dispatch({ type: "SET_API_CANDIDATES", payload: candidates }))
    .catch(() => {});
}, []);
```

- [ ] **Step 5: Check TypeScript errors**

```bash
cd frontend && npx tsc --noEmit 2>&1 | head -80
```

Expected: errors in components that reference removed fields — we'll fix those in Chunk 4.

- [ ] **Step 6: Commit**

```bash
git add frontend/src/data/types.ts frontend/src/api/candidates.ts frontend/src/data/seeds.ts frontend/src/context/AppContext.tsx
git commit -m "feat: update frontend types, API layer, and AppContext for persistent candidates"
```

---

## Chunk 4: Frontend UI — Components and Pages

### File Map

| Action | File |
|---|---|
| Modify | `frontend/src/modals/AddCandidateModal.tsx` |
| Modify | `frontend/src/pages/Pipeline.tsx` |
| Modify | `frontend/src/pages/Candidates.tsx` |
| Modify | `frontend/src/pages/TalentPool.tsx` |
| Modify | `frontend/src/modals/PoolDrawer.tsx` |
| Modify | `frontend/src/modals/CandidateDrawer.tsx` |
| Modify | `frontend/src/modals/NotQualifiedModal.tsx` — likely to delete or simplify |

---

### Task 14: Redesign AddCandidateModal

**Files:**
- Modify: `frontend/src/modals/AddCandidateModal.tsx`

The modal submits `multipart/form-data` to `POST /api/candidates/`. It fetches jobs from `state.jobs` (already in AppContext) and users from `GET /api/auth/users/`.

- [ ] **Step 1: Read the current modal**

Already done in the planning phase — it has Name, Email, Role (from candidate roles), Recruiter (hardcoded), Source dropdowns.

- [ ] **Step 2: Rewrite `AddCandidateModal.tsx`**

```tsx
/**
 * Add Candidate Modal — HR creates a candidate directly, bypassing the public
 * application portal. Mirrors application portal fields plus HR-specific inputs.
 * Submits multipart/form-data to POST /api/candidates/.
 */

import { useState, useEffect, useRef, type FC } from "react";
import { useApp } from "../context/AppContext";
import { useMobile } from "../hooks/useMediaQuery";
import { createCandidate } from "../api/candidates";
import { XIcon } from "../components/icons";

interface UserOption {
  id: number;
  name: string;
}

const SOURCES = ["Website", "LinkedIn", "Indeed", "Referral", "Endorsed", "Other"] as const;

const AddCandidateModal: FC = () => {
  const { state, dispatch } = useApp();
  const mob = useMobile();
  const { showAddModal, jobs } = state;
  const activeJobs = jobs.filter((j) => j.status === "Active" && j.source === "api");

  const [users, setUsers] = useState<UserOption[]>([]);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone_number: "",
    expected_salary: "",
    cover_letter: "",
    source: "Website" as string,
    job_id: activeJobs[0]?.id?.toString() || "",
    recruiter_id: "",
  });
  const [resume, setResume] = useState<File | null>(null);

  useEffect(() => {
    if (!showAddModal) return;
    const token = localStorage.getItem("access_token");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    // Pre-set jobsLoading — jobs come from AppContext (already fetched on mount)
    // but we need to wait one tick for activeJobs to be populated
    setJobsLoading(activeJobs.length === 0);

    fetch("http://localhost:8000/api/auth/users/", { headers })
      .then((r) => r.json())
      .then(setUsers)
      .catch(() => {});
  }, [showAddModal, activeJobs.length]);

  if (!showAddModal) return null;

  const close = () => {
    dispatch({ type: "SET_SHOW_ADD_MODAL", payload: false });
    setError(null);
  };

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.phone_number || !form.expected_salary || !resume || !form.job_id) {
      setError("Please fill in all required fields and attach a resume.");
      return;
    }

    const fd = new FormData();
    fd.append("name", form.name);
    fd.append("email", form.email);
    fd.append("phone_number", form.phone_number);
    fd.append("expected_salary", form.expected_salary);
    fd.append("cover_letter", form.cover_letter);
    fd.append("source", form.source);
    fd.append("job_id", form.job_id);
    fd.append("resume", resume);
    if (form.recruiter_id) fd.append("recruiter_id", form.recruiter_id);

    setLoading(true);
    setError(null);
    try {
      const candidate = await createCandidate(fd);
      dispatch({ type: "ADD_CANDIDATE", payload: candidate });
      dispatch({
        type: "ADD_TOAST",
        payload: { id: Date.now().toString(), message: "Candidate added successfully.", variant: "success" },
      });
    } catch {
      setError("Failed to add candidate. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inp =
    "w-full px-3.5 py-2.5 rounded-[var(--radius-md)] border border-[var(--color-surface-muted)] bg-[var(--color-surface)] text-[13.5px] text-[var(--color-text-primary)] outline-none font-[inherit] transition-colors focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-light)]";

  return (
    <div
      className="fixed inset-0 z-100 flex items-center justify-center bg-[rgba(10,22,40,0.5)] backdrop-blur-[3px]"
      style={mob ? { alignItems: "flex-end" } : {}}
      onClick={close}
    >
      <div
        className={`${mob ? "w-full rounded-t-[20px]" : "w-[560px] rounded-[20px]"} max-h-[90vh] bg-[var(--color-surface)] overflow-y-auto shadow-[var(--shadow-modal)]`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-5 flex justify-between items-center border-b border-[var(--color-surface-border)]">
          <div>
            <h2 className="text-[17px] font-bold text-[var(--color-text-heading)]">Add Candidate</h2>
            <p className="text-[12px] text-[var(--color-text-secondary)] mt-0.5">
              Fill in the candidate details below
            </p>
          </div>
          <button
            onClick={close}
            className="bg-[var(--color-surface-hover)] hover:bg-[var(--color-surface-bg)] border-none cursor-pointer text-[var(--color-text-muted)] flex rounded-[var(--radius-md)] p-1.5 transition-colors"
          >
            <XIcon />
          </button>
        </div>

        <div className="px-6 py-5 flex flex-col gap-4">
          {/* Row 1: Name + Email */}
          <div className={`grid ${mob ? "grid-cols-1" : "grid-cols-2"} gap-3.5`}>
            <div>
              <label className="text-[11px] font-bold text-[var(--color-text-subtle)] uppercase tracking-wide block mb-1.5">
                Full Name <span className="text-[var(--color-danger)]">*</span>
              </label>
              <input className={inp} placeholder="Jane Doe" value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <label className="text-[11px] font-bold text-[var(--color-text-subtle)] uppercase tracking-wide block mb-1.5">
                Email <span className="text-[var(--color-danger)]">*</span>
              </label>
              <input className={inp} type="email" placeholder="jane@email.com" value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
          </div>

          {/* Row 2: Phone + Expected Salary */}
          <div className={`grid ${mob ? "grid-cols-1" : "grid-cols-2"} gap-3.5`}>
            <div>
              <label className="text-[11px] font-bold text-[var(--color-text-subtle)] uppercase tracking-wide block mb-1.5">
                Phone Number <span className="text-[var(--color-danger)]">*</span>
              </label>
              <input className={inp} placeholder="09171234567" value={form.phone_number}
                onChange={(e) => setForm({ ...form, phone_number: e.target.value })} />
            </div>
            <div>
              <label className="text-[11px] font-bold text-[var(--color-text-subtle)] uppercase tracking-wide block mb-1.5">
                Expected Salary <span className="text-[var(--color-danger)]">*</span>
              </label>
              <input className={inp} type="number" placeholder="25000" value={form.expected_salary}
                onChange={(e) => setForm({ ...form, expected_salary: e.target.value })} />
            </div>
          </div>

          {/* Row 3: Role + Recruiter */}
          <div className={`grid ${mob ? "grid-cols-1" : "grid-cols-2"} gap-3.5`}>
            <div>
              <label className="text-[11px] font-bold text-[var(--color-text-subtle)] uppercase tracking-wide block mb-1.5">
                Role (Job) <span className="text-[var(--color-danger)]">*</span>
              </label>
              <select className={inp} value={form.job_id}
                disabled={jobsLoading}
                onChange={(e) => setForm({ ...form, job_id: e.target.value })}>
                {jobsLoading
                  ? <option value="">Loading jobs…</option>
                  : <>
                      <option value="">Select a job…</option>
                      {activeJobs.map((j) => (
                        <option key={j.id} value={j.id}>{j.title}</option>
                      ))}
                    </>
                }
              </select>
            </div>
            <div>
              <label className="text-[11px] font-bold text-[var(--color-text-subtle)] uppercase tracking-wide block mb-1.5">
                Recruiter
              </label>
              <select className={inp} value={form.recruiter_id}
                onChange={(e) => setForm({ ...form, recruiter_id: e.target.value })}>
                <option value="">Unassigned</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 4: Source */}
          <div>
            <label className="text-[11px] font-bold text-[var(--color-text-subtle)] uppercase tracking-wide block mb-1.5">
              Source <span className="text-[var(--color-danger)]">*</span>
            </label>
            <select className={inp} value={form.source}
              onChange={(e) => setForm({ ...form, source: e.target.value })}>
              {SOURCES.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>

          {/* Row 5: Resume */}
          <div>
            <label className="text-[11px] font-bold text-[var(--color-text-subtle)] uppercase tracking-wide block mb-1.5">
              Resume <span className="text-[var(--color-danger)]">*</span>
            </label>
            <input ref={fileRef} type="file" accept=".pdf,.doc,.docx"
              className="hidden" onChange={(e) => setResume(e.target.files?.[0] || null)} />
            <button
              type="button"
              className={`${inp} text-left cursor-pointer ${resume ? "text-[var(--color-text-primary)]" : "text-[var(--color-text-muted)]"}`}
              onClick={() => fileRef.current?.click()}
            >
              {resume ? resume.name : "Click to upload resume (PDF, DOC)"}
            </button>
          </div>

          {/* Row 6: Cover Letter */}
          <div>
            <label className="text-[11px] font-bold text-[var(--color-text-subtle)] uppercase tracking-wide block mb-1.5">
              Cover Letter
            </label>
            <textarea className={`${inp} resize-none h-20`} placeholder="Optional cover letter…"
              value={form.cover_letter}
              onChange={(e) => setForm({ ...form, cover_letter: e.target.value })} />
          </div>

          {error && (
            <p className="text-[12px] text-[var(--color-danger)]">{error}</p>
          )}

          <div className="flex gap-2.5 pt-1 justify-end border-t border-[var(--color-surface-border)] mt-1">
            <button
              className="border border-[var(--color-surface-muted)] text-[var(--color-text-subtle)] rounded-[var(--radius-md)] px-5 py-2.5 text-[13.5px] font-semibold bg-transparent cursor-pointer hover:bg-[var(--color-surface-hover)] transition-colors"
              onClick={close}
            >
              Cancel
            </button>
            <button
              disabled={loading}
              className="bg-[var(--color-primary)] text-white rounded-[var(--radius-md)] px-5 py-2.5 text-[13.5px] font-semibold shadow-[var(--shadow-btn)] cursor-pointer hover:bg-[var(--color-primary-hover)] transition-colors active:scale-[0.98] disabled:opacity-60"
              onClick={handleSubmit}
            >
              {loading ? "Adding…" : "Add Candidate"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddCandidateModal;
```

- [ ] **Step 3: Commit**

```bash
git add frontend/src/modals/AddCandidateModal.tsx
git commit -m "feat: redesign AddCandidateModal with full application fields wired to API"
```

---

### Task 15: Fix Pipeline.tsx

**Files:**
- Modify: `frontend/src/pages/Pipeline.tsx`

- [ ] **Step 1: Read Pipeline.tsx**

```bash
cat frontend/src/pages/Pipeline.tsx
```

- [ ] **Step 2: Update to use new Candidate shape**

Key changes:
- Replace any reference to `c.role` with `c.job.title`
- Replace any reference to `c.avatar` with computed initials: `c.application.name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2)`
- Replace any reference to `c.tags` or `c.talents` with nothing (removed)
- Replace any reference to `c.recruiter` (was string) with `c.recruiter?.name ?? "Unassigned"`
- Replace any reference to `c.name` with `c.application.name`
- Replace any reference to `c.jobId` with `c.job.id`
- The pipeline should filter candidates by the selected job: `candidates.filter(c => c.job.id === selectedJobId)`
- `MOVE_STAGE` dispatch: the shape is unchanged (`{ id, stage }`)

- [ ] **Step 3: Verify no TypeScript errors in Pipeline.tsx**

```bash
cd frontend && npx tsc --noEmit 2>&1 | grep "Pipeline"
```

Expected: no errors mentioning Pipeline.tsx.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/pages/Pipeline.tsx
git commit -m "feat: wire Pipeline.tsx to real Candidate API shape"
```

---

### Task 16: Fix Candidates.tsx

**Files:**
- Modify: `frontend/src/pages/Candidates.tsx`

- [ ] **Step 1: Read Candidates.tsx**

```bash
cat frontend/src/pages/Candidates.tsx
```

- [ ] **Step 2: Update to use new Candidate shape**

Key changes:
- Same field remapping as Pipeline (avatar → computed initials, role → job.title, name → application.name, recruiter string → recruiter?.name, jobId → job.id)
- Keep "Add Candidate" button — it dispatches `SET_SHOW_ADD_MODAL: true` (unchanged)
- The filter `filterRole` now matches against `c.job.title` instead of `c.role`
- The filter `filterStage` matches against `c.stage` (unchanged)

- [ ] **Step 3: Check TypeScript**

```bash
cd frontend && npx tsc --noEmit 2>&1 | grep "Candidates"
```

- [ ] **Step 4: Commit**

```bash
git add frontend/src/pages/Candidates.tsx
git commit -m "feat: wire Candidates.tsx to real Candidate API shape"
```

---

### Task 17: Fix TalentPool.tsx and PoolDrawer.tsx

**Files:**
- Modify: `frontend/src/pages/TalentPool.tsx`
- Modify: `frontend/src/modals/PoolDrawer.tsx`

- [ ] **Step 1: Read both files**

```bash
cat frontend/src/pages/TalentPool.tsx
cat frontend/src/modals/PoolDrawer.tsx
```

- [ ] **Step 2: Update TalentPool.tsx**

Key changes:
- Replace `state.pool` with `state.candidates.filter(c => c.is_pooled)`
- Replace `PoolCandidate` type references with `Candidate`
- Replace `SELECT_POOL_CANDIDATE` dispatch with `SELECT_CANDIDATE`
- Field remapping: same as above (avatar → initials, name → application.name, etc.)
- `lastStage` → `c.stage` (Candidate still has stage when pooled)
- `pooledDate` → `c.pooled_at` (format as date string)
- `closedJob` → `c.job.title`

- [ ] **Step 3: Update PoolDrawer.tsx**

Key changes:
- Replace `PoolCandidate` type with `Candidate`
- Replace `state.selectedPoolCandidate` with `state.selectedCandidate`
- `REACTIVATE_POOL` action → call `updateCandidate(id, { is_pooled: false })` then dispatch `UPDATE_CANDIDATE` with the full API response (which has `pooled_at: null`) — use `{ id, updates: apiResponse }` not a hard-coded `{ is_pooled: false, pooled_at: null }`
- Field remapping same as above

- [ ] **Step 4: Check TypeScript**

```bash
cd frontend && npx tsc --noEmit 2>&1 | grep -E "TalentPool|PoolDrawer"
```

- [ ] **Step 5: Commit**

```bash
git add frontend/src/pages/TalentPool.tsx frontend/src/modals/PoolDrawer.tsx
git commit -m "feat: wire TalentPool and PoolDrawer to candidates.is_pooled"
```

---

### Task 18: Fix CandidateDrawer.tsx

**Files:**
- Modify: `frontend/src/modals/CandidateDrawer.tsx`

- [ ] **Step 1: Read CandidateDrawer.tsx**

```bash
cat frontend/src/modals/CandidateDrawer.tsx
```

- [ ] **Step 2: Update CandidateDrawer**

Key changes:
- Field remapping: `c.name` → `c.application.name`, `c.email` → `c.application.email`, `c.role` → `c.job.title`, etc.
- Stage changes: call `updateCandidate(c.id, { stage })` then dispatch `MOVE_STAGE`
- Rating changes: call `updateCandidate(c.id, { rating })` then dispatch `UPDATE_CANDIDATE`
- Notes changes: call `updateCandidate(c.id, { notes })` then dispatch `UPDATE_CANDIDATE`
- Pool action: call `updateCandidate(c.id, { is_pooled: true })`; on success, dispatch `UPDATE_CANDIDATE` with `{ id: c.id, updates: apiResponse }` — this correctly sets `pooled_at` from the server timestamp (do NOT dispatch `ADD_TO_POOL`)
- Remove references to `MARK_NOT_QUALIFIED`, `ENDORSE_CANDIDATE`, `NQ_ENDORSE` actions
- Remove `NotQualifiedModal` trigger if present — the NQ workflow is being removed

- [ ] **Step 3: Check TypeScript — zero errors expected**

```bash
cd frontend && npx tsc --noEmit 2>&1
```

Expected: 0 errors.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/modals/CandidateDrawer.tsx
git commit -m "feat: wire CandidateDrawer to live PATCH API calls"
```

---

### Task 19: Final smoke test

- [ ] **Step 1: Run backend test suite**

```bash
cd backend && python manage.py test jobs -v 2
```

Expected: all tests pass.

- [ ] **Step 2: Start both servers**

```bash
# Terminal 1
cd backend && python manage.py runserver

# Terminal 2
cd frontend && npm run dev
```

- [ ] **Step 3: Manual verification checklist**

- [ ] Submit a job application via the public Careers page → open Django admin → confirm a `Candidate` row was auto-created at stage `"Applied"`
- [ ] Open the Pipeline page → confirm the new candidate appears in the "Applied" column
- [ ] Drag or move the candidate to "Screening" → confirm stage updates in DB
- [ ] Open Add Candidate modal → fill all fields → submit → confirm candidate appears in Pipeline
- [ ] Open Candidates page → confirm list loads from API, "Add Candidate" button is visible
- [ ] Open Talent Pool → pool a candidate from the drawer → confirm they appear in Talent Pool
- [ ] Reactivate a pool candidate → confirm `is_pooled` flips to false, candidate leaves pool view

- [ ] **Step 4: Final commit**

```bash
git add .
git commit -m "feat: complete Candidate & Talent Pool backend+frontend integration"
```
