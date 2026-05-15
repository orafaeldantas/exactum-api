from flask import g
from app.services.analytics.item_analytics_service import ItemAnalyticsService


class ItemAnalyticsController:

    @staticmethod
    def get_top_product(query_params):

        return ItemAnalyticsService.get_top_product(
            g.tenant_id,
            period=query_params["period"],
        )
    
