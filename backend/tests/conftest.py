import os

import pytest
from sqlalchemy import text

from app import create_app
from app.extensions import db

pytest_plugins = ["tests.fixtures.seed_fixtures", "tests.fixtures.auth_header_fixtures"]


@pytest.fixture(scope="session")
def app():
    """Configure the Flask app for the test environment."""

    database_uri = os.getenv("DATABASE_TESTS_URL")

    app = create_app(
        {
            "TESTING": True,
            "PROPAGATE_EXCEPTIONS": True,
            "SQLALCHEMY_DATABASE_URI": database_uri,
            "JWT_SECRET_KEY": os.getenv("JWT_SECRET_KEY"),
        }
    )

    with app.app_context():
        db.engine.dispose()
        db.create_all()
        yield app

        db.session.remove()
        db.drop_all()


@pytest.fixture(scope="function")
def client(app):
    """Returns the Flask test client for making HTTP requests."""
    return app.test_client()


@pytest.fixture(scope="function", autouse=True)
def db_session(app):

    yield db.session

    db.session.rollback()

    for table in reversed(db.metadata.sorted_tables):
        try:
            db.session.execute(
                text(f'TRUNCATE TABLE "{table.name}" RESTART IDENTITY CASCADE;')
            )
            db.session.commit()
        except Exception:
            db.session.rollback()

    db.session.remove()
