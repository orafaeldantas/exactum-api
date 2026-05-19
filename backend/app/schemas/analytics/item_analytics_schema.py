from marshmallow import Schema, fields, validate


class ListItemsAnalyticsQuerySchema(Schema):

    period = fields.Str() 


class ListItemsAnalyticsResponseSchema(Schema):

    name = fields.Str()

    total_quantity = fields.Int()

    sku = fields.Str()
