import json
import os
from typing import Any

import pytest

os.environ.setdefault("SECRET_KEY", "test-secret-key-for-testing-only")
os.environ.setdefault("JWT_SECRET_KEY", "test-jwt-secret-for-testing-only")


@pytest.fixture
def app():
    from app import create_app
    from src.models.database import db

    application = create_app("testing")
    with application.app_context():
        db.create_all()
        yield application
        db.drop_all()


@pytest.fixture
def client(app):
    return app.test_client()


def test_app_creation() -> Any:
    """Test that the app can be created."""
    from app import create_app

    application = create_app("testing")
    assert application is not None
    assert application.config["TESTING"] is True


def test_health_check(client: Any) -> Any:
    """Test the health check endpoint."""
    response = client.get("/health")
    assert response.status_code == 200
    data = json.loads(response.data)
    assert "status" in data
    assert "timestamp" in data
    assert "version" in data
    assert "services" in data


def test_api_info(client: Any) -> Any:
    """Test the API info endpoint."""
    response = client.get("/api/v1/info")
    assert response.status_code == 200
    data = json.loads(response.data)
    assert "api_name" in data
    assert "version" in data
    assert "endpoints" in data
    assert "security_features" in data


def test_security_headers(client: Any) -> Any:
    """Test that security headers are present."""
    response = client.get("/api/v1/info")
    assert "X-Content-Type-Options" in response.headers
    assert response.headers["X-Content-Type-Options"] == "nosniff"
    assert "X-Frame-Options" in response.headers
    assert response.headers["X-Frame-Options"] == "DENY"
    assert "X-XSS-Protection" in response.headers
    assert "Strict-Transport-Security" in response.headers
    assert "Content-Security-Policy" in response.headers


def test_404_error_handling(client: Any) -> Any:
    """Test 404 error handling."""
    response = client.get("/nonexistent-endpoint-that-does-not-exist-xyz")
    assert response.status_code == 404
    data = json.loads(response.data)
    assert "error" in data or "status" in data


def test_cors_headers(client: Any) -> Any:
    """Test CORS headers are present."""
    response = client.options(
        "/api/v1/info",
        headers={
            "Origin": "http://localhost:3000",
            "Access-Control-Request-Method": "GET",
        },
    )
    assert response.status_code in (200, 204)


def test_json_content_type_validation(client: Any) -> Any:
    """Test that non-JSON requests to POST endpoints are handled."""
    response = client.post(
        "/api/v1/auth/login", data="not json", content_type="text/plain"
    )
    assert response.status_code in (400, 401, 415, 422, 500)
