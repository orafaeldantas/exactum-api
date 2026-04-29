from app.extensions import db
from app.models import User
from flask import g

def create_user(data):
    user = User(
        username=data.get("username"),
        is_active=data.get("is_active"),
        role=data.get("role", "user")
    )

    user.set_password(data.get("password"))

    db.session.add(user)
    db.session.commit()

    return user

def get_user(user_id):
    return User.query.filter_by(id=user_id).first() 


def list_users():
    return User.query.filter_by(tenant_id=g.tenant_id).all()

def update_user(user, data):

    user.username = data.get("username", user.username)
    user.role = data.get("role", user.role)
    user.is_active = data.get("is_active", user.is_active)
    user.password_reset = data.get("password_reset", user.password_reset)
    
    if data.get("password"):
        user.set_password(data.get("password"))

    db.session.commit() 
 
    return user

def new_password(user, data):
 
    if "password" in data:
        user.set_password(data.get("password"))

    if "password_reset" in data:
        user.password_reset = data.get("password_reset")
      

    db.session.commit()

    return user



