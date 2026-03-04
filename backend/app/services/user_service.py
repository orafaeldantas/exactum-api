from app.extensions import db
from app.models import User

def create_user(data):
    user = User(
        username=data.get("username"),
        is_active=data.get("is_active"),
        is_admin=data.get("is_admin")
    )

    user.set_password(data.get("password"))

    db.session.add(user)
    db.session.commit()

    return user



