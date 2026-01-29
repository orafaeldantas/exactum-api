from app.extensions import db
from app.models import Product

def create_product(data):
    product = Product(
        name=data["name"],
        description=data.get("description"),
        price=data["price"],
        stock_quantity=data.get("stock_quantity", 0)
    )
    db.session.add(product)
    db.session.commit()

    return product

def list_product():
    return Product.query.filter_by(is_active=True).all()

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

