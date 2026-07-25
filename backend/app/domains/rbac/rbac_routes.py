from __future__ import annotations

from collections.abc import Sequence
from typing import TYPE_CHECKING
from uuid import UUID

from flask.views import MethodView
from flask_jwt_extended import jwt_required
from flask_smorest import Blueprint

from app.domains.rbac.decorators.permissions import permission_required
from app.domains.rbac.rbac_controller import RBACController
from app.domains.rbac.rbac_schema import (
    ResponseRBACSchema,
    ResponseRoleWithPermissions,
    UpdateRole,
)

if TYPE_CHECKING:
    from app.models.rbac import Role

blp_rbac = Blueprint(
    "rbac", __name__, url_prefix="/rbac", description="RBAC operations"
)


@blp_rbac.route("/roles")
class RBACRoute(MethodView):
    @jwt_required()
    @permission_required("rbac:view")
    @blp_rbac.doc(security=[{"CookieAuth": []}])
    @blp_rbac.response(200, ResponseRBACSchema(many=True))
    def get(self) -> Sequence[Role]:

        return RBACController.get_roles()


@blp_rbac.route("/roles/<uuid:role_uuid>")
class RoleItem(MethodView):
    @jwt_required()
    @permission_required("rbac:view")
    @blp_rbac.doc(security=[{"CookieAuth": []}])
    @blp_rbac.arguments(UpdateRole)
    @blp_rbac.response(200)
    def patch(self, data: dict, role_uuid: UUID) -> None:

        return RBACController.update_role(data, role_uuid)


@blp_rbac.route("/roles-permissions")
class RolesWithPermissionsRoute(MethodView):
    @jwt_required()
    @permission_required("rbac:view")
    @blp_rbac.doc(security=[{"CookieAuth": []}])
    @blp_rbac.response(200, ResponseRoleWithPermissions(many=True))
    def get(self) -> Sequence[Role]:

        return RBACController.get_roles_with_permissions()
