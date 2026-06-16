from marshmallow import Schema, fields


class SuperAdminListTenantsResponseSchema(Schema):
    id = fields.Int()

    name = fields.Str(required=True)

    fantasyName = fields.Str(required=True)

    cnpj = fields.Str(required=True)

    slug = fields.Str(required=True)

    plan = fields.Str(required=True)
