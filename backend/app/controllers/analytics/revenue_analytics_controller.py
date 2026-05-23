from flask import g
from app.services.analytics.revenue_analytics_service import RevenueAnalyticsService


class RevenueAnalyticsController:


    @staticmethod
    def list_revenue_by_period(query_params):

        return RevenueAnalyticsService.list_revenue_by_period(
            g.tenant_id,
            period=query_params["period"]
        )
    
    @staticmethod
    def list_accumulated_revenue_day(query_params):

        return RevenueAnalyticsService.list_accumulated_revenue_day(
            g.tenant_id,
            period=query_params["period"]
        )