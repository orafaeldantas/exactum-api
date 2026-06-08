import pytest


@pytest.mark.functional
def test_get_tenant_success(client, auth_headers) -> None:
    """
    GIVEN an existing tenant in the database
    WHEN a GET request is sent to the /tenants endpoint
    THEN the API should return 200 OK and and displays the requested tenant data
    """

    # GIVEN / WHEN
    response = client.get("/tenants", headers=auth_headers)

    # THEN
    assert response.status_code == 200
    assert response.json["name"] == "PYTEST"


@pytest.mark.functional
def test_update_tenant_success(client, auth_headers, default_tenant) -> None:
    """
    GIVEN an existing tenant in the database
    WHEN a GET request is sent to the /tenants endpoint
    THEN the API should return 200
    """

    # GIVEN
    payload = {"minimumStock": 15, "monthlyGoal": 40000000}

    # WHEN
    response = client.patch("/tenants", json=payload, headers=auth_headers)

    # THEN
    assert response.status_code == 200
    tenant_data = response.json

    assert tenant_data["name"] == default_tenant.name
