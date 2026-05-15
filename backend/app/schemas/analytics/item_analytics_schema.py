from marshmallow import Schema, fields, validate


class ListItemAnalyticsQuerySchema(Schema):

    month = fields.Int(
        required=True,
        validate=validate.Range(
            min=1,
            max=12
        )
    )

    year = fields.Int(
        required=True
    )


class ListItemAnalyticsResponseSchema(Schema):

    id = fields.Int(dump_only=True)

    name = fields.Str()

    quantity = fields.Int()

    sku = fields.Str()

    item_price = fields.Decimal()

