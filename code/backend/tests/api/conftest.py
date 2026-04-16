"""Conftest for tests/api – provides shared fixtures."""

import os
import sys

os.environ.setdefault("SECRET_KEY", "test-secret-key-for-testing-only")
os.environ.setdefault("JWT_SECRET_KEY", "test-jwt-secret-for-testing-only")
os.environ.setdefault("ENCRYPTION_KEY", "test-encryption-key-32byteslong!!")
os.environ.setdefault("FLASK_CONFIG", "testing")
os.environ.setdefault("STRIPE_SECRET_KEY", "sk_test_mock_key")

# backend/ dir – resolves src.* imports
backend_root = os.path.dirname(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
)
if backend_root not in sys.path:
    sys.path.insert(0, backend_root)

# code/ dir (parent of backend/) – resolves ml_services.* imports
code_root = os.path.dirname(backend_root)
if code_root not in sys.path:
    sys.path.insert(0, code_root)

import pytest


@pytest.fixture(scope="session")
def app():
    from app import create_app
    from src.models.database import db as _db

    application = create_app("testing")
    with application.app_context():
        _db.create_all()
        yield application
        _db.drop_all()


@pytest.fixture(scope="session")
def client(app):
    return app.test_client()


@pytest.fixture
def db(app):
    from src.models.database import db as _db

    with app.app_context():
        yield _db
        _db.session.rollback()


@pytest.fixture
def auth_headers():
    """Dummy auth headers – used by tests that don't need real tokens."""
    return {
        "Authorization": "Bearer test-token",
        "Content-Type": "application/json",
    }


@pytest.fixture
def registered_user(client):
    """Register a user and return (user_data, access_token)."""
    import json
    import time

    unique = str(int(time.time() * 1000))[-6:]
    user_data = {
        "email": f"apitest{unique}@example.com",
        "password": "ApiPassword123!",
        "first_name": "Api",
        "last_name": "Test",
    }
    resp = client.post(
        "/api/v1/auth/register",
        data=json.dumps(user_data),
        content_type="application/json",
    )
    token = None
    if resp.status_code == 201:
        body = resp.get_json()
        token = body.get("access_token") or body.get("token")
        if not token:
            login_resp = client.post(
                "/api/v1/auth/login",
                data=json.dumps(
                    {"email": user_data["email"], "password": user_data["password"]}
                ),
                content_type="application/json",
            )
            if login_resp.status_code == 200:
                token = login_resp.get_json().get("access_token")
    return user_data, token


@pytest.fixture
def auth_token_headers(registered_user):
    """Real auth headers with a valid JWT token."""
    _, token = registered_user
    return {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
    }
