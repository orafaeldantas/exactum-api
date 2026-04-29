import os 
from run import app
from app.extensions import db
from app.models import User

def seed_database():
    with app.app_context():
        admin_password = os.getenv("", "root777")

        if not User.query.filter_by(username="Rafael Dantas").first():
            user = User(
                id=0,
                username="Rafael Dantas", 
                role="super-admin",
                email="rafaeldantas",
                password_reset=False,
                tenant_id=0
            )
            user.set_password(admin_password)
            db.session.add(user)
            db.session.commit()
            print("Created superadmin!")

if __name__ == '__main__':
    seed_database()

