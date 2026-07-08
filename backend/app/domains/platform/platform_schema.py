from marshmallow import Schema, fields


class ListTenantsResponseSchema(Schema):
    uuid = fields.UUID(attribute="tenant.uuid", dump_only=True)

    name = fields.Str(attribute="tenant.name", required=True, dump_only=True)

    fantasyName = fields.Str(
        attribute="tenant.fantasy_name", required=True, dump_only=True
    )

    cnpj = fields.Str(attribute="tenant.cnpj", required=True, dump_only=True)

    slug = fields.Str(attribute="tenant.slug", required=True, dump_only=True)

    plan = fields.Str(attribute="tenant.plan", required=True, dump_only=True)

    isActive = fields.Bool(attribute="tenant.is_active", required=True, dump_only=True)

    createdAt = fields.DateTime(attribute="tenant.created_at", dump_only=True)

    usersCount = fields.Int(attribute="users_count", dump_only=True)


class GetPlatformEventsSchema(Schema):
    userUuid = fields.UUID(dump_only=True, attribute="user_uuid")

    tenantUuid = fields.UUID(dump_only=True, attribute="tenant_uuid")

    event = fields.Str(dump_only=True)

    payload = fields.Dict(dump_only=True)

    createdAt = fields.DateTime(attribute="created_at", dump_only=True)


class ListTenantDashboardMetricsSchema(Schema):
    uuid = fields.UUID(dump_only=True)

    name = fields.Str(required=True, dump_only=True)

    fantasyName = fields.Str(attribute="fantasy_name", required=True, dump_only=True)

    cnpj = fields.Str(required=True, dump_only=True)

    slug = fields.Str(required=True, dump_only=True)

    plan = fields.Str(required=True, dump_only=True)

    isActive = fields.Bool(attribute="is_active", required=True, dump_only=True)

    createdAt = fields.DateTime(attribute="created_at", dump_only=True)


class DashboardMetricsResponseSchema(Schema):
    active_tenants = fields.Int(data_key="activeTenants")

    blocked_tenants = fields.Int(data_key="blockedTenants")

    tenants_created_current_month = fields.Int(data_key="tenantsCreatedCurrentMonth")

    active_users = fields.Int(data_key="activeUsers")

    last_tenants_registered = fields.List(
        fields.Nested(ListTenantDashboardMetricsSchema),
        data_key="lastTenantsRegistered",
    )


class UdateStatusTenantSchema(Schema):
    status = fields.Bool(attribute="is_active")
