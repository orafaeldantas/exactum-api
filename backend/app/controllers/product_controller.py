from flask import g
from app.services.product_service import ProductService


class ProductController:

    @staticmethod
    def create_product(data):

        return ProductService.create_tenant(data)
    
    @staticmethod
    def list_all_products():

        return ProductService.list_all_products(g.tenant_id)
    
    @staticmethod
    def get_product(product_id):

        return ProductService.get_product(product_id)
    
    @staticmethod
    def update_product(data, product_id):

        return ProductService.update_product(data, product_id)
    
    @staticmethod
    def delete_product(product_id):

        return ProductService.delete_product(product_id)