#from app.models import ItemSale

from app.repositories.analytics.item_analytics_repository import ItemAnalyticsRepository

#from database.session import DatabaseSession



class ItemAnalyticsService:
    
    @staticmethod
    def list_items_by_period(tenant_id, period):

        return ItemAnalyticsRepository.list_items_by_period(tenant_id, period)