from flask import Blueprint, request, jsonify
from app.services import product_service
from app.extensions import jwt_auth

product_bp = Blueprint("products", __name__, url_prefix="/products")

@product_bp.route("", methods=["POST"])
@jwt_auth
def create():
    data = request.json
    product = product_service.create_product(data)
    return jsonify({"id": product.id}), 201

@product_bp.route("", methods=["GET"])
@jwt_auth
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
@jwt_auth
def get(product_id):
    product = product_service.get_product(product_id)
    if not product:
        return jsonify({"error": "Product not found"}), 404
    
    return jsonify({
        "id": product.id,
        "name": product.name,
        "description": product.description,
        "price": str(product.price),
        "stock_quantity": product.stock_quantity

    })

@product_bp.route("/<int:product_id>", methods=["PUT"])
@jwt_auth
def update(product_id):
    product = product_service.get_product(product_id)
    if not product:
        return jsonify({"error": "Product not found"}, 404)
    
    data= request.json
    product_service.update_product(product, data)
    return jsonify({"message": "Product updated"})

@product_bp.route("/<int:product_id>", methods=["DELETE"])
@jwt_auth
def delete(product_id):
    product = product_service.get_product(product_id)
    if not product:
        return jsonify({"error": "Product not found"}, 404)
    
    product_service.delete_product(product)
    return jsonify({"message": "Product deactivated"})