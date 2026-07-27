from collections.abc import Sequence
from uuid import UUID

from sqlalchemy import delete, select
from sqlalchemy.orm import selectinload

from app.extensions import db
from app.models.rbac import (
    Permission,
    Role,
    RolePermission,
    UserPermission,
    UserRole,
)


class RBACRepository:
    # ========================= ROLE =========================
    def get_role_by_id(self, role_id: int) -> Role | None:
        return db.session.get(Role, role_id)

    def get_role_by_uuid(self, role_uuid: UUID, tenant_id: int) -> Role | None:
        stmt = select(Role).where(Role.uuid == role_uuid, Role.tenant_id == tenant_id)
        return db.session.execute(stmt).scalar_one_or_none()

    def get_role_admin_by_tenant(self, tenant_id: int) -> Role | None:
        stmt = select(Role).where(
            Role.tenant_id == tenant_id, Role.name == "administrator"
        )
        return db.session.scalar(stmt)

    def get_roles_by_tenant_id(self, tenant_id: int) -> Sequence[Role]:
        stmt = select(Role).where(Role.tenant_id == tenant_id)
        return db.session.scalars(stmt).all()

    def delete_role(self, role_id: int) -> None:
        stmt = delete(Role).where(Role.id == role_id)
        db.session.execute(stmt)
        db.session.commit()

    # ========================= PERMISSION =========================
    def get_permission_by_id(self, permission_id: int) -> Permission | None:
        return db.session.get(Permission, permission_id)

    def get_permission_by_code(self, code: str) -> Permission | None:
        stmt = select(Permission).where(Permission.code == code)
        return db.session.execute(stmt).scalar_one_or_none()

    def get_permissions(self) -> Sequence[Permission]:
        stmt = select(Permission)
        return db.session.scalars(stmt).all()

    # ========================= USER ROLES =========================
    def get_user_roles(self, user_id: int) -> Sequence[UserRole]:
        stmt = select(UserRole).where(UserRole.user_id == user_id)
        return db.session.execute(stmt).scalars().all()

    def get_user_by_role_id(self, role_id: int) -> UserRole | None:
        stmt = select(UserRole).where(UserRole.role_id == role_id)
        return db.session.scalar(stmt)

    def add_user_role(self, user_id: int, role_id: int) -> None:
        db.session.add(UserRole(user_id=user_id, role_id=role_id))

    def remove_user_roles(self, user_id: int) -> None:
        stmt = delete(UserRole).where(UserRole.user_id == user_id)
        db.session.execute(stmt)

    # ========================= USER PERMISSIONS =========================
    def get_user_permissions(self, user_id: int) -> Sequence[UserPermission]:
        stmt = select(UserPermission).where(UserPermission.user_id == user_id)
        return list(db.session.execute(stmt).scalars().all())

    def add_user_permission(self, user_id: int, permission_id: int) -> None:
        db.session.add(
            UserPermission(user_id=user_id, permission_id=permission_id, granted=True)
        )

    def remove_user_permission(self, user_id: int, permission_id: int) -> None:
        stmt = delete(UserPermission).where(
            UserPermission.user_id == user_id,
            UserPermission.permission_id == permission_id,
        )
        db.session.execute(stmt)

    # ========================= ROLE PERMISSIONS =========================
    def get_role_permissions(self, role_ids: list[int]) -> Sequence[RolePermission]:
        stmt = select(RolePermission).where(RolePermission.role_id.in_(role_ids))
        return list(db.session.execute(stmt).scalars().all())

    def delete_role_permissions(self, role_id: int) -> None:
        stmt = delete(RolePermission).where(RolePermission.role_id == role_id)
        db.session.execute(stmt)
        db.session.commit()

    # ====================== ROLE WITH PERMISSIONS =======================
    def get_roles_with_permissions(self, tenant_id: int) -> Sequence[Role]:
        stmt = (
            select(Role)
            .where(Role.tenant_id == tenant_id)
            .options(selectinload(Role.permissions))
        )
        return db.session.execute(stmt).scalars().unique().all()
