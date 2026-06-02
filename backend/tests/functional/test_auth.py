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
