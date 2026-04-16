"""Root conftest.py – shared fixtures for all test suites."""

import os
import sys

os.environ.setdefault("SECRET_KEY", "test-secret-key-for-testing-only")
os.environ.setdefault("JWT_SECRET_KEY", "test-jwt-secret-for-testing-only")
os.environ.setdefault("ENCRYPTION_KEY", "test-encryption-key-32byteslong!!")
os.environ.setdefault("FLASK_CONFIG", "testing")
os.environ.setdefault("STRIPE_SECRET_KEY", "sk_test_mock_key")

# backend/ dir – resolves src.* imports
backend_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if backend_root not in sys.path:
    sys.path.insert(0, backend_root)

# code/ dir (parent of backend/) – resolves ml_services.* imports
code_root = os.path.dirname(backend_root)
if code_root not in sys.path:
    sys.path.insert(0, code_root)

import pytest


@pytest.fixture(scope="function")
def app():
    """Function-scoped Flask app – fresh DB per test to avoid state bleed."""
    from app import create_app
    from src.models.database import db as _db

    application = create_app("testing")
    with application.app_context():
        _db.create_all()
        yield application
        _db.session.remove()
        _db.drop_all()


@pytest.fixture(scope="function")
def client(app):
    """Function-scoped test client."""
    return app.test_client()


@pytest.fixture(scope="function")
def db(app):
    """Function-scoped database access."""
    from src.models.database import db as _db

    with app.app_context():
        yield _db
        _db.session.rollback()


@pytest.fixture
def auth_headers():
    """Dummy auth headers for tests that just need the fixture to exist."""
    return {
        "Authorization": "Bearer test-token",
        "Content-Type": "application/json",
    }
