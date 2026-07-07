class PlatformEvents:
    USER_LOGIN = "user_login"
    USER_LOGOUT = "user_logout"

    TENANT_CREATED = "tenant_created"
    TENANT_UPDATED = "tenant_updated"
    TENANT_SUSPENDED = "tenant_suspended"
    TENANT_REACTIVATED = "tenant_reactivated"

    IMPERSONATION_STARTED = "impersonation_started"
    IMPERSONATION_FINISHED = "impersonation_finished"


class AuditEvents:
    PRODUCT_CREATED = "product_created"
    PRODUCT_UPDATED = "product_updated"
    PRODUCT_DELETED = "product_deleted"

    SALE_CREATED = "sale_created"
    SALE_CANCELLED = "sale_cancelled"
