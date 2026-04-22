from app.extensions import db
from app.models import Product
from flask import g

def create_product(data):
    product = Product(
        tenant_id=g.tenant_id,
        name=data.get("name"),
        description=data.get("description", "Não definido"),
        price=data.get("price"),
        stock_quantity=data.get("stock_quantity", 0),
        sku=data.get("sku", "Não definido"),
        category=data.get("category", "Não definido"),
        is_active=data.get("is_active", True)
    )
    db.session.add(product)
    db.session.commit()

    return product

def list_product():
    return Product.query.filter_by(tenant_id=g.tenant_id).all()

def get_product(product_id):
    return Product.query.filter_by(id=product_id, is_active=True).first()

def update_product(product, data):
    product.name = data.get("name", product.name)
    product.description = data.get("description", product.description)
    product.price = data.get("price", product.price)
    product.stock_quantity = data.get(
        "stock_quantity", product.stock_quantity
    )
    db.session.commit()

    return product

def delete_product(product):
    product.is_active = False
    db.session.commit()

