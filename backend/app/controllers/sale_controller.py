from flask import g
from app.services.sale_service import SaleService


class SaleController:


    @staticmethod
    def create_sale(data):

        return SaleService.create_sale(data, g.tenant_id, g.user_id)
    
    @staticmethod
    def list_sales_by_period(query_params):

        return SaleService.list_sales_by_period(
            g.tenant_id,
            month=query_params["month"],
            year=query_params["year"]
        )
    
    @staticmethod
    def list_sale_with_items(sale_id): 
         
         return SaleService.list_sale_with_items(g.tenant_id, sale_id)
    