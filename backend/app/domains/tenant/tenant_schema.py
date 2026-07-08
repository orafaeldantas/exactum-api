from marshmallow import Schema, fields, validate


class TenantSchema(Schema):
    name = fields.Str(required=True)

    fantasyName = fields.Str(required=True, attribute="fantasy_name")

    cnpj = fields.Str(required=True)

    slug = fields.Str(required=True)


class PlanSchema(Schema):
    type = fields.Str(required=True, validate=validate.OneOf(["starter"]))

    features = fields.Dict()


class AdminSchema(Schema):
    firstName = fields.Str(required=True)

    lastName = fields.Str(required=True)

    email = fields.Email(required=True)

    password = fields.Str(required=True)

    confirmPassword = fields.Str(required=True)


class CreateTenantSchema(Schema):
    admin = fields.Nested(AdminSchema, required=True)

    company = fields.Nested(TenantSchema, required=True)

    plan = fields.Nested(PlanSchema, required=True)


class ResponseTenantSchema(Schema):
    uuid = fields.UUID(dump_only=True)

    name = fields.Str()

    global_min_stock = fields.Int()

    corporate_email = fields.Email()


class UdateTenantSchema(Schema):
    name = fields.Str(data_key="companyName")

    global_min_stock = fields.Int(data_key="minimumStock")

    corporate_email = fields.Email(
        data_key="companyEmail", load_default=None, allow_none=True
    )

    monthly_goal = fields.Int(data_key="monthlyGoal")


class ResponseUdateTenantSchema(Schema):
    uuid = fields.UUID(dump_only=True)

    name = fields.Str()


class ResponseCreateTenantSchema(ResponseUdateTenantSchema):
    pass
