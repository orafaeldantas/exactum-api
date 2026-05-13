from flask_jwt_extended import create_access_token

class TokenService:

    @staticmethod
    def build_claims(user):

        return {
            "tenant_id": user.tenant_id,
            "role": user.role,
            "password_reset": user.password_reset
        }

    @staticmethod
    def generate_access_token(user):

        return create_access_token(
            identity=str(user.id),
            additional_claims=(
                TokenService.build_claims(user)
            )
        )