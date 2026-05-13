
from marshmallow import Schema, fields, validate



class TenantSchema(Schema):

    name = fields.Str(required=True)

    fantasyName = fields.Str(required=True)

    cnpj = fields.Str(required=True)

    slug = fields.Str(required=True)


class PlanSchema(Schema):

    type = fields.Str(
        required=True,
        validate=validate.OneOf([
            "starter",
            "pro",
            "enterprise"
        ])
    )


class UserSchema(Schema):

    firstName = fields.Str(required=True)

    lastName = fields.Str(required=True)

    email =  fields.Email(required=True)


class CreateTenantSchema(Schema):

    user = fields.Nested(
        UserSchema,
        required=True
    )

    tenant = fields.Nested(
        TenantSchema,
        required=True
    )

    plan = fields.Nested(
        PlanSchema,
        required=True
    )

class ResponseTenantSchema(Schema):

    id = fields.Int(dump_only=True)

    name = fields.Str(required=True)

    global_min_stock = fields.Int()

    corporate_email = fields.Email()

class UdateTenantSchema(Schema):

    name = fields.Str(data_key="companyEmail")

    global_min_stock = fields.Int(data_key="minimumStock")

    corporate_email = fields.Email(data_key="companyEmail")

    monthly_goal = fields.Int(data_key="monthlyGoal")