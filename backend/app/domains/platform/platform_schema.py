from marshmallow import Schema, fields


class SuperAdminListTenantsResponseSchema(Schema):
    uuid = fields.UUID(dump_only=True)

    name = fields.Str(required=True)

    fantasyName = fields.Str(required=True)

    cnpj = fields.Str(required=True)

    slug = fields.Str(required=True)

    plan = fields.Str(required=True)


class DashboardMetricsResponseSchema(Schema):
    active_tenants = fields.Int(data_key="activeTenants")

    blocked_tenants = fields.Int(data_key="blockedTenants")

    tenants_created_current_month = fields.Int(data_key="tenantsCreatedCurrentMonth")

    active_users = fields.Int(data_key="activeUsers")
