from __future__ import annotations

from collections.abc import Sequence
from typing import cast
from uuid import UUID

from app.core.cache.cache_keys import CacheKeys
from app.domains.rbac.constants import DEFAULT_ROLES
from app.domains.rbac.rbac_dto import RoleWithPermissionsDTO
from app.domains.rbac.rbac_exceptions import RoleNotFound
from app.domains.rbac.rbac_mapper import RBACMapper
from app.domains.rbac.rbac_repository import RBACRepository
from app.extensions import db
from app.models.rbac import Permission, Role, RolePermission, UserRole


class RBACService:
    def __init__(self, repo: RBACRepository, cache):
        self.repo = repo
        self.cache = cache

    def _invalidate_user_cache(self, tenant_id: int, user_id: int):
        key = f"tenant:{tenant_id}:user:{user_id}:permissions"
        self.cache.delete(key)

    # ========================= ASSIGN ROLE =========================
    def assign_role_to_user(self, tenant_id: int, user_id: int, role_id: int) -> None:
        self.repo.remove_user_roles(user_id)
        self.repo.add_user_role(user_id, role_id)

        db.session.commit()

        self._invalidate_user_cache(tenant_id, user_id)

    # ========================= GRANT USER PERMISSION =========================
    def grant_permission(self, tenant_id: int, user_id: int, permission_id: int):
        self.repo.add_user_permission(user_id, permission_id)

        db.session.commit()

        self._invalidate_user_cache(tenant_id, user_id)

    # ========================= GET ROLES =========================
    def get_roles(self, tenant_id: int) -> Sequence[Role]:
        return self.repo.get_roles_by_tenant_id(tenant_id)

    def get_user_roles(self, user_id: int) -> Sequence[UserRole]:
        return self.repo.get_user_roles(user_id)

    def get_role_by_id(self, role_id: int) -> Role:

        role = self.repo.get_role_by_id(role_id)

        if not role:
            raise RoleNotFound()

        return role

    # ========================= REVOKE USER PERMISSION =========================
    def revoke_permission(self, tenant_id: int, user_id: int, permission_id: int):
        self.repo.remove_user_permission(user_id, permission_id)

        db.session.commit()

        self._invalidate_user_cache(tenant_id, user_id)

    # ========================= EFFECTIVE PERMISSIONS =========================
    def get_effective_permissions(self, tenant_id: int, user_id: int) -> set[str]:
        cache_key = CacheKeys.permissions(tenant_id, user_id)

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

        self.cache.set_cache(cache_key, ",".join(permissions))

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

    def create_role(self, tenant_id: int, data: dict) -> None:

        role_name: str = data.get("name")

        role_permissions: list[str] = data.get("permissions")

        role: Role = Role(
            tenant_id=tenant_id,
            name=role_name,
        )

        db.session.add(role)
        db.session.flush()

        permissions: Sequence[Permission] = self.repo.get_permissions()

        permissions_map = {permission.code: permission for permission in permissions}

        for permission_code in role_permissions:
            permission = permissions_map.get(permission_code)

            if not permission:
                raise ValueError(f"Permission '{role_permissions}' not found.")

            db.session.add(
                RolePermission(
                    role_id=role.id,
                    permission_id=permission.id,
                )
            )

        db.session.commit()

    def update_role(self, tenant_id: int, role_uuid: UUID, data: dict) -> None:

        role: Role | None = self.repo.get_role_by_uuid(role_uuid, tenant_id)

        if not role:
            raise RoleNotFound()

        new_role_name: str | None = data.get("new_name", None)

        if new_role_name:
            if role.name != new_role_name:
                role.name = str(new_role_name)

        new_permissions: list[str] | None = data.get("new_permissions", None)

        if new_permissions:
            self.repo.delete_role_permissions(role.id)

            permissions: Sequence[Permission] = self.repo.get_permissions()

            permissions_map = {
                permission.code: permission for permission in permissions
            }

            for permission_code in new_permissions:
                permission = permissions_map.get(permission_code)

                if not permission:
                    raise ValueError(f"Permission '{new_permissions}' not found.")

                db.session.add(
                    RolePermission(
                        role_id=role.id,
                        permission_id=permission.id,
                    )
                )

        if new_permissions or new_role_name:
            db.session.commit()

    def delete_role(self, tenant_id: int, role_uuid: UUID) -> None:

        role = self.repo.get_role_by_uuid(role_uuid, tenant_id)

        self.repo.delete_role_permissions(role.id)
        self.repo.delete_role(role.id)

    # ====================== GET ROLE WITH PERMISSIONS =======================
    def get_roles_with_permissions(
        self, tenant_id: int
    ) -> Sequence[RoleWithPermissionsDTO]:
        roles: Sequence[Role] = self.repo.get_roles_with_permissions(tenant_id)

        roles_with_permissions: list[RoleWithPermissionsDTO] = [
            RBACMapper.role_with_permissions_to_dto(r) for r in roles
        ]

        return cast(Sequence[RoleWithPermissionsDTO], roles_with_permissions)
