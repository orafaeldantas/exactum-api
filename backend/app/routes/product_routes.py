from flask import Blueprint, request, jsonify
from app.services import product_service
from flask_jwt_extended import get_jwt_identity, jwt_required, get_jwt

product_bp = Blueprint("products", __name__, url_prefix="/products")

@product_bp.route("", methods=["POST"])
@jwt_required()
def create():
    data = request.json
    product = product_service.create_product(data)
    return jsonify({"id": product.id}), 201

@product_bp.route("", methods=["GET"])
@jwt_required()
def list_all():
    products = product_service.list_product()
    return jsonify([
        {
            "id": p.id,
            "name": p.name,
            "price": str(p.price),
            "stock_quantity": p.stock_quantity
        }
        for p in products
    ])

@product_bp.route("/<int:product_id>", methods=["GET"])
@jwt_required()
def get(product_id):
    product = product_service.get_product(product_id)
    if not product:
        return jsonify({"error": "Product not found"}), 404
    
    claims = get_jwt()
    if not claims.get("is_admin") and str(product.user_id) != str(get_jwt_identity()):
        return jsonify({"error": "Forbidden: You are not the owner or an admin"}), 403
    
    return jsonify({
        "id": product.id,
        "name": product.name,
        "description": product.description,
        "price": str(product.price),
        "stock_quantity": product.stock_quantity

    })

@product_bp.route("/<int:product_id>", methods=["PUT"])
@jwt_required()
def update(product_id):
    product = product_service.get_product(product_id)
    if not product:
        return jsonify({"error": "Product not found"}, 404)
    
    if product.user_id != get_jwt_identity():
        return jsonify({"error": "Forbidden"}), 403
    
    data= request.json
    product_service.update_product(product, data)
    return jsonify({"message": "Product updated"})

@product_bp.route("/<int:product_id>", methods=["DELETE"])
@jwt_required()
def delete(product_id):
    product = product_service.get_product(product_id)
    if not product:
        return jsonify({"error": "Product not found"}, 404)
    
    if product.user_id != get_jwt_identity():
        return jsonify({"error": "Forbidden"}), 403
    
    product_service.delete_product(product)
    return jsonify({"message": "Product deactivated"})