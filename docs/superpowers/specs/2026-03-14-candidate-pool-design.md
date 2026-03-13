# Candidate & Talent Pool — Design Spec
**Date:** 2026-03-14
**Project:** Bluewater Jobs ATS
**Status:** Approved

---

## Overview

Implement a persistent `Candidate` model linked to `JobApplication`. Candidates are auto-created when an application is submitted and appear immediately in the Pipeline under the "Applied" stage. The Talent Pool is not a separate model — it is a filtered view of candidates where `is_pooled = True`.

---

## 1. Data Model

### `Candidate` (new, in `jobs` app)

```python
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

    application   = models.OneToOneField(JobApplication, on_delete=models.CASCADE, related_name="candidate")
    job           = models.ForeignKey(Job, on_delete=models.CASCADE, related_name="candidates")
    # `job` is a deliberate denormalization of `application.job` to allow direct
    # filtering (e.g. Candidate.objects.filter(job=x)) without joining through application.
    recruiter     = models.ForeignKey(User, null=True, blank=True, on_delete=models.SET_NULL)
    stage         = models.CharField(max_length=50, choices=STAGE_CHOICES, default="Applied")
    rating        = models.IntegerField(default=0)  # 0 = unrated, 1–5 stars
    notes         = models.TextField(blank=True, default="")
    exam_result   = models.FileField(upload_to="exam-results/", null=True, blank=True)
    endorsed_from = models.CharField(max_length=200, blank=True, null=True)
    is_pooled     = models.BooleanField(default=False)
    pooled_at     = models.DateTimeField(null=True, blank=True)
    created_at    = models.DateTimeField(auto_now_add=True)
```

**Deliberately excluded:**
- `avatar` — generated from name initials on the frontend, not stored
- `tags` / `talents` — removed; job title from the linked `Job` serves this purpose

### Auto-Creation Signal

The signal lives in `jobs/signals.py` and is registered via the `ready()` hook in `jobs/apps.py`:

Add a `ready()` hook to the existing `jobs/apps.py`:

```python
# jobs/apps.py
class JobsConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "jobs"

    def ready(self):
        import jobs.signals  # noqa: F401
```

No change to `INSTALLED_APPS` is needed — Django auto-selects the sole `AppConfig` subclass (`JobsConfig`) found in `jobs/apps.py`. If a second subclass is ever added to `jobs/apps.py`, `INSTALLED_APPS` must be updated to the explicit path `"jobs.apps.JobsConfig"` to prevent silent signal loss.

```python
# jobs/signals.py
from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import JobApplication, Candidate

@receiver(post_save, sender=JobApplication)
def create_candidate(sender, instance, created, **kwargs):
    if created:
        Candidate.objects.create(
            application=instance,
            job=instance.job,
        )
```

This ensures every applicant lands in the "Applied" column of the Pipeline with zero HR intervention.

### Pool Toggle Behavior

When `PATCH /api/candidates/{id}/` sets `is_pooled: true`, the backend automatically sets `pooled_at` to the current timestamp. When `is_pooled` is set back to `false`, `pooled_at` is cleared. No separate `PoolCandidate` model is needed.

This logic lives in `perform_update` on the `CandidateViewSet`:

```python
def perform_update(self, serializer):
    is_pooled = serializer.validated_data.get("is_pooled", serializer.instance.is_pooled)
    pooled_at = serializer.instance.pooled_at
    if is_pooled and not serializer.instance.is_pooled:
        pooled_at = timezone.now()
    elif not is_pooled:
        pooled_at = None
    serializer.save(pooled_at=pooled_at)
```

### Default Field Values

| Field | Default | Notes |
|---|---|---|
| `stage` | `"Applied"` | Set on creation |
| `recruiter` | `null` | Unassigned until HR picks it up |
| `rating` | `0` | 0 = unrated |
| `notes` | `""` | Empty |
| `exam_result` | `null` | Uploaded at Exam stage |
| `endorsed_from` | `null` | Only relevant for endorsed applicants |
| `is_pooled` | `False` | Not pooled by default |
| `pooled_at` | `null` | Set when `is_pooled` flips to `True` |

---

## 2. API Endpoints

All endpoints require authentication. `DELETE` is restricted to `hr_manager` and `talent_acquisition_manager`. `PATCH` is open to all authenticated roles.

```
GET    /api/candidates/                  → list all candidates
GET    /api/candidates/?job={id}         → pipeline view for a specific job
GET    /api/candidates/?is_pooled=true   → talent pool view
GET    /api/candidates/{id}/             → candidate detail
POST   /api/candidates/                  → manually create a candidate (HR-only, internal)
PATCH  /api/candidates/{id}/             → update stage, recruiter, rating, notes, exam_result, is_pooled
DELETE /api/candidates/{id}/             → delete candidate (role-gated)
```

**Permissions:** A new `CandidatePermission` class is added to `jobs/permissions.py`, following the same pattern as `JobPermission`:
- Safe methods (`GET`): any authenticated user
- `POST`: `hr_manager` and `talent_acquisition_manager` only
- `PATCH`: any authenticated user
- `DELETE`: `hr_manager` and `talent_acquisition_manager` only

**URL Registration:** A new file `jobs/urls_candidates.py` is created for these routes and mounted in `config/urls.py`:

```python
# config/urls.py
path("api/candidates/", include("jobs.urls_candidates")),
```

### Serializer Response Shape

The `recruiter` nested object uses `get_full_name()` from Django's `AbstractUser` (i.e., `first_name + " " + last_name`). The `RecruiterSerializer` maps this to `"name"` via a `SerializerMethodField`.

The `application` nested object uses a new trimmed `ApplicationNestedSerializer` (not the existing `JobApplicationSerializer`) that exposes only: `id`, `name`, `email`, `phone_number`, `resume`, `expected_salary`, `source`, `created_at`. The fields `cover_letter` and `agreement` are intentionally excluded.

```json
{
  "id": 1,
  "stage": "Applied",
  "rating": 0,
  "recruiter": { "id": 2, "name": "Joela Santos" },
  "notes": "",
  "exam_result": null,
  "endorsed_from": null,
  "is_pooled": false,
  "pooled_at": null,
  "created_at": "2026-03-14T10:00:00Z",
  "application": {
    "id": 1,
    "name": "Angelica Torres",
    "email": "angelica@email.com",
    "phone_number": "09171234567",
    "resume": "/media/applications/job-1/resume.pdf",
    "expected_salary": "25000.00",
    "source": "Website",
    "created_at": "2026-03-14T09:55:00Z"
  },
  "job": {
    "id": 1,
    "title": "Head Chef",
    "location": "Bluewater Maribago"
  }
}
```

The nested job object is serialized by a new `JobTrimmedSerializer` exposing only `id`, `title`, and `location`. The `location` field serializes to the raw choice key (e.g. `"Bluewater Maribago"`), which is acceptable here because the choice keys and display labels are identical. If keys ever diverge from labels, this field will need `get_location_display()`.

```
```

---

## 3. Frontend Changes

### New API Layer

**File:** `frontend/src/api/candidates.ts`

```
listCandidates(params?)      → GET /api/candidates/
getCandidate(id)             → GET /api/candidates/{id}/
createCandidate(formData)    → POST /api/candidates/   (multipart, for manual HR add)
updateCandidate(id, data)    → PATCH /api/candidates/{id}/
deleteCandidate(id)          → DELETE /api/candidates/{id}/
```

### AppContext Changes

- Remove `PoolCandidate` state and all pool-related actions
- Talent pool is now derived: `candidates.filter(c => c.is_pooled)`
- Replace seeded `Candidate` state with API-fetched data

**Reducer cases to remove entirely** (they depend on the old `Candidate` shape and are no longer valid):
- `ENDORSE_CANDIDATE`
- `NQ_ENDORSE`
- `MARK_NOT_QUALIFIED`

**Reducer cases to update** (replace local state mutation with API call):
- `ADD_CANDIDATE` → calls `createCandidate(formData)`; on success, appends the returned `Candidate` to state
- `MOVE_STAGE` → calls `updateCandidate(id, { stage })`
- `ADD_TO_POOL` → calls `updateCandidate(id, { is_pooled: true })`
- `REACTIVATE_POOL` → calls `updateCandidate(id, { is_pooled: false })`; on success, dispatch `UPDATE_CANDIDATE` with `{ is_pooled: false, pooled_at: null }` to optimistically update local state (no re-fetch needed)

### Page & Component Updates

| Component | Change |
|---|---|
| `Pipeline.tsx` | Fetch from `GET /api/candidates/?job={id}`, replace seeded data |
| `Candidates.tsx` | Fetch from `GET /api/candidates/`, replace seeded data; retain "Add Candidate" button |
| `TalentPool.tsx` | Fetch from `GET /api/candidates/?is_pooled=true`; drop `PoolCandidate` type |
| `CandidateDrawer.tsx` | Wire `PATCH` calls for notes, rating, recruiter, stage edits |
| `Dashboard.tsx` | Retain "Add Candidate" button |
| `AddCandidateModal.tsx` | Redesign with new fields (see below); wire to `POST /api/candidates/` |
| `seeds.ts` | Remove seeded candidates and pool candidates |
| `types.ts` | Remove `PoolCandidate` type; update `Candidate` to match API shape |

### AddCandidateModal — Redesigned Fields

The modal mirrors the public application portal fields, with HR-specific additions. It submits as `multipart/form-data` to `POST /api/candidates/`.

| Field | Type | Required | Notes |
|---|---|---|---|
| Full Name | text input | Yes | Maps to `JobApplication.name` |
| Email | email input | Yes | Maps to `JobApplication.email` |
| Phone Number | text input | Yes | Maps to `JobApplication.phone_number` |
| Resume | file upload | Yes | Maps to `JobApplication.resume` |
| Expected Salary | number input | Yes | Maps to `JobApplication.expected_salary` |
| Cover Letter | textarea | No | Maps to `JobApplication.cover_letter` |
| Role | dropdown | Yes | Populated from `GET /api/jobs/` (active jobs); value = `job.id`; maps to `Candidate.job` |
| Recruiter | dropdown | No | Populated from `GET /api/users/` (HR users); value = `user.id`; maps to `Candidate.recruiter` |
| Source | dropdown | Yes | Choices: Website, LinkedIn, Indeed, Referral, Endorsed, Other; maps to `JobApplication.source` |

**Backend handling of `POST /api/candidates/`:**
The view creates a `JobApplication` from the provided fields (with `agreement=True` since HR is submitting on behalf of the applicant), then the `post_save` signal fires and creates the `Candidate`. The recruiter is then set on the `Candidate` immediately after creation if provided. The response returns the fully serialized `Candidate`.

**`GET /api/users/` for recruiter dropdown:**
A new lightweight endpoint `GET /api/users/` (authenticated, returns `id` + `get_full_name()` for all users) is added to the `core` app to populate the recruiter dropdown.

### Updated `Candidate` Type

```typescript
export interface Candidate {
  id: number;
  stage: Stage;
  rating: number;         // 0–5
  recruiter: { id: number; name: string } | null;
  notes: string;
  exam_result: string | null;
  endorsed_from: string | null;
  is_pooled: boolean;
  pooled_at: string | null;
  created_at: string;
  application: {
    id: number;
    name: string;
    email: string;
    phone_number: string;
    resume: string;
    expected_salary: string;
    source: string;
    created_at: string;
  };
  job: {
    id: number;
    title: string;
    location: string;
  };
}
```

---

## 4. Out of Scope (Deferred)

- Exam result file management UI (upload/preview/delete in drawer)
- Walk-in candidate creation is now in scope via `AddCandidateModal` (see Section 3)
- Candidate activity log / audit trail
- Email notifications to applicants on stage changes
- Application status tracking beyond pipeline stage
