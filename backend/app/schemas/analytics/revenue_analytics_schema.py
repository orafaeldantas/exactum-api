from marshmallow import Schema, fields


class RevenueAnalyticsQuerySchema(Schema):
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


class TicketAverageMonthlySchema(Schema):
    labels = fields.List(fields.Str())

    values = fields.List(fields.Decimal(places=2))


class TicketAverageSchema(Schema):
    avg_monthly = fields.Nested(TicketAverageMonthlySchema, data_key="avgMonthly")

    avg_weekday = fields.Nested(TicketAverageMonthlySchema, data_key="avgWeekday")

    average_ticket = fields.Decimal(places=2, data_key="averageTicket")

    quantity_order = fields.Int(data_key="quantityOrder")

    biggest_sale = fields.Decimal(places=2, data_key="biggestSale")

    lowest_sale = fields.Decimal(places=2, data_key="lowestSale")
