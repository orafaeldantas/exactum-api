from flask import g
from app.services.analytics.sold_item_analytics_service import SoldItemAnalyticsService


class SoldItemAnalyticsController:

    @staticmethod
    def list_sold_items_by_period(query_params):

        return SoldItemAnalyticsService.list_sold_items_by_period(
            g.tenant_id,
            period=query_params["period"]
        )
    
    @staticmethod
    def list_best_sellers_by_period(query_params):

        return SoldItemAnalyticsService.list_best_sellers_by_period(
            g.tenant_id,
            period=query_params["period"]
        )