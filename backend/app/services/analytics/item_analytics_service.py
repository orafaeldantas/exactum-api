#from app.models import ItemSale

from app.repositories.analytics.item_analytics_repository import ItemAnalyticsRepository

#from database.session import DatabaseSession



class ItemAnalyticsService:
    
    @staticmethod
    def get_top_product(tenant_id, period):

        return ItemAnalyticsRepository.get_top_product(tenant_id, period)