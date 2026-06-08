import pytest


@pytest.mark.functional
def test_login_success(client, default_user):
    """
    GIVEN a registered user in the database
    WHEN they post valid credentials to the login endpoint
    THEN the API should return a 200 status code and an access token
    """
    # GIVEN
    payload = {"email": "user@pytest.com", "password": "pytestuserpsw"}

    # WHEN
    response = client.post("/auth/login", json=payload)

    # THEN
    assert response.status_code == 200
    assert "access_token" in response.json


@pytest.mark.functional
def test_login_failure_invalid_password(client, default_user):
    """
    GIVEN a registered user
    WHEN they post valid email but wrong password
    THEN the API should return a 401 status code
    """
    payload = {"email": default_user.email, "password": "wrongpassword"}

    response = client.post("/auth/login", json=payload)

    assert response.status_code == 401


@pytest.mark.functional
def test_login_failure_nonexistent_user(client):
    """
    GIVEN no user in the database
    WHEN they post credentials for a user that doesn't exist
    THEN the API should return a 401 status code
    """
    payload = {"email": "notfound@pytest.com", "password": "anypassword"}

    response = client.post("/auth/login", json=payload)

    assert response.status_code == 401


@pytest.mark.functional
def test_login_failure_invalid_data(client):
    """
    GIVEN an invalid payload (missing fields)
    WHEN they post to the login endpoint
    THEN the API should return a 422 status code
    """

    payload = {"email": "user@pytest.com"}

    response = client.post("/auth/login", json=payload)

    assert response.status_code == 422
    assert "errors" in response.json
