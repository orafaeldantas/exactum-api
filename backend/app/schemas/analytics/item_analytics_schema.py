from marshmallow import Schema, fields, validate


class ListItemAnalyticsQuerySchema(Schema):

    period = fields.Str() 


class ListItemAnalyticsResponseSchema(Schema):

    id = fields.Int(dump_only=True)

    product_name = fields.Str()

    total_quantity = fields.Int()

    item_revenue = fields.Decimal()