import calendar
import logging
import random
from datetime import UTC, datetime, timedelta

from app.extensions import db
from app.models.product import Product
from app.models.sale import ItemSale, Sale

logger = logging.getLogger(__name__)


def sales_database_seed(
    tenant_id: int, user_id: int, month: int, year: int, force_day: bool
):

    try:
        products = Product.query.filter_by(tenant_id=tenant_id).all()

        payment_method = ["pix", "debit", "money", "credit"]

        _, last_day = calendar.monthrange(year, month)

        current_day = datetime(year, month, 1, tzinfo=UTC)

        if force_day:
            today = datetime.now(UTC).day
            end_date = datetime(year, month, today, tzinfo=UTC)
        else:
            end_date = datetime(year, month, last_day, tzinfo=UTC)

        while current_day <= end_date:
            sales_number = random.randint(5, 50)

            for _ in range(sales_number):
                hour = random.randint(8, 20)
                minute = random.randint(0, 59)

                random_sale_date = current_day.replace(hour=hour, minute=minute)

                list_item_sold = []
                total_price = 0
                max_itens = len(products)
                quantity_items_sold = random.randint(1, max_itens)

                products_chosen = random.sample(products, quantity_items_sold)

                for product_choice in products_chosen:
                    quantity = random.randint(1, 6)
                    total_price += quantity * product_choice.price

                    list_item_sold.append(
                        {
                            "name": product_choice.name,
                            "quantity": quantity,
                            "sku": product_choice.sku,
                            "item_price": product_choice.price,
                            "tenant_id": tenant_id,
                            "user_id": user_id,
                            "product_id": product_choice.id,
                            "channel": "physical",
                        }
                    )

                new_sale = Sale(
                    total_price=total_price,
                    payment_method=payment_method[random.randint(0, 3)],
                    quantity_items=quantity_items_sold,
                    tenant_id=tenant_id,
                    user_id=user_id,
                    created_at=random_sale_date,
                    channel="physical",
                )

                db.session.add(new_sale)
                db.session.flush()

                for item in list_item_sold:
                    new_item = ItemSale(
                        name=item.get("name"),
                        quantity=item.get("quantity"),
                        sku=item.get("sku"),
                        item_price=item.get("item_price"),
                        sale_id=new_sale.id,
                        tenant_id=tenant_id,
                        user_id=user_id,
                        product_id=item.get("id"),
                        channel="physical",
                        created_at=random_sale_date,
                    )
                    db.session.add(new_item)

            logger.info(
                f"Created sales (tenant_id: {tenant_id}) | "
                f"(date: {month}/{current_day.day}/{year})"
            )

            current_day += timedelta(days=1)

        db.session.commit()

        return True

    except Exception as e:
        logger.error(f"Error creating sale: {e}")
        return False
