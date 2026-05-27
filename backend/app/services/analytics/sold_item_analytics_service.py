# from app.models import ItemSale

from app.repositories.analytics.sold_item_analytics_repository import (
    SoldItemAnalyticsRepository,
)

# from database.session import DatabaseSession


class SoldItemAnalyticsService:
    @staticmethod
    def list_sold_items_by_period(tenant_id, period):

        return SoldItemAnalyticsRepository.list_sold_items_by_period(tenant_id, period)

    @staticmethod
    def list_best_sellers_by_period(tenant_id, period):

        return SoldItemAnalyticsRepository.list_sold_items_by_period(
            tenant_id, period, quantity=5
        )
