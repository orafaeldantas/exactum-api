from app.repositories.analytics.revenue_analytics_repository import (
    RevenueAnalyticsRepository,
)
from app.repositories.analytics.sold_item_analytics_repository import (
    SoldItemAnalyticsRepository,
)
from app.services.helpers.date_service import DateService


class RevenueAnalyticsService:
    @staticmethod
    def list_revenue_by_period(tenant_id, period):

        revenue_metrics = RevenueAnalyticsRepository.get_revenue_metrics(
            tenant_id, period
        )
        payment_methods = RevenueAnalyticsRepository.get_payment_methods_metrics(
            tenant_id, period
        )
        top_product = SoldItemAnalyticsRepository.get_top_product(tenant_id, period)

        payment_metrics = (
            [
                {
                    "payment_method": row.payment_method,
                    "quantity": row.quantity,
                    "revenue": float(row.revenue or 0),
                }
                for row in payment_methods
            ]
            if payment_methods
            else []
        )

        metrics = {
            "revenue_metrics": revenue_metrics,
            "payment_metrics": payment_metrics,
            "top_product": top_product,
        }

        return metrics

    @staticmethod
    def list_accumulated_revenue_day(tenant_id, period):

        daily_revenue_query = RevenueAnalyticsRepository.get_daily_revenue(
            tenant_id, period
        )

        daily_revenue = {
            row.day.day: float(row.revenue_day or 0) for row in daily_revenue_query
        }

        _, end_date = DateService.get_period_range(period)
        revenue = 0
        last_day = int(end_date.day) + 1
        daily_total_revenue = []

        for day in range(1, last_day):
            revenue += daily_revenue.get(day, 0)

            daily_total_revenue.append({"day": day, "revenue": revenue})

        return daily_total_revenue

    @staticmethod
    def generate_average_ticket_report(tenant_id, period):

        months = [
            "Jan",
            "Fev",
            "Mar",
            "Abr",
            "Mai",
            "Jun",
            "Jul",
            "Ago",
            "Set",
            "Out",
            "Nov",
            "Dez",
        ]

        avg_monthly_query = (
            RevenueAnalyticsRepository.get_monthly_average_ticket_by_year(
                tenant_id, period
            )
        )

        filled_monthly = {month: 0 for month in range(1, 13)}

        for row in avg_monthly_query:
            filled_monthly[int(row.month.month)] = float(row.average_ticket)

        avg_monthly = {"labels": months, "values": list(filled_monthly.values())}

        days = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"]

        avg_weekday_query = RevenueAnalyticsRepository.get_weekday_average_ticket(
            tenant_id, period
        )

        filled_Weekday = {day: 0 for day in range(7)}

        for row in avg_weekday_query:
            filled_Weekday[int(row.weekday)] = float(row.average_ticket)

        avg_weekday = {"labels": days, "values": list(filled_Weekday.values())}

        average_ticket = RevenueAnalyticsRepository.get_ticket_average(
            tenant_id, period
        )
        quantity_order = RevenueAnalyticsRepository.get_quantity_of_orders(
            tenant_id, period
        )
        sale_information = RevenueAnalyticsRepository.get_biggest_lowest_sale(
            tenant_id, period
        )

        metrics = {
            "avg_monthly": avg_monthly,
            "avg_weekday": avg_weekday,
            "average_ticket": average_ticket.average_ticket
            if average_ticket.average_ticket
            else 0.0,
            "quantity_order": quantity_order.quantity_order
            if quantity_order.quantity_order
            else 0.0,
            "biggest_sale": sale_information.biggest_sale
            if sale_information.biggest_sale
            else 0.0,
            "lowest_sale": sale_information.lowest_sale
            if sale_information.lowest_sale
            else 0.0,
        }

        return metrics
