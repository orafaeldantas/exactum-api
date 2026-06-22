from marshmallow import Schema, fields


class LoginSchema(Schema):
    email = fields.Email(required=True)

    password = fields.Str(required=True, load_only=True)


class ResponseLoginSchema(Schema):
    access_token = fields.Str(dump_only=True)

    refresh_token = fields.Str(dump_only=True)


class RefreshResponseSchema(Schema):
    access_token = fields.Str(dump_only=True)


class LogoutResponseSchema(Schema):
    message = fields.String(required=True)


class TenantBootstrapSchema(Schema):
    name = fields.Str()

    corporate_email = fields.Email()

    global_min_stock = fields.Int()

    goal = fields.Decimal()


class UserBootstrapSchema(Schema):
    uuid = fields.UUID(dump_only=True)

    username = fields.Str()

    email = fields.Email()

    role = fields.Str()


class AuthBootstrapSchema(Schema):
    user_uuid = fields.UUID(dump_only=True)

    tenant_uuid = fields.UUID(dump_only=True)

    role = fields.Str()

    password_reset = fields.Bool()


class ResponseBootstrapSchema(Schema):
    user = fields.Nested(UserBootstrapSchema)

    tenant = fields.Nested(TenantBootstrapSchema)

    auth = fields.Nested(AuthBootstrapSchema)

    impersonate_mode = fields.Bool()


class RunImpersonateResponseSchema(Schema):
    message = fields.Str()


class StopImpersonateResponseSchema(RunImpersonateResponseSchema):
    pass
