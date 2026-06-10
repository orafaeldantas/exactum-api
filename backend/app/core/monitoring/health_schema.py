from marshmallow import Schema, fields


class ServicesSchema(Schema):
    postgres = fields.String(required=True)
    redis = fields.String(required=True)


class HealthResponseSchema(Schema):
    status = fields.String(required=True)
    services = fields.Nested(ServicesSchema, required=True)
