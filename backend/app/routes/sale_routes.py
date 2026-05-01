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

sale_bp.route("", methods=["POST"])
@jwt_required()
@role_authorization(['user', 'admin', 'super-admin'])
def list():

    data = request.json

    sales = sales_service.list_sales()

    return jsonify([
        {
            "id": s.id,
            "price": s.price,
            "payment_method": s.payment_method,
            "quantity_items": s.quantity_items,
            "tenant_id": s.tenant_id,
            "user_id": s.user_id
        }
        for s in sales   
    ])

    
"""
    id = db.Column(db.Integer, primary_key=True)
    price = db.Column(db.Numeric(10, 2), nullable=False)
    payment_method = db.Column(db.String(50), nullable=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    quantity_items = db.Column(db.Integer, nullable=False, default=1)
    tenant_id = db.Column(db.Integer, db.ForeignKey('tenants.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
"""
