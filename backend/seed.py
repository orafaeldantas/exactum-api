import os 
from run import app
from app.extensions import db
from app.models import User

def seed_database():
    with app.app_context():
        admin_password = os.getenv("", "root777")

        if not User.query.filter_by(username="superadmin").first():
            user = User(username="Rafael Dantas", is_admin=True)
            user.set_password(admin_password)
            db.session.add(user)
            db.session.commit()
            print("Created admin!")

if __name__ == '__main__':
    seed_database()

