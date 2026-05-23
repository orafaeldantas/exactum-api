
from app.repositories.analytics.revenue_analytics_repository import RevenueAnalyticsRepository 
from app.repositories.analytics.item_analytics_repository import ItemAnalyticsRepository
from app.services.helpers.date_service import DateService


class RevenueAnalyticsService:

    @staticmethod
    def list_revenue_by_period(tenant_id, period):

        
        revenue_metrics = RevenueAnalyticsRepository.get_revenue_metrics(tenant_id, period)
        payment_methods = RevenueAnalyticsRepository.get_payment_methods_metrics(tenant_id, period)
        top_product = ItemAnalyticsRepository.get_top_product(tenant_id, period)
        
    

        payment_metrics = [
            {
                "payment_method": row.payment_method,
                "quantity": row.quantity,
                "revenue": float(row.revenue or 0)
            }
            for row in payment_methods
        ] if payment_methods else []

        

        metrics = {
            "revenue_metrics": revenue_metrics,
            "payment_metrics": payment_metrics,
            "top_product": top_product,
        }

        return metrics
    
    @staticmethod
    def list_accumulated_revenue_day(tenant_id, period):

        daily_revenue = RevenueAnalyticsRepository.get_daily_revenue(tenant_id, period)

        daily_revenue = {
                row.day.day : float(row.revenue_day or 0)
                for row in daily_revenue
        }
            
         
        start_date, end_date = DateService.get_period_range(period)
        revenue = 0
        last_day = int(end_date.day) + 1
        daily_total_revenue = []

        for day in range(1, last_day):

            revenue += daily_revenue.get(day, 0)

            daily_total_revenue.append(
                {
                    "day": day,
                    "revenue": revenue
                }            
            )

        return daily_total_revenue