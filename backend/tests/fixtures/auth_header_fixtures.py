import pytest


@pytest.fixture(scope="function")
def auth_headers(client, default_user):

    response = client.post(
        "/auth/login", json={"email": "user@pytest.com", "password": "pytestuserpsw"}
    )

    assert response.status_code == 200, f"Login failure: {response.json}"
