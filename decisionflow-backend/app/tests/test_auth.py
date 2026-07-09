from fastapi.testclient import TestClient


def test_register_user_returns_jwt(client: TestClient):
    response = client.post(
        "/api/v1/auth/register",
        json={"email": "user@example.com", "full_name": "Example User", "password": "password123"},
    )

    assert response.status_code == 201
    payload = response.json()
    assert payload["success"] is True
    assert payload["data"]["access_token"]
    assert payload["data"]["user"]["email"] == "user@example.com"


def test_login_user_with_valid_credentials(client: TestClient):
    client.post(
        "/api/v1/auth/register",
        json={"email": "user@example.com", "full_name": "Example User", "password": "password123"},
    )

    response = client.post(
        "/api/v1/auth/login",
        json={"email": "user@example.com", "password": "password123"},
    )

    assert response.status_code == 200
    assert response.json()["data"]["token_type"] == "bearer"


def test_login_rejects_invalid_password(client: TestClient):
    client.post(
        "/api/v1/auth/register",
        json={"email": "user@example.com", "full_name": "Example User", "password": "password123"},
    )

    response = client.post(
        "/api/v1/auth/login",
        json={"email": "user@example.com", "password": "wrong-password"},
    )

    assert response.status_code == 401
    assert response.json()["success"] is False


def test_get_current_user(client: TestClient, auth_headers: dict[str, str]):
    response = client.get("/api/v1/users/me", headers=auth_headers)

    assert response.status_code == 200
    assert response.json()["data"]["email"] == "maker@example.com"


def test_change_password_allows_login_with_new_password(client: TestClient, auth_headers: dict[str, str]):
    response = client.post(
        "/api/v1/auth/change-password",
        headers=auth_headers,
        json={"current_password": "password123", "new_password": "new-password123"},
    )

    assert response.status_code == 200
    assert response.json()["success"] is True

    old_login = client.post(
        "/api/v1/auth/login",
        json={"email": "maker@example.com", "password": "password123"},
    )
    assert old_login.status_code == 401

    new_login = client.post(
        "/api/v1/auth/login",
        json={"email": "maker@example.com", "password": "new-password123"},
    )
    assert new_login.status_code == 200


def test_change_password_rejects_wrong_current_password(client: TestClient, auth_headers: dict[str, str]):
    response = client.post(
        "/api/v1/auth/change-password",
        headers=auth_headers,
        json={"current_password": "wrong-password", "new_password": "new-password123"},
    )

    assert response.status_code == 400
    assert response.json()["success"] is False
