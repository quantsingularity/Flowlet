import os
import sys
import tempfile

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
from typing import Any

import pytest

"Test configuration for the enhanced Flowlet backend"


@pytest.fixture
def app() -> Any:
    """Create and configure a new app instance for each test."""
    os.environ.setdefault("SECRET_KEY", "test-secret-key-for-testing-only")
    os.environ.setdefault("JWT_SECRET_KEY", "test-jwt-secret-for-testing-only")

    from app import create_app
    from src.models.database import db

    db_fd, db_path = tempfile.mkstemp(suffix=".db")
    app = create_app("testing")
    app.config.update(
        {
            "TESTING": True,
            "SQLALCHEMY_DATABASE_URI": f"sqlite:///{db_path}",
            "SECRET_KEY": "test-secret-key-for-testing-only",
            "JWT_SECRET_KEY": "test-jwt-secret-for-testing-only",
            "WTF_CSRF_ENABLED": False,
        }
    )
    with app.app_context():
        db.create_all()
        yield app
        db.drop_all()
    os.close(db_fd)
    os.unlink(db_path)


@pytest.fixture
def client(app: Any) -> Any:
    """A test client for the app."""
    return app.test_client()


@pytest.fixture
def runner(app: Any) -> Any:
    """A test runner for the app's Click commands."""
    return app.test_cli_runner()


@pytest.fixture
def auth_headers() -> Any:
    """Sample authentication headers for testing."""
    return {"Authorization": "Bearer test-token", "Content-Type": "application/json"}


@pytest.fixture
def sample_user_data() -> Any:
    """Sample user data for testing."""
    return {
        "email": "test@example.com",
        "username": "testuser",
        "password": "TestPassword123!",
        "first_name": "Test",
        "last_name": "User",
    }


@pytest.fixture
def sample_transaction_data() -> Any:
    """Sample transaction data for testing."""
    return {
        "amount": 100.0,
        "currency": "USD",
        "description": "Test transaction",
        "account_id": "test-account-123",
    }
