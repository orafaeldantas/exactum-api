import logging

from sqlalchemy.orm import Session

from app.extensions import db

logger = logging.getLogger(__name__)


class DatabaseSession:
    @staticmethod
    def get_session() -> Session:

        return db.session()

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

    @staticmethod
    def delete(instance):

        db.session.delete(instance)
