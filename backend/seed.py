import os 
from run import app
from app.extensions import db
from app.models import User, Tenant

def seed_database():
    with app.app_context():
        admin_password = os.getenv("SUPER_ADMIN_PASSWORD")

        tenant = Tenant(
            name="SYSTEM",
            fantasy_name="SYSTEM",
            cnpj=00000000000000,
            plan="SYSTEM",
            slug="SYSTEM",
        )

        db.add(tenant)
        db.flush()

        user = User(
            username="Rafael Dantas",
            email="rafael@exactum.app.br",
            tenant_id=tenant.id, 
            is_active=True,
            role="super-admin",
            password_reset=False
            
        )

        user.set_password(admin_password)

        db.add(user)
        db.commit()

        print("Created super-admin!")

if __name__ == '__main__':
    seed_database()

