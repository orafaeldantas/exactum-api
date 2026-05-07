from flask import Blueprint, request, jsonify
from app.services import finance_service
from flask_jwt_extended import jwt_required
from app.security import role_authorization
from datetime import datetime, timedelta, date
from flask import g
import logging

logger = logging.getLogger(__name__)

finance_bp = Blueprint("finance", __name__, url_prefix="/finance")


@finance_bp.route("/period", methods=["GET"])
@jwt_required()
@role_authorization(['user', 'admin', 'super-admin'])
def list_finance_period():

    period_days = int(request.args.get('period'))

    start_date = date.today()
    end_date = date.today() - timedelta(days=period_days)

    data = finance_service.get_finance_period(start_date, end_date)

    if not data:
        return jsonify({"error": "Data not found"}), 404

    total_revenue = 0.0
    total_products_sold = 0
    for sale in data:
        total_revenue += sale.total_price
        total_products_sold += sale.quantity_items

    total_sales = len(data)

    average_ticket = float(total_revenue) / float(total_sales)
    
   
    return jsonify({
        "total_revenue": total_revenue,
        "total_sales": total_sales,
        "total_products_sold": total_products_sold,
        "average_ticket": average_ticket,
        "monthly_target": "150.000"
    }), 200