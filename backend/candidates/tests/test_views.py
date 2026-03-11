from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from candidates.models import Candidate


class CandidateViewSetTests(APITestCase):
    def test_create_and_list_candidates(self):
        create_response = self.client.post(
            reverse("candidates:candidate-list"),
            {
                "full_name": "Maria Dela Cruz",
                "email": "maria@example.com",
                "phone": "09171234567",
                "avatar": "MD",
            },
            format="json",
        )

        self.assertEqual(create_response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Candidate.objects.count(), 1)

        list_response = self.client.get(reverse("candidates:candidate-list"))

        self.assertEqual(list_response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(list_response.json()), 1)
        self.assertEqual(list_response.json()[0]["full_name"], "Maria Dela Cruz")
