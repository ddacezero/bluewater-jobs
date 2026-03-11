from django.test import SimpleTestCase

from users.services import get_users_app_status


class UsersServicesTests(SimpleTestCase):
    def test_get_users_app_status(self):
        self.assertEqual(get_users_app_status(), {"detail": "users api ok"})
