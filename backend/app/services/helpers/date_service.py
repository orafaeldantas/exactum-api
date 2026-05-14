from datetime import datetime


class DateService:

    @staticmethod
    def get_month_range(month, year):

        start_date = datetime(year, month, 1)

        if month == 12:

            end_date = datetime(year + 1, 1, 1)

        else:

            end_date = datetime(year, month + 1, 1)

        return start_date, end_date