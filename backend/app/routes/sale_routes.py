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
@role_authorization(['user', 'admin'])
def create():
    
    data = request.json
    logger.info(data)

    sale = sales_service.create_sales(data)
    return jsonify({"message": sale}), 201


    

