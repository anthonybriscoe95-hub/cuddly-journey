import pytest

from window_agent.app import create_app
from window_agent.config import Config
from window_agent.models import db


class TestConfig(Config):
    TESTING = True
    SQLALCHEMY_DATABASE_URI = "sqlite:///:memory:"
    ADMIN_PASSWORD = "testpass"
    BUSINESS_NAME = "Test Window Cleaning"


@pytest.fixture
def app():
    app = create_app(TestConfig)
    yield app
    with app.app_context():
        db.session.remove()
        db.drop_all()


@pytest.fixture
def client(app):
    return app.test_client()


@pytest.fixture
def admin_client(client):
    client.post("/admin/login", data={"password": "testpass"})
    return client
