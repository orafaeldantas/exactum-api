from collections.abc import Sequence

from app.domains.rbac.constants import DEFAULT_ROLES
from app.domains.rbac.rbac_repository import RBACRepository
from app.extensions import db
from app.models.rbac import Role, RolePermission


class RBACService:
    def __init__(self, repo: RBACRepository, cache):
        self.repo = repo
        self.cache = cache

    def _invalidate_user_cache(self, user_id: int):
        key = f"permissions:user:{user_id}"
        self.cache.delete(key)

    # ========================= ASSIGN ROLE =========================
    def assign_role_to_user(self, user_id: int, role_id: int) -> None:
        self.repo.remove_user_roles(user_id)
        self.repo.add_user_role(user_id, role_id)

        db.session.commit()

        self._invalidate_user_cache(user_id)

    # ========================= GRANT USER PERMISSION =========================
    def grant_permission(self, user_id: int, permission_id: int):
        self.repo.add_user_permission(user_id, permission_id)

        db.session.commit()

        self._invalidate_user_cache(user_id)

    # ========================= GET ROLES =========================
    def get_roles(self, tenant_id: int) -> Sequence[Role]:
        return self.repo.get_roles_by_tenant_id(tenant_id)

    # ========================= REVOKE USER PERMISSION =========================
    def revoke_permission(self, user_id: int, permission_id: int):
        self.repo.remove_user_permission(user_id, permission_id)

        db.session.commit()

        self._invalidate_user_cache(user_id)

    # ========================= EFFECTIVE PERMISSIONS =========================
    def get_effective_permissions(self, user_id: int) -> set[str]:
        cache_key = f"permissions:user:{user_id}"

        cached = self.cache.get(cache_key)
        if cached:
            return set(cached.split(","))

        user_roles = self.repo.get_user_roles(user_id)
        role_ids = [r.role_id for r in user_roles]

        role_permissions = self.repo.get_role_permissions(role_ids)
        user_permissions = self.repo.get_user_permissions(user_id)

        permissions: set[str] = set()

        for rp in role_permissions:
            perm = self.repo.get_permission_by_id(rp.permission_id)
            if perm:
                permissions.add(perm.code)

        for up in user_permissions:
            perm = self.repo.get_permission_by_id(up.permission_id)
            if not perm:
                continue

            if up.granted:
                permissions.add(perm.code)
            else:
                permissions.discard(perm.code)

        self.cache.set(cache_key, ",".join(permissions), ex=3600)

        return permissions

    # ========================= CREATE ROLES =========================
    def create_default_roles(self, tenant_id: int) -> None:

        permissions = self.repo.get_permissions()

        permissions_map = {permission.code: permission for permission in permissions}

        roles_map: dict[str, Role] = {}

        for role_name in DEFAULT_ROLES:
            role = Role(
                tenant_id=tenant_id,
                name=role_name,
            )

            db.session.add(role)

            roles_map[role_name] = role

        db.session.flush()

        for role_name, permission_codes in DEFAULT_ROLES.items():
            role = roles_map[role_name]

            for permission_code in permission_codes:
                permission = permissions_map.get(permission_code)

                if not permission:
                    raise ValueError(f"Permission '{permission_code}' not found.")

                db.session.add(
                    RolePermission(
                        role_id=role.id,
                        permission_id=permission.id,
                    )
                )
