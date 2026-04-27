from flask import Blueprint, request, jsonify
from app.services import product_service
from flask_jwt_extended import jwt_required
from app.security import role_authorization
from flask import g

product_bp = Blueprint("products", __name__, url_prefix="/products")

@product_bp.route("", methods=["POST"])
@jwt_required()
@role_authorization(['user', 'admin'])
def create():
    
    data = request.json
    product = product_service.create_product(data)
    return jsonify({"id": product.id}), 201

@product_bp.route("", methods=["GET"])
@jwt_required()
@role_authorization(['user', 'admin'])
def list_all():
    products = product_service.list_product()

    return jsonify([
        {
            "id": p.id,
            "name": p.name,
            "price": str(p.price),
            "stock_quantity": p.stock_quantity,
            "is_active": p.is_active,
            "sku": p.sku
        }
        for p in products
    ])

@product_bp.route("/<int:product_id>", methods=["GET"])
@jwt_required()
@role_authorization(['user', 'admin'])
def get(product_id):
    product = product_service.get_product(product_id)
    if not product:
        return jsonify({"error": "Product not found"}), 404
    
    
    return jsonify({
        "id": product.id,
        "name": product.name,
        "description": product.description,
        "price": str(product.price),
        "stock_quantity": product.stock_quantity,
        "sku": product.sku

    })

@product_bp.route("/<int:product_id>", methods=["PATCH"])
@jwt_required()
@role_authorization(['user', 'admin'])
def update(product_id):
    product = product_service.get_product(product_id)
    if not product:
        return jsonify({"error": "Product not found"}, 404)
    
    
    data = request.json
    product_service.update_product(product, data)
    return jsonify({"message": "Product updated"})


@product_bp.route("/<int:product_id>", methods=["DELETE"])
@jwt_required()
@role_authorization(['user', 'admin'])
def delete(product_id):
    product = product_service.get_product(product_id)
    if not product:
        return jsonify({"error": "Product not found"}, 404)
    
    
    product_service.delete_product(product)
    return jsonify({"message": "Product excluded"})