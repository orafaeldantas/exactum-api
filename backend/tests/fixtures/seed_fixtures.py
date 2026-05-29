import pytest

from app.extensions import db
from app.models.tenant import Tenant
from app.models.user import User


@pytest.fixture(scope="function")
def default_tenant(db_session):
    """Creates a default tenant in the test database for routes that require context."""

    tenant = Tenant.query.filter_by(id=1).first()

    if tenant:
        return tenant

    tenant = Tenant(
        id=1,
        name="PYTEST",
        fantasy_name="PYTEST",
        cnpj=00000000000000,
        plan="PYTEST",
        slug="PYTEST",
    )
    db.session.add(tenant)
    db.session.commit()
    return tenant


@pytest.fixture(scope="function")
def default_user(db_session, default_tenant):
    """Creates a default user associated with the tenant
    for testing authenticated routes."""

    user = User.query.filter_by(id=1).first()

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
    db.session.add(user)
    db.session.commit()
    return user
