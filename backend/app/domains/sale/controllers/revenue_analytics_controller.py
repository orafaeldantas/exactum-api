from flask import g

from app.domains.sale.services.revenue_analytics_service import RevenueAnalyticsService


class RevenueAnalyticsController:
    @staticmethod
    def get_revenue_by_period(query_params):

        return RevenueAnalyticsService.list_revenue_by_period(
            g.tenant_id, period=query_params["period"]
        )

    @staticmethod
    def get_accumulated_revenue_day(query_params):

        return RevenueAnalyticsService.list_accumulated_revenue_day(
            g.tenant_id, period=query_params["period"]
        )

    @staticmethod
    def get_average_ticket_dashboard(query_params):

        return RevenueAnalyticsService.generate_average_ticket_report(
            g.tenant_id, period=query_params["period"]
        )
