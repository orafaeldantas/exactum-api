import pytest


@pytest.mark.functional
def test_create_product_success(client, auth_headers) -> None:
    """
    GIVEN an authenticated user
    WHEN a POST product request is sent to the /products endpoint
    THEN the API should return 201 OK
    """

    # GIVEN
    # default_user.id
    payload = {
        "name": "PYTEST 2",
        "description": "PYTEST 2",
        "price": 2000.00,
        "sku": "PYT2",
        "category": "PYTEST",
        "is_active": True,
        "stock_quantity": 30,
    }

    # WHEN
    response = client.post("/products", json=payload, headers=auth_headers)

    # THEN
    assert response.status_code == 201
    assert "uuid" in response.json


@pytest.mark.functional
def test_list_products_success(client, auth_headers, default_product) -> None:
    """
    GIVEN an authenticated user and an existing product in database
    WHEN a GET product request is sent to the /products endpoint
    THEN the API should return 200 OK
    """

    # GIVEN
    # default_user

    # WHEN
    response = client.get("/products", headers=auth_headers)

    # THEN
    assert response.status_code == 200
    products = response.json
    assert isinstance(products, list)
    assert len(products) > 0
    assert "description" in products[0]


@pytest.mark.functional
def test_get_product_success(client, auth_headers, default_product) -> None:
    """
    GIVEN an authenticated user and an existing product in database
    WHEN a GET product request is sent to the /products/default_product endpoint
    THEN the API should return 200 OK
    """

    # GIVEN
    # default_user
    product_uuid = default_product.uuid

    # WHEN
    response = client.get(f"/products/{product_uuid}", headers=auth_headers)

    # THEN
    assert response.status_code == 200
    product = response.json
    assert "description" in product


@pytest.mark.functional
def test_update_product_success(client, auth_headers, default_product) -> None:
    """
    GIVEN an authenticated user and an existing product in the database
    WHEN a GET request is sent to the /product/default_product.id endpoint
    THEN the API should return 200
    """

    # GIVEN
    product_uuid = default_product.uuid
    payload = {"is_active": False}

    # WHEN
    response = client.patch(
        f"/products/{product_uuid}", json=payload, headers=auth_headers
    )

    # THEN
    assert response.status_code == 200
    product_data = response.json

    assert "uuid" in product_data
