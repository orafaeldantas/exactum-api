from marshmallow import Schema, fields


class CreateProductSchema(Schema):
    name = fields.Str(required=True)

    description = fields.Str()

    price = fields.Decimal(required=True, places=2, as_string=True)

    sku = fields.Str(required=True)

    category = fields.Str()

    is_active = fields.Bool(required=True)

    stock_quantity = fields.Int(required=True)


class CreateProductResponseSchema(Schema):
    uuid = fields.UUID(dump_only=True)


class UpdateProductSchema(Schema):
    name = fields.Str()

    description = fields.Str()

    price = fields.Decimal(places=2, as_string=True)

    sku = fields.Str()

    category = fields.Str()

    is_active = fields.Bool()

    stock_quantity = fields.Int()


class ListProductResponseSchema(UpdateProductSchema):
    uuid = fields.UUID(dump_only=True)

    stock_quantity = fields.Int()


class UpdateProductResponseSchema(CreateProductResponseSchema):
    pass


class GetProductResponseSchema(ListProductResponseSchema):
    pass


class DeleteProductResponseSchema(CreateProductResponseSchema):
    pass
