from collections.abc import Sequence
from typing import TYPE_CHECKING

from flask.views import MethodView
from flask_jwt_extended import jwt_required
from flask_smorest import Blueprint

from app.domains.rbac.decorators.permissions import permission_required
from app.domains.rbac.rbac_controller import RBACController
from app.domains.rbac.rbac_schema import ResponseRBACSchema

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
    def get(self) -> Sequence["Role"]:

        return RBACController.get_roles()
