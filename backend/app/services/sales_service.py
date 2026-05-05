from app.extensions import db
from app.models import Sale, ItemSale
from app.services import product_service
from flask import g
import logging

logger = logging.getLogger(__name__)

def create_sales(data):
    try:
        sale = data.get("sale", {})
        items = data.get("itemsSale", {})

        new_sale = Sale (
            total_price = sale.get("totalToPay"),
            payment_method = sale.get("paymentMethod"),
            quantity_items = sale.get("item_quantity"),
            tenant_id = g.tenant_id,
            user_id = g.user_id
        )
        
        db.session.add(new_sale)
        db.session.flush()

        for item in items:
            new_item = ItemSale(
                name = item.get("name"),
                quantity = item.get("quantity"),
                sku = item.get("sku"),
                item_price = item.get("item_price"),
                sale_id = new_sale.id,
                tenant_id = g.tenant_id,
                user_id = g.user_id

            )

            
            db.session.add(new_item)

            id_product = item.get("id")
            product = product_service.get_product(id_product)
           
            remaining_stock = product.stock_quantity - new_item.quantity

            new_stock = {"stock_quantity" : remaining_stock if remaining_stock > 0 else 0}

            product_service.update_product(product, new_stock)

            logger.info("ENTROU AQUI!!!!")


       
        db.session.commit()

        return "ok"
    
    except Exception as e:
        db.session.rollback()
        logger.error(e)
        return "error"
    
def list_sales(month, year):

    query = Sale.query.filter_by(tenant_id=g.tenant_id)

    if month and year:
        query = query.filter(
            db.func.extract('month', Sale.created_at) == month,
            db.func.extract('year', Sale.created_at) == year
    )

    return query.all()

def list_sale_items(id):

    return ItemSale.query.filter_by(tenant_id=g.tenant_id, sale_id=id).all()

def get_sale(id):

    return Sale.query.filter_by(tenant_id=g.tenant_id, id=id).first()

"""
def list_top_items(month, year):

    query = ItemSale.query.filter_by(tenant_id=g.tenant_id)

    query = query.order_by(desc(ItemSale.quantity)).limit(5)

    if month and year:
        query = query.filter(
            db.func.extract('month', Sale.created_at) == month,
            db.func.extract('year', Sale.created_at) == year
    )

    return query.all()    
"""