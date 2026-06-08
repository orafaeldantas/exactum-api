import pytest


@pytest.mark.functional
def test_create_sale_success(client, auth_headers, default_product) -> None:
    """
    GIVEN an authenticated user
    WHEN a POST sale request is sent to the /sales endpoint
    THEN the API should return 201 OK
    """

    # GIVEN
    # default_user.id
    sale_payload = {
        "totalToPay": 1000.00,
        "paymentMethod": "pix",
        "itemQuantity": 3,
        "channel": "physical",
    }
    items_payload = [
        {
            "name": "PYTEST PRODUCT",
            "quantity": 2,
            "sku": "PYT",
            "itemPrice": 1000.00,
            "id": default_product.id,
        }
    ]

    payload = {"sale": sale_payload, "items": items_payload}

    # WHEN
    response = client.post("/sales", json=payload, headers=auth_headers)

    # THEN
    assert response.status_code == 201
    assert "id" in response.json


@pytest.mark.functional
def test_list_sale_items_success(client, auth_headers, default_sale) -> None:
    """
    GIVEN an authenticated user and an existing sale in database
    WHEN a GET sale request is sent to the /sales/default_sale.id endpoint
    THEN the API should return 200 OK
    """

    # GIVEN
    # default_user
    sale_id = default_sale.id

    # WHEN
    response = client.get(f"/sales/{sale_id}", headers=auth_headers)

    # THEN
    assert response.status_code == 200
    sale = response.json
    assert isinstance(sale, dict)
    assert len(sale) > 0
    assert "created_at" in sale["sale"]
    assert "sku" in sale["items"][0]
