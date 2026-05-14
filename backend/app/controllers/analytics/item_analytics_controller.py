from flask import g
from services.analytics.item_analytics_service import ItemAnalyticsService


class ItemAnalyticsController:


    @staticmethod
    def list_items_by_period(query_params):

        return ItemAnalyticsService.list_items_by_period(
            g.tenant_id,
            month=query_params["month"],
            year=query_params["year"]
        )
    
