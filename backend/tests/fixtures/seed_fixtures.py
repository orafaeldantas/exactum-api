import pytest
from sqlalchemy import select

from app.domains.rbac.container import get_rbac_service
from app.domains.rbac.rbac_service import RBACRepository
from app.infra.seed.rbac_seed import seed_rbac
from app.models.product import Product
from app.models.sale import ItemSale, Sale
from app.models.tenant import Tenant
from app.models.user import User


@pytest.fixture(scope="function")
def default_tenant(db_session):
    """Creates a default tenant."""

    seed_rbac()

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
    db_session.flush()
    get_rbac_service().create_default_roles(tenant.id)
    db_session.commit()
    return tenant


@pytest.fixture(scope="function")
def default_user(db_session, default_tenant):
    """Creates a default user associated with the tenant."""

    stmt = select(User).where(User.id == 1)
    user = db_session.scalars(stmt).first()

    if user:
        return user

    user = User(
        username="Pytest User",
        email="user@pytest.com",
        tenant_id=default_tenant.id,
        is_active=True,
        password_reset=False,
    )
    user.set_password("pytestuserpsw")
    db_session.add(user)
    db_session.flush()
    role_admin = RBACRepository().get_role_admin_by_tenant(default_tenant.id)

    if not role_admin:
        raise KeyError("Not found role")

    RBACRepository().add_user_role(user.id, role_admin.id)

    db_session.commit()
    return user


@pytest.fixture(scope="function")
def default_roles(default_tenant):
    roles = get_rbac_service().get_all_roles(default_tenant.id)

    admin_role = next((role for role in roles if role.name == "administrator"), None)

    return admin_role


@pytest.fixture(scope="function")
def default_product(db_session, default_tenant):
    """Creates a default product associated with the tenant."""

    stmt = select(Product).where(Product.id == 1)
    product = db_session.scalars(stmt).first()

    if product:
        return product

    product = Product(
        tenant_id=default_tenant.id,
        name="PYTEST PRODUCT",
        description="PYTEST PRODUCT",
        price=1000.00,
        stock_quantity=25,
        sku="PYT",
        category="PYTEST",
        is_active=True,
    )

    db_session.add(product)
    db_session.commit()
    return product


@pytest.fixture(scope="function")
def default_sale(db_session, default_tenant, default_user, default_product):
    """Creates a default sale associated with the tenant and product."""

    stmt = select(Sale).where(Sale.id == 1)
    sale = db_session.scalars(stmt).first()

    if sale:
        return sale

    sale = Sale(
        total_price=default_product.price,
        payment_method="pix",
        quantity_items=1,
        tenant_id=default_tenant.id,
        user_id=default_user.id,
        channel="physical",
    )

    db_session.add(sale)
    db_session.flush()

    item = ItemSale(
        name=default_product.name,
        quantity=1,
        sku=default_product.sku,
        item_price=default_product.price,
        sale_id=sale.id,
        tenant_id=default_tenant.id,
        user_id=default_user.id,
        product_id=default_product.id,
        channel="physical",
    )

    db_session.add(item)
    db_session.commit()
    return sale
