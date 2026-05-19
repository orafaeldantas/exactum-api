from marshmallow import Schema, fields, validate


class LoginSchema(Schema):

    email = fields.Email(required=True)

    password = fields.Str(required=True, load_only=True)
    

class ResponseLoginSchema(Schema):

    access_token = fields.Str(dump_only=True)

    
class TenantBootstrapSchema(Schema):

    name = fields.Str()

    corporate_email = fields.Email()

    global_min_stock = fields.Int()

    goal = fields.Decimal()


class UserBootstrapSchema(Schema):

    id = fields.Int()

    username = fields.Str()

    email = fields.Email()


class AuthBootstrapSchema(Schema):

    user_id = fields.Int(dump_only=True)

    tenant_id = fields.Int(dump_only=True)

    role = fields.Str()

    password_reset = fields.Bool()

    
class ResponseBootstrapSchema(Schema):

    user = fields.Nested(UserBootstrapSchema)

    tenant = fields.Nested(TenantBootstrapSchema)

    auth = fields.Nested(AuthBootstrapSchema)