from typing import TYPE_CHECKING

from flask_jwt_extended import (
    create_access_token,
    create_refresh_token,
    decode_token,
    get_jwt_identity,
)

if TYPE_CHECKING:
    from app.models.user import User


class TokenService:
    @staticmethod
    def build_claims(user: "User", impersonate: bool) -> dict:

        if impersonate:
            return {
                "tenant_id": user.tenant_id,
                "role": user.role,
                "is_impersonating": True,
                "super_admin_id": get_jwt_identity(),
            }

        return {
            "tenant_id": user.tenant_id,
            "role": user.role,
            "password_reset": user.password_reset,
        }

    @staticmethod
    def generate_access_token(
        user: "User",
        impersonate: bool = False,
    ) -> str:

        return create_access_token(
            identity=str(user.id),
            additional_claims=TokenService.build_claims(
                user,
                impersonate,
            ),
        )

    @staticmethod
    def generate_refresh_token(user: "User") -> str:

        return create_refresh_token(
            identity=str(user.id),
            additional_claims={
                "tenant_id": user.tenant_id,
            },
        )

    @staticmethod
    def extract_jti(token: str) -> str:

        decoded = decode_token(token)

        return str(decoded["jti"])
