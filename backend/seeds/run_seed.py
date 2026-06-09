import logging
import time
from datetime import timedelta

from seeds.mocks.products_mock import (
    product_five,
    product_four,
    product_one,
    product_three,
    product_two,
)
from seeds.mocks.tenants_mock import (
    tenant_five,
    tenant_four,
    tenant_one,
    tenant_three,
    tenant_two,
)
from seeds.products_seed import products_database_seed
from seeds.queries.tenant_queries import TenantQueries
from seeds.sales_seed import sales_database_seed
from seeds.super_admin_seed import super_admin_seed
from seeds.tenant_seed import tenant_database_seed

logger = logging.getLogger(__name__)


def generate_sales(
    tenant_id: int,
    user_id: int,
    start_year: int,
    end_year: int,
    max_month: int = 12,
    force_day: bool = False,
):

    for year in range(start_year, end_year + 1):
        months_limit = max_month if year == end_year else 12
        force_day_flag = force_day

        for month in range(1, months_limit + 1):
            success = sales_database_seed(
                tenant_id=tenant_id,
                user_id=user_id,
                month=month,
                year=year,
                force_day=force_day_flag,
            )
            if not success:
                raise RuntimeError(
                    f"Error generating sales for \
                    the tenant {tenant_id} em {month}/{year}"
                )


def run_seed(app):
    logger.info("Starting database seed...")
    start_time = time.perf_counter()
    with app.app_context():
        try:
            tenants = [
                tenant_one,
                tenant_two,
                tenant_three,
                tenant_four,
                tenant_five,
            ]
            products = [
                product_one,
                product_two,
                product_three,
                product_four,
                product_five,
            ]
            tenants_created = []

            # 1. Create super administrator
            if not super_admin_seed():
                raise RuntimeError("Error creating super administrator.")

            # 2. Create the tenants and products.
            for tenant, product in zip(tenants, products):
                tenant_id = tenant_database_seed(**tenant)
                if not tenant_id:
                    raise RuntimeError(f"Error seeding the tenant: {tenant}")
                tenants_created.append(tenant_id)

                if not products_database_seed(tenant_id, product):
                    raise RuntimeError(
                        f"Error seeding products for the tenant: {tenant}"
                    )

            # 3. Generate sales history (2020 to May 2026)
            for tenant_id in tenants_created:
                # Generation from 2020 to 2025 (full year)
                user_id = TenantQueries.get_users_by_tenant(tenant_id)
                if not user_id:
                    raise RuntimeError(
                        f"Error: User not found in tenant (tenant_id: {tenant_id})"
                    )
                generate_sales(
                    tenant_id=tenant_id,
                    user_id=user_id,
                    start_year=2020,
                    end_year=2025,
                )

                # Generates the year 2026 up to the month of May (5)
                generate_sales(
                    tenant_id=tenant_id,
                    user_id=user_id,
                    start_year=2026,
                    end_year=2026,
                    max_month=6,
                    force_day=True,
                )

            end_time = time.perf_counter()
            total_seconds = end_time - start_time
            duration = timedelta(seconds=int(total_seconds))

            logger.info("Seed completed successfully!")
            logger.info(f"Total execution time: {duration}")

        except Exception as e:
            end_time = time.perf_counter()
            total_seconds = end_time - start_time
            duration = timedelta(seconds=int(total_seconds))

            logger.error(f"An error occurred in the seed after {duration}: {e}")


if __name__ == "__main__":
    from app import create_app

    app = create_app()
    run_seed(app)
