import logging

from app.extensions import db
from app.models.tenant import Tenant
from app.models.user import User

logger = logging.getLogger(__name__)


def tenant_database_seed(**kwargs):
    """creates the tenant, an admin and a user"""

    try:
        tenant_name = kwargs["tenant_name"]
        tenant_fantasy_name = kwargs["tenant_fantasy_name"]
        tenant_cnpj = kwargs["cnpj"]
        tenant_slug = kwargs["slug"]

        admin_name = kwargs["admin_name"]
        admin_email = kwargs["admin_email"]

        user_name = kwargs["user_name"]
        user_email = kwargs["user_email"]

        tenant = Tenant(
            name=tenant_name,
            fantasy_name=tenant_fantasy_name,
            cnpj=tenant_cnpj,
            plan="starter",
            slug=tenant_slug,
        )

        db.session.add(tenant)
        db.session.flush()

        admin = User(
            username=admin_name,
            email=admin_email,
            tenant_id=tenant.id,
            is_active=True,
            role="admin",
            password_reset=False,
        )

        admin_password = "123456"
        admin.set_password(admin_password)

        db.session.add(admin)
        db.session.flush()

        user = User(
            username=user_name,
            email=user_email,
            tenant_id=tenant.id,
            is_active=True,
            role="user",
            password_reset=False,
        )

        user_password = "123456"
        user.set_password(user_password)

        db.session.add(user)

        db.session.commit()

        logger.info(
            f"Created tenant (id: {tenant.id}, {tenant.name}), " 
            f"admin (id: {admin.id}, {admin.username}) and " 
            f"user (id: {user.id}, {user.username})"
        )

        return tenant.id

    except Exception as e:
        db.session.rollback()
        logger.error(f"Error creating tenant: {e}")
        return False
