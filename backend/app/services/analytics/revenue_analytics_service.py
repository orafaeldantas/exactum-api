
from repositories.analytics.revenue_analytics_repository import RevenueAnalyticsRepository 
from repositories.analytics.item_analytics_repository import ItemAnalyticsRepository


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
        "top_product": top_product
    }

    return metrics