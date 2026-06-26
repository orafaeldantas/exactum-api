from marshmallow import Schema, fields


class ResponseRBACSchema(Schema):
    uuid = fields.UUID()

    name = fields.Str()
