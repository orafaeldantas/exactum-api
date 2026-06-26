from app.domains.rbac.rbac_repository import RBACRepository
from app.extensions import db
from app.models.rbac import Permission

PERMISSIONS = [
    "product:view",
    "product:create",
    "product:update",
    "product:delete",
    "sale:view",
    "sale:create",
    "sale:cancel",
    "user:view",
    "user:create",
    "user:update",
    "user:delete",
    "profile:update",
    "profile:view",
    "tenant:view",
    "tenant:update",
    "analytics:view",
]


def seed_rbac():

    for code in PERMISSIONS:
        exists = RBACRepository().get_permission_by_code(code)

        if exists:
            continue

        db.session.add(Permission(code=code))

    db.session.commit()
