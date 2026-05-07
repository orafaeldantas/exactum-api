from app.extensions import db
from app.models import Sale, ItemSale
from flask import g
import logging


def get_finance_period(start_date, end_date):

    query = Sale.query.filter_by(
        tenant_id=g.tenant_id
    ).filter(
        Sale.created_at >= start_date,
        Sale.created_at <= end_date
    )

    return query.all()

