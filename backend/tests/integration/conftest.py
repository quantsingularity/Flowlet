"""Integration test conftest."""

import os
import sys
import time

os.environ.setdefault("SECRET_KEY", "test-secret-key-for-testing-only")
os.environ.setdefault("JWT_SECRET_KEY", "test-jwt-secret-for-testing-only")
os.environ.setdefault("ENCRYPTION_KEY", "test-encryption-key-32byteslong!!")
os.environ.setdefault("FLASK_CONFIG", "testing")
os.environ.setdefault("STRIPE_SECRET_KEY", "sk_test_mock_key")

backend_root = os.path.dirname(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
)
if backend_root not in sys.path:
    sys.path.insert(0, backend_root)

import pytest


@pytest.fixture
def app():
    from app import create_app
    from src.models.database import db as _db

    application = create_app("testing")
    with application.app_context():
        _db.create_all()
        yield application
        _db.session.remove()
        _db.drop_all()


@pytest.fixture
def client(app):
    return app.test_client()


def _uid():
    return str(int(time.time() * 1000))[-8:]


def _register_login(client, suffix=None):
    s = suffix or _uid()
    user = {
        "email": f"int{s}@test.com",
        "password": "IntTest123!",
        "first_name": "Int",
        "last_name": "Test",
    }
    client.post("/api/v1/auth/register", json=user)
    login = client.post(
        "/api/v1/auth/login",
        json={"email": user["email"], "password": user["password"]},
    )
    assert login.status_code == 200
    token = login.get_json()["access_token"]
    return {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
    }, user


@pytest.fixture
def auth_headers(client):
    headers, _ = _register_login(client)
    return headers


@pytest.fixture
def sample_user_data():
    s = _uid()
    return {
        "email": f"int{s}@flowlet.com",
        "password": "SecurePassword123!",
        "first_name": "Test",
        "last_name": "User",
        "phone": "+1234567890",
    }


@pytest.fixture
def sample_wallet_data():
    return {"currency": "USD", "initial_balance": 1000.0}


@pytest.fixture
def sample_transaction_data():
    return {
        "amount": 100.0,
        "currency": "USD",
        "recipient_wallet_id": "wallet_123",
        "description": "Test payment",
    }
