from marshmallow import Schema, fields, validate


class LoginSchema(Schema):

    email = fields.Email(required=True)

    password = fields.Str(required=True, load_only=True)

class ResponseLoginSchema(Schema):

    access_token = fields.Str(dump_only=True)

    
class TenantBootstrapSchema(Schema):

    name = fields.Str(attribute="tenant.name")

    corporate_email = fields.Email(attribute="tenant.corporate_email")

    global_min_stock = fields.Int(attribute="tenant.global_min_stock")

    goal = fields.Int(attribute="goal.value")


class UserBootstrapSchema(Schema):

    id = fields.Int(attribute="user.id")

    username = fields.Str(attribute="user.username")

    email = fields.Email(attribute="user.email")


class AuthBootstrapSchema(Schema):

    user_id = fields.Int(attribute="user.id", dump_only=True)

    tenant_id = fields.Int(attribute="tenant.id", dump_only=True)

    role = fields.Str(attribute="user.role")

    password_reset = fields.Bool(attribute="user.password_reset")


class ResponseBootstrapSchema(Schema):

    user = fields.Nested(UserBootstrapSchema)

    tenant = fields.Nested(TenantBootstrapSchema)

    auth = fields.Nested(AuthBootstrapSchema)