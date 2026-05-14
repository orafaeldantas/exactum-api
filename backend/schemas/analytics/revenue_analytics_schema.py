from marshmallow import Schema, fields


class ListRevenueAnalyticsQuerySchema(Schema):

    month = fields.Str(required=True)


class GetRevenueMetricsSchema(Schema):
    
    total_revenue = fields.Decimal()

    average_ticket = fields.Decimal()

    total_sales = fields.Int()

    total_products_sold = fields.Int()


class GetPaymantMetricsSchema(Schema):
    
    payment_method = fields.Str()

    quantity = fields.Int()

    revenue = fields.Decimal()

class GetTopProductSchema(Schema):
    
    product_name = fields.Str()

    total_quantity = fields.Int()

    item_revenue = fields.Decimal()


class ListRevenueAnalyticsResponseSchema(Schema):

    revenue_metrics = fields.Nested(GetRevenueMetricsSchema) 

    payment_metrics = fields.Nested(GetPaymantMetricsSchema, many=True) 

    top_product = fields.Nested(GetTopProductSchema) 




