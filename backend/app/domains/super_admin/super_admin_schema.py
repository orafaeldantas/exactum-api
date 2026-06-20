from marshmallow import Schema, fields


class SuperAdminListTenantsResponseSchema(Schema):
    uuid = fields.UUID(dumps_only=True)

    name = fields.Str(required=True)

    fantasyName = fields.Str(required=True)

    cnpj = fields.Str(required=True)

    slug = fields.Str(required=True)

    plan = fields.Str(required=True)
