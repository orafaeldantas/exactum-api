from flask import g
from app.services.analytics.item_analytics_service import ItemAnalyticsService


class ItemAnalyticsController:

    @staticmethod
    def list_items_by_period(query_params):

        return ItemAnalyticsService.list_items_by_period(
            g.tenant_id,
            period=query_params["period"],
        )
    
