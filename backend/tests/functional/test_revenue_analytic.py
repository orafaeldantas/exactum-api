import pytest


@pytest.mark.functional
def test_list_revenue_by_period_success(client, auth_headers, default_sale) -> None:
    """
    GIVEN an authenticated user and an existing sales in database
    WHEN a GET revenue_metrics request is sent to the /analytics/revenue endpoint
    THEN the API should return 200 OK
    """

    # GIVEN
    # default_user

    # WHEN
    response = client.get("/analytics/revenue/?period=7d", headers=auth_headers)

    # THEN
    assert response.status_code == 200
    revenue_data = response.json
    assert isinstance(revenue_data, dict)
    assert len(revenue_data) > 0
    assert "total_products_sold" in revenue_data["revenue_metrics"]


def test_generate_average_ticket_success(client, auth_headers, default_sale) -> None:
    """
    GIVEN an authenticated user and an existing sales in database
    WHEN a GET revenue_metrics request is sent to the /analytics/revenue endpoint
    THEN the API should return 200 OK
    """

    # GIVEN
    # default_user

    # WHEN
    response = client.get(
        "/analytics/revenue/ticket-average/?period=month06year2026",
        headers=auth_headers,
    )

    # THEN
    assert response.status_code == 200
    average_ticket_data = response.json
    assert isinstance(average_ticket_data, dict)
    assert len(average_ticket_data) > 0
    assert "averageTicket" in average_ticket_data


def test_list_accumulated_revenue_day(client, auth_headers, default_sale) -> None:
    """
    GIVEN an authenticated user and an existing sales in database
    WHEN a GET revenue_metrics request is sent to the /analytics/revenue endpoint
    THEN the API should return 200 OK
    """

    # GIVEN
    # default_user

    # WHEN
    response = client.get(
        "/analytics/revenue/accumulated-revenue-day/?period=month",
        headers=auth_headers,
    )

    # THEN
    assert response.status_code == 200
    accumulated_revenue_day = response.json
    assert isinstance(accumulated_revenue_day, list)
    assert len(accumulated_revenue_day) > 0
    print(accumulated_revenue_day)
    assert "day" in accumulated_revenue_day[0]
