from app.extensions import db

import logging

logger = logging.getLogger(__name__)


class DatabaseSession:

    @staticmethod
    def add(instance):

        db.session.add(instance)

    @staticmethod
    def flush():

        db.session.flush()

    @staticmethod
    def commit():

        try:

            db.session.commit()

        except Exception:

            db.session.rollback()

            logger.exception("Error committing transaction")

            raise

    @staticmethod
    def rollback():

        db.session.rollback()

    @staticmethod
    def refresh(instance):

        db.session.refresh(instance)