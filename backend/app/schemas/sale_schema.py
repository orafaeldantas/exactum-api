from marshmallow import Schema, fields, validate


class ListSaleQuerySchema(Schema):

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


class ItemSchema(Schema):

    id = fields.Int(required=True)

    name = fields.Str(required=True)

    quantity = fields.Int(required=True)

    sku = fields.Str(required=True)

    item_price = fields.Decimal(required=True)


class SaleSchema(Schema):

    total_price = fields.Decimal(required=True)

    payment_method = fields.Str(required=True)

    quantity_items =  fields.Int(required=True)



class CreateSaleSchema(Schema):

    sale = fields.Nested(
        SaleSchema,
        required=True
    )

    items = fields.Nested(
        ItemSchema,
        required=True,
        many=True
    )

class CreateSaleResponseSchema(Schema):

    id =  fields.Int(dump_only=True)


class ListSaleResponseSchema(Schema):

    id = fields.Int(dump_only=True)

    total_price = fields.Decimal()

    payment_method = fields.Str()

    created_at = fields.DateTime()

    quantity_items = fields.Int()


class ListSaleItemsResponseSchema(Schema):

    id = fields.Int(dump_only=True)

    name = fields.Str()

    quantity = fields.Int()

    sku = fields.Str()

    item_price = fields.Decimal()

class ListSaleWithItemsResponseSchema(Schema):

    sale = fields.Nested(ListSaleResponseSchema)

    items = fields.Nested(ListSaleItemsResponseSchema, many=True)

