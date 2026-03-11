from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from applications.models import Application
from candidates.models import Candidate
from jobs.models import Job


class ApplicationViewSetTests(APITestCase):
    def setUp(self):
        self.candidate = Candidate.objects.create(
            full_name="Maria Dela Cruz",
            email="maria@example.com",
            phone="09171234567",
            avatar="MD",
        )
        self.job = Job.objects.create(
            title="Demi Baker",
            department="Kitchen",
            location="Bluewater Maribago",
            job_type=Job.JobType.FULL_TIME,
            status=Job.Status.ACTIVE,
            description="Prepare baked goods.",
        )

    def test_create_and_list_applications_with_nested_candidate_and_job(self):
        create_response = self.client.post(
            reverse("applications:application-list"),
            {
                "candidate_id": self.candidate.id,
                "job_id": self.job.id,
                "stage": "applied",
                "source": "linkedin",
                "rating": 4,
                "recruiter_name": "Joela",
                "notes": "Strong candidate",
                "applied_at": "2026-03-08T00:00:00Z",
            },
            format="json",
        )

        self.assertEqual(create_response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Application.objects.count(), 1)

        list_response = self.client.get(reverse("applications:application-list"))

        self.assertEqual(list_response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(list_response.json()), 1)
        self.assertEqual(list_response.json()[0]["candidate"]["full_name"], "Maria Dela Cruz")
        self.assertEqual(list_response.json()[0]["job"]["title"], "Demi Baker")

    def test_status_filter_treats_hired_and_rejected_as_terminal(self):
        Application.objects.create(
            candidate=self.candidate,
            job=self.job,
            stage=Application.Stage.APPLIED,
            source="website",
        )
        hired_candidate = Candidate.objects.create(
            full_name="Jun Reyes",
            email="jun@example.com",
        )
        Application.objects.create(
            candidate=hired_candidate,
            job=self.job,
            stage=Application.Stage.HIRED,
            source="referral",
        )

        response = self.client.get(
            reverse("applications:application-list"),
            {"status": "active"},
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.json()), 1)
        self.assertEqual(response.json()[0]["stage"], "applied")
