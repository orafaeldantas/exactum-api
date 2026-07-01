from marshmallow import Schema, fields


class SuperAdminListTenantsResponseSchema(Schema):
    uuid = fields.UUID(dump_only=True)

    name = fields.Str(required=True)

    fantasyName = fields.Str(required=True)

    cnpj = fields.Str(required=True)

    slug = fields.Str(required=True)

    plan = fields.Str(required=True)


class DashboardMetricsResponseSchema(Schema):
    active_tenants = fields.Int()

    blocked_tenants = fields.Int()

    tenants_created_current_month = fields.Int()

    active_users = fields.Int()
