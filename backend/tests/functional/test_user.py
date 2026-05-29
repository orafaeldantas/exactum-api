import pytest


@pytest.mark.functional
def test_create_user_success(client, auth_headers):
    """
    GIVEN an existing tenant in the database
    WHEN a new user payload is sent to the creation endpoint
    THEN the API should return 201 Created and the user data
    """
    # GIVEN / WHEN
    payload = {
        "username": "new_user",
        "email": "new_user@exactum.app.br",
        "password": "pswabcd1234",
        "is_active": True,
        "role": "user"
    }

    response = client.post("/users/", json=payload, headers=auth_headers)

    # THEN
    assert response.status_code == 201
    assert response.json["email"] == "new_user@exactum.app.br"
