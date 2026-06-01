import logging
import os

from app.extensions import db
from app.models.tenant import Tenant
from app.models.user import User

logger = logging.getLogger(__name__)


def super_admin_seed():
    """Create the super administrator and the system tenant"""

    try:
        tenant = Tenant.query.filter_by(id=1, name="SYSTEM").first()

        if tenant:
            return

        tenant = Tenant(
            name="SYSTEM",
            fantasy_name="SYSTEM",
            cnpj=00000000000000,
            plan="SYSTEM",
            slug="SYSTEM",
        )

        db.session.add(tenant)
        db.session.flush()

        user = User(
            username=os.getenv("SUPER_ADMIN_NAME"),
            email=os.getenv("SUPER_ADMIN_EMAIL"),
            tenant_id=tenant.id,
            is_active=True,
            role="super-admin",
            password_reset=False,
        )

        admin_password = os.getenv("SUPER_ADMIN_PASSWORD")
        user.set_password(admin_password)

        db.session.add(user)
        db.session.commit()

        logger.info("Created super-admin!")

        return True

    except Exception as e:
        db.session.rollback()
        logger.error(f"Error creating super administrator: {e}")
        return False


if __name__ == "__main__":
    super_admin_seed()
