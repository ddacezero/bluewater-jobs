from django.test import SimpleTestCase
from django.urls import reverse
from rest_framework.test import APIClient


class UsersPingViewTests(SimpleTestCase):
    def setUp(self):
        self.client = APIClient()

    def test_ping_endpoint_returns_expected_payload(self):
        response = self.client.get(reverse("users:ping"))

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {"detail": "users api ok"})
