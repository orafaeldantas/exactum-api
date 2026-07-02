from marshmallow import Schema, fields


class ListTenantsResponseSchema(Schema):
    uuid = fields.UUID(dump_only=True)

    name = fields.Str(required=True, dump_only=True)

    fantasyName = fields.Str(required=True, attribute="fantasy_name", dump_only=True)

    cnpj = fields.Str(required=True, dump_only=True)

    slug = fields.Str(required=True, dump_only=True)

    plan = fields.Str(required=True, dump_only=True)

    isActive = fields.Str(required=True, attribute="is_active", dump_only=True)

    createdAt = fields.DateTime(attribute="created_at", dump_only=True)


class DashboardMetricsResponseSchema(Schema):
    active_tenants = fields.Int(data_key="activeTenants")

    blocked_tenants = fields.Int(data_key="blockedTenants")

    tenants_created_current_month = fields.Int(data_key="tenantsCreatedCurrentMonth")

    active_users = fields.Int(data_key="activeUsers")

    last_tenants_registered = fields.List(
        fields.Nested(ListTenantsResponseSchema), data_key="lastTenantsRegistered"
    )
