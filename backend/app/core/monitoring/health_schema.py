from marshmallow import Schema, fields


class ServiceStatusSchema(Schema):
    status = fields.String(required=True)

    latency = fields.String(required=True)


class ServicesSchema(Schema):
    postgres = fields.Nested(ServiceStatusSchema, required=True)

    redis = fields.Nested(ServiceStatusSchema, required=True)


class HealthResponseSchema(Schema):
    status = fields.String(required=True)

    environment = fields.String(required=True)

    version = fields.String(required=True)

    timestamp = fields.DateTime(required=True)

    uptimeSeconds = fields.Int(required=True, attribute="uptime_seconds")

    services = fields.Nested(ServicesSchema, required=True)
