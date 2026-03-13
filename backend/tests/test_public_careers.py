import pytest
from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework.test import APIClient

from jobs.models import Job, JobApplication


@pytest.fixture
def client():
    return APIClient()


@pytest.fixture(autouse=True)
def media_root(settings, tmp_path):
    settings.MEDIA_ROOT = tmp_path


@pytest.fixture
def active_job():
    return Job.objects.create(
        title="Front Desk Agent",
        dept="Front Office",
        location="Bluewater Maribago",
        type="Full-time",
        status="Active",
        posted="Mar 13, 2026",
        description="Support guest arrivals and departures.",
        qualifications="Hospitality background preferred.",
    )


@pytest.fixture
def closed_job():
    return Job.objects.create(
        title="Closed Role",
        dept="Operations",
        location="Bluewater Panglao",
        type="Contract",
        status="Closed",
        posted="Mar 1, 2026",
        closed="Mar 10, 2026",
        description="This should not be public.",
        qualifications="N/A",
    )


@pytest.mark.django_db
def test_public_jobs_list_is_anonymous_and_excludes_closed(client, active_job, closed_job):
    response = client.get("/api/jobs/public/")

    assert response.status_code == 200
    assert response.data["count"] == 1
    assert response.data["results"][0]["id"] == active_job.id


@pytest.mark.django_db
def test_public_jobs_search_filters_results(client, active_job):
    Job.objects.create(
        title="Sous Chef",
        dept="Kitchen",
        location="Bluewater Sumilon",
        type="Full-time",
        status="Active",
        posted="Mar 14, 2026",
        description="Kitchen leadership.",
        qualifications="Leadership experience.",
    )

    response = client.get("/api/jobs/public/?search=front")

    assert response.status_code == 200
    assert response.data["count"] == 1
    assert response.data["results"][0]["title"] == active_job.title


@pytest.mark.django_db
def test_public_job_detail_is_anonymous(client, active_job):
    response = client.get(f"/api/jobs/public/{active_job.id}/")

    assert response.status_code == 200
    assert response.data["id"] == active_job.id


@pytest.mark.django_db
def test_public_apply_creates_application(client, active_job):
    resume = SimpleUploadedFile("resume.pdf", b"resume-content", content_type="application/pdf")

    response = client.post(
        f"/api/jobs/public/{active_job.id}/apply/",
        {
            "name": "Jane Doe",
            "email": "jane@example.com",
            "phone_number": "+63 900 000 0000",
            "resume": resume,
            "expected_salary": "35000.00",
            "cover_letter": "I would like to apply.",
            "agreement": "true",
        },
        format="multipart",
    )

    assert response.status_code == 201
    application = JobApplication.objects.get()
    assert application.job_id == active_job.id
    assert application.source == "Website"
    assert application.email == "jane@example.com"


@pytest.mark.django_db
def test_public_apply_requires_agreement(client, active_job):
    resume = SimpleUploadedFile("resume.pdf", b"resume-content", content_type="application/pdf")

    response = client.post(
        f"/api/jobs/public/{active_job.id}/apply/",
        {
            "name": "Jane Doe",
            "email": "jane@example.com",
            "phone_number": "+63 900 000 0000",
            "resume": resume,
            "expected_salary": "35000.00",
            "cover_letter": "I would like to apply.",
            "agreement": "false",
        },
        format="multipart",
    )

    assert response.status_code == 400
    assert "agreement" in response.data
