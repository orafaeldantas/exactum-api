from app.models.user import User


class TenantQueries:
    @staticmethod
    def get_users_by_tenant(tenant_id) -> int:
        user = User.query.filter_by(tenant_id=tenant_id, role="admin").first()

        return user.id
