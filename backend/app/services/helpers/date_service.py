import re
from datetime import UTC, datetime, timedelta

from app.exceptions.helpers.date_exceptions import InvalidPeriod


class DateService:
    @staticmethod
    def get_month_range(month, year):

        start_date = datetime(year, month, 1)

        if month == 12:
            end_date = datetime(year + 1, 1, 1)

        else:
            end_date = datetime(year, month + 1, 1)

        return start_date, end_date

    @staticmethod
    def get_period_range(period, force_year=False):

        if force_year:
            data = re.findall(r"\d+", period)
            year = int(next(n for n in data if len(n) == 4))

            start_date = datetime(year, 1, 1)
            end_date = datetime(year + 1, 1, 1)

            return start_date, end_date

        if "month" and "year" in period:
            data = re.findall(r"\d+", period)

            if len(data) >= 2:
                year = int(next(n for n in data if len(n) == 4))
                month = int(next(n for n in data if len(n) <= 2))

            start_date = datetime(year, month, 1)

            if month == 12:
                end_date = datetime(year + 1, 1, 1)

            else:
                end_date = datetime(year, month + 1, 1)

            return start_date, end_date

        date_now = datetime.now(UTC)

        if period == "today":
            start_date = date_now.replace(hour=0, minute=0, second=0, microsecond=0)

        elif period == "7d":
            start_date = date_now - timedelta(days=7)

        elif period == "30d":
            start_date = date_now - timedelta(days=30)

        elif period == "60d":
            start_date = date_now - timedelta(days=60)

        elif period == "90d":
            start_date = date_now - timedelta(days=90)

        elif period == "month":
            start_date = date_now.replace(
                day=1, hour=0, minute=0, second=0, microsecond=0
            )

        elif period == "year":
            start_date = date_now.replace(
                month=1, day=1, hour=0, minute=0, second=0, microsecond=0
            )

        else:
            raise InvalidPeriod()

        return start_date, date_now
