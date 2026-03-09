from app.extensions import db
from app.models import User

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
    return User.query.all()

def update_user(user, data):
    
    if "username" in data:
        user.username = data["username"]

    if "role" in data:
        user.role = data["role"]  

    if "is_active" in data:
        user.is_active = data["is_active"]

    if "password" in data:
        user.set_password(data.get("password"))

    db.session.commit() 
 
    return user



