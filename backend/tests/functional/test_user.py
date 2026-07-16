import pytest


@pytest.mark.functional
def test_create_user_success(client, auth_headers, default_roles):
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
        "password_reset": False,
        "is_active": True,
        "role": default_roles.uuid,
    }

    response = client.post("/users/", json=payload, headers=auth_headers)

    # THEN
    assert response.status_code == 201
    assert response.json["email"] == "new_user@exactum.app.br"


@pytest.mark.functional
def test_get_users_success(client, auth_headers, default_user):
    """
    GIVEN an authenticated user and an existing user in the database
    WHEN a GET request is sent to the /users/ endpoint
    THEN the API should return 200 OK and a list containing the user data
    """

    # GIVEN
    # default_user.email

    # WHEN
    response = client.get("/users/", headers=auth_headers)

    # THEN
    assert response.status_code == 200
    users = response.json
    assert isinstance(users, list)
    assert len(users) > 0
    assert users[0]["email"] == default_user.email


@pytest.mark.functional
def test_get_user_by_id_success(client, auth_headers, default_user):
    """
    GIVEN an authenticated user and an existing user in the database
    WHEN a GET request is sent to the /users/default_user.id endpoint
    THEN the API should return 200 OK and the specific user data
    """

    # GIVEN
    user_uuid = default_user.uuid

    # WHEN
    response = client.get(f"/users/{user_uuid}", headers=auth_headers)

    # THEN
    assert response.status_code == 200
    user_data = response.json

    assert user_data["uuid"] == str(user_uuid)
    assert user_data["email"] == default_user.email


@pytest.mark.functional
def test_get_user_by_id_failure(client, auth_headers):
    """
    GIVEN a false user ID
    WHEN a GET request is sent to the /users/false_id endpoint
    THEN the API should return 404
    """

    # GIVEN
    false_id = 99

    # WHEN
    response = client.get(f"/users/{false_id}", headers=auth_headers)

    # THEN
    assert response.status_code == 404


@pytest.mark.functional
def test_update_user_success(client, auth_headers, default_user):
    """
    GIVEN an existing user in the database
    WHEN a GET request is sent to the /users/default_user.id endpoint
    THEN the API should return 200
    """

    # GIVEN
    user_uuid = default_user.uuid
    payload = {"is_active": False}

    # WHEN
    response = client.patch(f"/users/{user_uuid}", json=payload, headers=auth_headers)

    # THEN
    assert response.status_code == 200
    user_data = response.json

    assert not user_data["is_active"]


@pytest.mark.functional
def test_update_profile_success(client, auth_headers, default_user):
    """
    GIVEN an existing user in the database
    WHEN a GET request is sent to the /users/profile/default_user.id endpoint
    THEN the API should return 200
    """

    # GIVEN
    user_uuid = default_user.uuid
    payload = {"username": "Pytest User Modified"}

    # WHEN
    response = client.patch(
        f"/users/profile/{user_uuid}", json=payload, headers=auth_headers
    )

    # THEN
    assert response.status_code == 200
    user_data = response.json

    assert user_data["username"] == "Pytest User Modified"
