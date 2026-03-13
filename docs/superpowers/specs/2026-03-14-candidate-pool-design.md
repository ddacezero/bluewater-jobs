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

A `post_save` signal on `JobApplication` automatically creates a `Candidate` record when a new application is submitted:

```python
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
PATCH  /api/candidates/{id}/             → update stage, recruiter, rating, notes, exam_result, is_pooled
DELETE /api/candidates/{id}/             → delete candidate (role-gated)
```

### Serializer Response Shape

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

---

## 3. Frontend Changes

### New API Layer

**File:** `frontend/src/api/candidates.ts`

```
listCandidates(params?)   → GET /api/candidates/
getCandidate(id)          → GET /api/candidates/{id}/
updateCandidate(id, data) → PATCH /api/candidates/{id}/
deleteCandidate(id)       → DELETE /api/candidates/{id}/
```

### AppContext Changes

- Remove `PoolCandidate` state and all pool-related actions
- Talent pool is now derived: `candidates.filter(c => c.is_pooled)`
- Replace seeded `Candidate` state with API-fetched data
- `MOVE_STAGE` → calls `updateCandidate(id, { stage })`
- `ADD_TO_POOL` → calls `updateCandidate(id, { is_pooled: true })`
- `REACTIVATE_POOL` → calls `updateCandidate(id, { is_pooled: false })`

### Page & Component Updates

| Component | Change |
|---|---|
| `Pipeline.tsx` | Fetch from `GET /api/candidates/?job={id}`, replace seeded data |
| `Candidates.tsx` | Fetch from `GET /api/candidates/`, replace seeded data; remove "Add Candidate" button |
| `TalentPool.tsx` | Fetch from `GET /api/candidates/?is_pooled=true`; drop `PoolCandidate` type |
| `CandidateDrawer.tsx` | Wire `PATCH` calls for notes, rating, recruiter, stage edits |
| `Dashboard.tsx` | Remove "Add Candidate" button |
| `AddCandidateModal.tsx` | Delete entirely |
| `seeds.ts` | Remove seeded candidates and pool candidates |
| `types.ts` | Remove `PoolCandidate` type; update `Candidate` to match API shape |

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
- Direct/walk-in candidate creation (no application form)
- Candidate activity log / audit trail
- Email notifications to applicants on stage changes
- Application status tracking beyond pipeline stage
