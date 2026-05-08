from flask import Blueprint, request, jsonify
from app.services import finance_service
from flask_jwt_extended import jwt_required
from app.security import role_authorization
from datetime import datetime, timedelta, timezone
from flask import g
import logging

logger = logging.getLogger(__name__)

finance_bp = Blueprint("finance", __name__, url_prefix="/finance")


@finance_bp.route("/period", methods=["GET"])
@jwt_required()
@role_authorization(['user', 'admin', 'super-admin'])
def list_finance_period():

    period = request.args.get('period')

    date_now = datetime.now(timezone.utc)

    if period == "today":
        start_date = date_now.replace(hour=0, minute=0, second=0, microsecond=0)

    elif period == "7d":
        start_date = date_now - timedelta(days=7)
    
    elif period == "30d":
        start_date = date_now - timedelta(days=30)

    elif period == "60d":
        start_date = date_now - timedelta(days=60)

    elif period == "90d":
        start_date = date_now - timedelta(days=90)

    elif period == "month":
        start_date = date_now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

    elif period == "year":
        start_date = date_now.replace(month=1, day=1, hour=0, minute=0, second=0, microsecond=0)

    else:
        return jsonify({"error": "Invalid period"}), 400
    

    end_date = datetime.now(timezone.utc)


    data = finance_service.get_finance_period(start_date, end_date)

    if not data:
        return jsonify({"error": "Data not found"}), 404

    total_revenue = 0.0
    total_products_sold = 0
    payment_method = {"pix": 0.0, "money": 0.0, "credit": 0.0, "debit": 0.0}
    for sale in data:
        total_revenue += float(sale.total_price)
        total_products_sold += sale.quantity_items
        if sale.payment_method in payment_method:
            payment_method[sale.payment_method] += float(sale.total_price)


    total_sales = len(data)

    average_ticket = float(total_revenue) / float(total_sales)
    
   
    return jsonify({
        "total_revenue": total_revenue,
        "total_sales": total_sales,
        "total_products_sold": total_products_sold,
        "average_ticket": average_ticket,
        "monthly_target": "150.000",
        "pix": payment_method["pix"],
        "money": payment_method["money"],
        "debit": payment_method["debit"],
        "credit": payment_method["credit"],
    }), 200