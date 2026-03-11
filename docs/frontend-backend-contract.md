# Frontend Backend Contract

## Context

We are implementing the first backend needed to support the existing ATS frontend.

The frontend is currently using in-memory mock data, but its real domain is simple:

- `jobs` are openings
- `candidates` are people
- `pipeline` is the hiring progress of a candidate for a specific job

The key implementation detail is that pipeline is not a standalone table and it should not live directly on the candidate record. A person can exist once and still be considered for different jobs. Because of that, the pipeline state belongs on an `application` record that connects a candidate to a job.

This backend contract is only for the minimum scope needed to make these frontend areas work:

- jobs
- candidates
- pipeline

## What We Are Trying To Implement

We want a lean Django backend that allows the frontend to:

- create, edit, list, and delete jobs
- create, edit, list, and delete candidates
- create and manage job applications
- move candidates through hiring stages
- update application notes, rating, recruiter, and file fields

The frontend candidates page and pipeline page are both application-driven views. Even though the UI says "Candidates", the rows actually combine:

- candidate information
- job information
- application/pipeline information

So the backend must expose `applications` as a first-class resource.

## Simple Schema

### 1. Candidate

Represents the person.

Suggested fields:

- `id`
- `full_name`
- `email`
- `phone`
- `avatar`
- `created_at`
- `updated_at`

### 2. Job

Represents a job opening.

Suggested fields:

- `id`
- `title`
- `department`
- `location`
- `job_type`
- `status`
- `description`
- `qualifications`
- `posted_at`
- `closed_at`
- `created_at`
- `updated_at`

### 3. Application

Represents a candidate applying to one job. This is the pipeline record.

Suggested fields:

- `id`
- `candidate_id`
- `job_id`
- `stage`
- `source`
- `rating`
- `recruiter_name`
- `notes`
- `resume_file`
- `exam_result_file`
- `applied_at`
- `created_at`
- `updated_at`

### Relationship Summary

- one `candidate` can have many `applications`
- one `job` can have many `applications`
- one `application` belongs to one candidate and one job

## Django App Boundaries

Since we are following a domain-driven approach in Django, create one app per domain.

For this scope, the recommended apps are:

### `jobs`

Why this app exists:

- owns the `Job` model
- owns job CRUD endpoints
- owns job-specific serializers, views, selectors, services, and tests

Suggested responsibility:

- job creation
- job updates
- job closing
- job deletion
- job listing

### `candidates`

Why this app exists:

- owns the `Candidate` model
- owns person-level candidate CRUD
- keeps candidate identity separate from pipeline/application state

Suggested responsibility:

- create candidate person records
- update candidate profile fields
- delete candidate records if allowed
- retrieve candidate details

### `applications`

Why this app exists:

- owns the `Application` model
- owns all pipeline behavior
- is the main domain powering the candidates page and pipeline page

Suggested responsibility:

- create an application for a candidate and job
- move an application through stages
- update application notes, source, recruiter, rating, and files
- reject or hire an application
- list/filter pipeline records

## Recommended Django Structure

The backend should be understandable by scanning:

- `backend/config/urls.py`
- `backend/jobs/`
- `backend/candidates/`
- `backend/applications/`

Suggested route mounting:

- `/api/jobs/` -> `jobs` app
- `/api/candidates/` -> `candidates` app
- `/api/applications/` -> `applications` app

Each app should follow the existing backend convention and include:

- `apps.py`
- `models.py`
- `views.py`
- `urls.py`
- `serializers.py`
- `services.py`
- `selectors.py`
- `permissions.py`
- `tests/`
- `migrations/`

## Pipeline Stages

The application stage should support at least:

- `applied`
- `screening`
- `initial_interview`
- `exam`
- `departmental_interview`
- `final_interview`
- `job_offer`
- `hired`
- `rejected`

## Endpoints

All routes should follow the project backend convention:

- `/api/jobs/`
- `/api/candidates/`
- `/api/applications/`

## Jobs Endpoints

### `GET /api/jobs/`

Why it is needed:

- to render the jobs page
- to populate job dropdowns in forms
- to support filtering active vs closed jobs

### `POST /api/jobs/`

Why it is needed:

- to create a new job from the frontend jobs flow

### `GET /api/jobs/<id>/`

Why it is needed:

- to fetch a single job for edit or detail views

### `PATCH /api/jobs/<id>/`

Why it is needed:

- to update job details
- to close a job by changing its status

### `DELETE /api/jobs/<id>/`

Why it is needed:

- to remove a job if the product allows deletion

## Candidates Endpoints

### `GET /api/candidates/`

Why it is needed:

- to list person-level candidate records
- to support direct candidate lookup if needed

### `POST /api/candidates/`

Why it is needed:

- to create the person record before or alongside application creation

### `GET /api/candidates/<id>/`

Why it is needed:

- to fetch one candidate record

### `PATCH /api/candidates/<id>/`

Why it is needed:

- to update person-level fields such as name, email, phone, and avatar

### `DELETE /api/candidates/<id>/`

Why it is needed:

- to remove a candidate if allowed by data integrity rules

## Applications Endpoints

This is the most important resource for the frontend.

### `GET /api/applications/`

Why it is needed:

- to render the candidates page
- to render the pipeline page
- to support filtering by stage, job, and candidate

This endpoint should return nested candidate and job data so the frontend does not need to manually join records.

Example response item:

```json
{
  "id": 101,
  "stage": "screening",
  "source": "linkedin",
  "rating": 4,
  "recruiter_name": "Joela",
  "notes": "Strong candidate",
  "resume_file": "/media/resumes/sample.pdf",
  "exam_result_file": "/media/exams/sample.pdf",
  "applied_at": "2026-03-08T00:00:00Z",
  "candidate": {
    "id": 12,
    "full_name": "Maria Dela Cruz",
    "email": "maria@example.com",
    "phone": "09171234567",
    "avatar": "MD"
  },
  "job": {
    "id": 3,
    "title": "Demi Baker",
    "status": "active",
    "location": "Bluewater Maribago"
  }
}
```

Recommended query params:

- `job=<job_id>`
- `stage=<stage>`
- `candidate_search=<text>`
- `status=<value>`

### `POST /api/applications/`

Why it is needed:

- to add a candidate into the hiring pipeline for a job

Minimum request body:

```json
{
  "candidate_id": 12,
  "job_id": 3,
  "stage": "applied",
  "source": "website",
  "rating": 3,
  "recruiter_name": "Joela",
  "notes": ""
}
```

### `GET /api/applications/<id>/`

Why it is needed:

- to fetch one application record for the candidate detail drawer

### `PATCH /api/applications/<id>/`

Why it is needed:

- to move the application through the pipeline
- to update notes
- to update rating
- to update recruiter name
- to update source
- to update resume or exam file fields
- to mark the application as rejected or hired

### `DELETE /api/applications/<id>/`

Why it is needed:

- to remove an application from the pipeline

## Frontend Consumption Rule

The frontend should primarily consume:

- `jobs` for the jobs page and dropdowns
- `applications` for the candidates page and pipeline page
- `candidates` for person-level CRUD only

Do not build the frontend candidates screen on top of `GET /api/candidates/` alone, because the screen needs application-level fields like:

- stage
- source
- rating
- recruiter
- job title

## Minimum Viable Endpoint Set

If we want the smallest backend that fully supports the current frontend scope, these are the required endpoints:

- `GET /api/jobs/`
- `POST /api/jobs/`
- `GET /api/jobs/<id>/`
- `PATCH /api/jobs/<id>/`
- `DELETE /api/jobs/<id>/`
- `GET /api/candidates/`
- `POST /api/candidates/`
- `GET /api/candidates/<id>/`
- `PATCH /api/candidates/<id>/`
- `DELETE /api/candidates/<id>/`
- `GET /api/applications/`
- `POST /api/applications/`
- `GET /api/applications/<id>/`
- `PATCH /api/applications/<id>/`
- `DELETE /api/applications/<id>/`

## Implementation Note

If this is built in Django REST Framework, the cleanest shape is:

- `JobViewSet`
- `CandidateViewSet`
- `ApplicationViewSet`

with the frontend mostly reading from `ApplicationViewSet` for candidate list and pipeline behavior.
