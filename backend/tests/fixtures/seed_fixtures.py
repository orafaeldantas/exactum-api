import pytest
from sqlalchemy import select

from app.models.tenant import Tenant
from app.models.user import User


@pytest.fixture(scope="function")
def default_tenant(db_session):
    """Creates a default tenant using modern SQLAlchemy 2.x patterns."""

    stmt = select(Tenant).where(Tenant.id == 1)
    tenant = db_session.scalars(stmt).first()

    if tenant:
        return tenant

    tenant = Tenant(
        id=1,
        name="PYTEST",
        fantasy_name="PYTEST",
        cnpj=0,
        plan="PYTEST",
        slug="PYTEST",
    )
    db_session.add(tenant)
    db_session.commit()
    return tenant


@pytest.fixture(scope="function")
def default_user(db_session, default_tenant):
    """Creates a default user associated with the tenant using modern patterns."""

    stmt = select(User).where(User.id == 1)
    user = db_session.scalars(stmt).first()

    if user:
        return user

    user = User(
        username="Pytest User",
        email="user@pytest.com",
        tenant_id=default_tenant.id,
        is_active=True,
        role="admin",
        password_reset=False,
    )
    user.set_password("pytestuserpsw")
    db_session.add(user)
    db_session.commit()
    return user
