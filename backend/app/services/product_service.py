from app.database.session import DatabaseSession
from app.exceptions.product_exceptions import ProductNotFound
from app.models.product import Product
from app.repositories.product_repository import ProductRepository


class ProductService:
    @staticmethod
    def list_all_products(tenant_id):

        return ProductRepository.list_all_products(tenant_id)

    @staticmethod
    def create_product(data, tenant_id):

        product = Product(
            tenant_id=tenant_id,
            name=data.get("name"),
            description=data.get("description"),
            price=data.get("price"),
            stock_quantity=data.get("stock_quantity"),
            sku=data.get("sku"),
            category=data.get("category", "Not defined"),
            is_active=data.get("is_active"),
        )

        DatabaseSession.add(product)
        DatabaseSession.commit()

        return product

    @staticmethod
    def get_product(product_id):

        product = ProductRepository.get_product(product_id)

        if not product:
            raise ProductNotFound()

        return product

    @staticmethod
    def update_product(data, product_id):

        product = ProductRepository.get_product(product_id)

        if not product:
            raise ProductNotFound()

        update_fields = ["name", "description", "price", "sku", "category", "is_active"]

        for field in update_fields:
            if field in data:
                setattr(product, field, data[field])

        DatabaseSession.add(product)
        DatabaseSession.commit()

        return product

    @staticmethod
    def delete_product(product_id):

        product = ProductRepository.get_product(product_id)

        ProductRepository.delete_product(product)
