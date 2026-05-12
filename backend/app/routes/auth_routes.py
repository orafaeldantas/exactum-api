from flask import Blueprint, request, jsonify, g
from flask_jwt_extended import create_access_token, jwt_required
from app.services import user_service, tenant_service
from app.models import User


auth_bp = Blueprint("auth", __name__, url_prefix="/auth")

@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.json

    user = User.query.filter_by(email=data.get("email"), is_active=True).first()
    

    if not user or not user.check_password(data["password"]):
        return jsonify({"error": "Invalid credentials"}), 401
    
  
    access_token = create_access_token(
    identity=str(user.id),
    additional_claims={
        "tenant_id": user.tenant_id,
        "username": user.username,
        "email": user.email,
        "role": user.role,
        "password_reset": user.password_reset
    }
)

    return jsonify(access_token=access_token)


@auth_bp.route("/bootstrap", methods=["GET"])
@jwt_required()
def bootstrap():

    print("=================entrou====================")  

    user = user_service.get_user(g.user_id)
    tenant = tenant_service.get_tenant_by_id()
    goal = tenant_service.get_goal()

    user_formated = {

        "username": user.username,
        "email": user.email
    }

    tenant_formated = {
        
        "name": tenant.name,
        "corporate_email": tenant.corporate_email,
        "global_min_stock": tenant.global_min_stock,
        "goal": goal.value if goal else 0
    }

    auth = {
        "user_id": g.user_id,
        "tenant_id": g.tenant_id,
        "role": g.role,
        "password_reset": g.password_reset
    }

    print(auth, tenant_formated, user_formated)   

    return jsonify({

        "auth": auth,
        "user": user_formated,
        "tenant": tenant_formated
 
    })



