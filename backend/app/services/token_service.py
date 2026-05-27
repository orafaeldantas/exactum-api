from flask_jwt_extended import create_access_token, get_jwt_identity


class TokenService:
    @staticmethod
    def build_claims(user, impersonate):
        print(impersonate)
        if impersonate:
            claims = {
                "tenant_id": user.tenant_id,
                "role": user.role,
                "is_impersonating": True,
                "super_admin_id": get_jwt_identity(),
            }

            return claims

        return {
            "tenant_id": user.tenant_id,
            "role": user.role,
            "password_reset": user.password_reset,
        }

    @staticmethod
    def generate_access_token(user, impersonate=False):

        return create_access_token(
            identity=str(user.id),
            additional_claims=(TokenService.build_claims(user, impersonate)),
        )
