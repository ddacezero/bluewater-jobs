import pytest
from rest_framework.test import APIClient


@pytest.fixture
def client():
    return APIClient()


@pytest.fixture
def registered_user(client):
    """Creates a user and returns credentials."""
    payload = {
        "first_name": "Test",
        "last_name": "User",
        "role": "hr_manager",
        "email": "test@example.com",
        "password": "securepass123",
    }
    client.post("/api/auth/register/", payload)
    return payload


@pytest.mark.django_db
def test_register_creates_user(client):
    resp = client.post("/api/auth/register/", {
        "first_name": "New",
        "last_name": "User",
        "role": "talent_acquisition_specialist",
        "email": "new@example.com",
        "password": "securepass123",
    })
    assert resp.status_code == 201
    assert resp.data["email"] == "new@example.com"
    assert resp.data["role"] == "talent_acquisition_specialist"
    assert "password" not in resp.data  # write_only


@pytest.mark.django_db
def test_register_rejects_duplicate_username(client, registered_user):
    resp = client.post("/api/auth/register/", registered_user)
    assert resp.status_code == 400


@pytest.mark.django_db
def test_login_returns_jwt_tokens(client, registered_user):
    resp = client.post("/api/auth/login/", {
        "email": registered_user["email"],
        "password": registered_user["password"],
    })
    assert resp.status_code == 200
    assert "access" in resp.data
    assert "refresh" in resp.data


@pytest.mark.django_db
def test_me_requires_authentication(client):
    resp = client.get("/api/auth/me/")
    assert resp.status_code == 401


@pytest.mark.django_db
def test_me_returns_current_user(client, registered_user):
    login = client.post("/api/auth/login/", {
        "email": registered_user["email"],
        "password": registered_user["password"],
    })
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {login.data['access']}")
    resp = client.get("/api/auth/me/")
    assert resp.status_code == 200
    assert resp.data["email"] == registered_user["email"]


@pytest.mark.django_db
def test_token_refresh_returns_new_access_token(client, registered_user):
    login = client.post("/api/auth/login/", {
        "email": registered_user["email"],
        "password": registered_user["password"],
    })
    resp = client.post("/api/auth/token/refresh/", {
        "refresh": login.data["refresh"],
    })
    assert resp.status_code == 200
    assert "access" in resp.data
