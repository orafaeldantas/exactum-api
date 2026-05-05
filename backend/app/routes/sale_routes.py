from flask import Blueprint, request, jsonify
from app.services import sales_service
from flask_jwt_extended import jwt_required
from app.security import role_authorization
from flask import g
import logging

logger = logging.getLogger(__name__)

sale_bp = Blueprint("sales", __name__, url_prefix="/sales")

@sale_bp.route("", methods=["POST"])
@jwt_required()
@role_authorization(['user', 'admin', 'super-admin'])
def create():
    
    data = request.json
    logger.info(data)

    sale = sales_service.create_sales(data)
    return jsonify({"message": sale}), 201


@sale_bp.route("", methods=["GET"])
@jwt_required()
@role_authorization(['user', 'admin', 'super-admin'])
def list():

    month = int(request.args.get('month'))
    year = int(request.args.get('year'))

    sales = sales_service.list_sales(month, year)

    return jsonify([
        {
            "id": s.id,
            "total_price": s.total_price,
            "payment_method": s.payment_method,
            "quantity_items": s.quantity_items,
            "tenant_id": s.tenant_id,
            "user_id": s.user_id,
            "created_at": s.created_at

        }
        for s in sales   
    ])


@sale_bp.route("/<int:sale_id>/items", methods=["GET"])
@jwt_required()
@role_authorization(['user', 'admin', 'super-admin'])
def list_items(sale_id):
    items = sales_service.list_sale_items(sale_id)
    sale = sales_service.get_sale(sale_id)

    if not sale:
        return jsonify({"error": "Venda não encontrada"}), 404

    new_items = [
        {
            "id": i.id,
            "name": i.name,
            "quantity": i.quantity,
            "sku": i.sku,
            "item_price": getattr(i, 'item_price', 0)
        }
        for i in items        
    ]
   
    return jsonify({
        "id": sale.id,
        "total_price": sale.total_price,
        "payment_method": sale.payment_method,
        "created_at": sale.created_at,
        "quantity_items": sale.quantity_items,
        "items": new_items
    }), 200

"""
@sale_bp.route("/five-items", methods=["GET"])
@jwt_required()
@role_authorization(['user', 'admin', 'super-admin'])
def list_best_selling_items():
    ...

"""

    
