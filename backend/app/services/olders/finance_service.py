from app.extensions import db
from app.models import Sale, ItemSale
from flask import g
import logging


logger = logging.getLogger(__name__)

def get_finance_period(start_date, end_date):

    query = Sale.query.filter(
        Sale.tenant_id == g.tenant_id,
        Sale.created_at.between(start_date, end_date)
    ).all()

    return query

def get_top_product(start_date, end_date):

    query = (
        db.session.query(
            ItemSale.name.label("name"),
            db.func.sum(ItemSale.quantity).label("total_quantity")
        )
        .filter(
            ItemSale.tenant_id == g.tenant_id,
            ItemSale.created_at.between(start_date, end_date)
        )
        .group_by(ItemSale.name)
        .order_by(
            db.func.sum(ItemSale.quantity).desc()
        )
        .first()
    )

    return query

