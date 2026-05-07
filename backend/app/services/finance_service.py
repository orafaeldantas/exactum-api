from app.extensions import db
from app.models import Sale, ItemSale
from flask import g
import logging


logger = logging.getLogger(__name__)

def get_finance_period(start_date, end_date):

    query = Sale.query.filter(
        Sale.tenant_id == g.tenant_id,
        Sale.created_at.between(start_date, end_date)
    )

    return query.all()

