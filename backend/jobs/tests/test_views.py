from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from jobs.models import Job


class JobViewSetTests(APITestCase):
    def test_create_and_list_jobs(self):
        create_response = self.client.post(
            reverse("jobs:job-list"),
            {
                "title": "Demi Baker",
                "department": "Kitchen",
                "location": "Bluewater Maribago",
                "job_type": "full_time",
                "status": "active",
                "description": "Prepare baked goods.",
                "qualifications": "Baking experience",
                "posted_at": "2026-03-11T00:00:00Z",
            },
            format="json",
        )

        self.assertEqual(create_response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Job.objects.count(), 1)

        list_response = self.client.get(reverse("jobs:job-list"))

        self.assertEqual(list_response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(list_response.json()), 1)
        self.assertEqual(list_response.json()[0]["title"], "Demi Baker")
