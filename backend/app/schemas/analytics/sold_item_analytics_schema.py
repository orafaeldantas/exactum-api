from marshmallow import Schema, fields, validate


class SoldItemQuerySchema(Schema):

    period = fields.Str() 


class SoldItemBaseSchema(Schema):

    name = fields.Str()

    total_quantity = fields.Int()

    sku = fields.Str()

class BestSellersSchema(SoldItemBaseSchema):

    pass

class SoldItemSchema(SoldItemBaseSchema):

    revenue = fields.Decimal(places=2)

    product_id = fields.Int()
