from marshmallow import Schema, fields


class ListRevenueAnalyticsQuerySchema(Schema):

    period = fields.Str(required=True)


class GetRevenueMetricsSchema(Schema):
    
    total_revenue = fields.Decimal(places=2)

    average_ticket = fields.Decimal(places=2)

    total_sales = fields.Int()

    total_products_sold = fields.Int()


class GetPaymantMetricsSchema(Schema):
    
    payment_method = fields.Str()

    quantity = fields.Int()

    revenue = fields.Decimal(places=2)

class GetTopProductSchema(Schema):
    
    product_name = fields.Str()

    total_quantity = fields.Int()

    item_revenue = fields.Decimal(places=2)


class ListRevenueAnalyticsResponseSchema(Schema):

    revenue_metrics = fields.Nested(GetRevenueMetricsSchema) 

    payment_metrics = fields.Nested(GetPaymantMetricsSchema, many=True) 

    top_product = fields.Nested(GetTopProductSchema) 


class ListAccumulatedRevenueDaySchema(Schema):

    day = fields.Int()

    revenue = fields.Decimal(places=2)