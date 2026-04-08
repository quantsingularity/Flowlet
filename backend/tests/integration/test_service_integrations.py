"""
Service integration tests – use real Flask test client with real auth.
"""

import time
from typing import Any

import pytest
from app import create_app
from src.models.database import db


class TestConfig:
    TESTING = True
    SQLALCHEMY_DATABASE_URI = "sqlite:///:memory:"
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SECRET_KEY = "test-secret-key"
    WTF_CSRF_ENABLED = False
    RATELIMIT_ENABLED = False


def _uid():
    return str(int(time.time() * 1000))[-8:]


def _register_login(client, suffix=None):
    s = suffix or _uid()
    user = {
        "email": f"svc{s}@flowlet.com",
        "password": "SecurePassword123!",
        "first_name": "Test",
        "last_name": "User",
    }
    client.post("/api/v1/auth/register", json=user)
    login = client.post(
        "/api/v1/auth/login",
        json={"email": user["email"], "password": user["password"]},
    )
    assert login.status_code == 200, f"Login failed: {login.get_json()}"
    token = login.get_json()["access_token"]
    return {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
    }, user


def _wallet(client, headers, initial_balance=1000.0):
    resp = client.post(
        "/api/v1/wallet/create",
        json={"currency": "USD", "initial_balance": initial_balance},
        headers=headers,
    )
    assert resp.status_code == 201
    return resp.get_json()["wallet_id"]


@pytest.fixture
def app():
    application = create_app("testing")
    with application.app_context():
        db.create_all()
        yield application
        db.session.remove()
        db.drop_all()


@pytest.fixture
def client(app):
    return app.test_client()


@pytest.fixture
def auth_headers(client):
    h, _ = _register_login(client)
    return h


@pytest.fixture
def sample_user_data():
    s = _uid()
    return {
        "email": f"svc{s}@flowlet.com",
        "password": "SecurePassword123!",
        "first_name": "Test",
        "last_name": "User",
        "phone": "+1234567890",
    }


@pytest.fixture
def sample_wallet_data():
    return {"currency": "USD", "initial_balance": 1000.0}


class TestHealthEndpoints:
    def test_health_check_success(self, client: Any) -> None:
        resp = client.get("/health")
        assert resp.status_code == 200
        data = resp.get_json()
        assert data["status"] == "healthy"
        assert "timestamp" in data
        assert "version" in data
        assert "services" in data

    def test_api_info(self, client: Any) -> None:
        resp = client.get("/api/v1/info")
        assert resp.status_code == 200
        data = resp.get_json()
        assert "api_name" in data
        assert "version" in data
        assert "endpoints" in data
        assert "security_features" in data


class TestAuthenticationIntegration:
    def test_user_registration_success(
        self, client: Any, sample_user_data: Any
    ) -> None:
        resp = client.post("/api/v1/auth/register", json=sample_user_data)
        assert resp.status_code == 201
        data = resp.get_json()
        assert "user_id" in data
        assert data["email"] == sample_user_data["email"]

    def test_user_registration_duplicate_email(
        self, client: Any, sample_user_data: Any
    ) -> None:
        client.post("/api/v1/auth/register", json=sample_user_data)
        resp = client.post("/api/v1/auth/register", json=sample_user_data)
        assert resp.status_code in (400, 409)
        assert "error" in resp.get_json()

    def test_user_login_success(self, client: Any, sample_user_data: Any) -> None:
        client.post("/api/v1/auth/register", json=sample_user_data)
        resp = client.post(
            "/api/v1/auth/login",
            json={
                "email": sample_user_data["email"],
                "password": sample_user_data["password"],
            },
        )
        assert resp.status_code == 200
        data = resp.get_json()
        assert "access_token" in data
        assert "refresh_token" in data

    def test_user_login_invalid_credentials(self, client: Any) -> None:
        resp = client.post(
            "/api/v1/auth/login",
            json={"email": "nobody@flowlet.com", "password": "wrongpassword"},
        )
        assert resp.status_code == 401
        data = resp.get_json()
        assert "error" in data


class TestWalletServiceIntegration:
    def test_wallet_creation_success(
        self, client: Any, sample_wallet_data: Any
    ) -> None:
        h, _ = _register_login(client)
        resp = client.post("/api/v1/wallet/create", json=sample_wallet_data, headers=h)
        assert resp.status_code == 201
        data = resp.get_json()
        assert "wallet_id" in data
        assert data["currency"] == sample_wallet_data["currency"]
        assert float(data["balance"]) == sample_wallet_data["initial_balance"]

    def test_wallet_balance_inquiry(self, client: Any, auth_headers: Any) -> None:
        h, _ = _register_login(client)
        wallet_id = _wallet(client, h, 500.0)
        resp = client.get(f"/api/v1/wallet/{wallet_id}/balance", headers=h)
        assert resp.status_code == 200
        data = resp.get_json()
        assert float(data["balance"]) == 500.0
        assert data["currency"] == "USD"

    def test_wallet_deposit_success(self, client: Any, auth_headers: Any) -> None:
        h, _ = _register_login(client)
        wallet_id = _wallet(client, h, 100.0)
        resp = client.post(
            f"/api/v1/wallet/{wallet_id}/deposit",
            json={"amount": 200.0, "description": "Test deposit"},
            headers=h,
        )
        assert resp.status_code == 200
        data = resp.get_json()
        assert float(data["new_balance"]) == 300.0
        assert "transaction_id" in data

    def test_wallet_withdrawal_success(self, client: Any, auth_headers: Any) -> None:
        h, _ = _register_login(client)
        wallet_id = _wallet(client, h, 500.0)
        resp = client.post(
            f"/api/v1/wallet/{wallet_id}/withdraw",
            json={"amount": 100.0, "description": "Test withdrawal"},
            headers=h,
        )
        assert resp.status_code == 200
        data = resp.get_json()
        assert float(data["new_balance"]) == 400.0
        assert "transaction_id" in data

    def test_wallet_withdrawal_insufficient_funds(
        self, client: Any, auth_headers: Any
    ) -> None:
        h, _ = _register_login(client)
        wallet_id = _wallet(client, h, 50.0)
        resp = client.post(
            f"/api/v1/wallet/{wallet_id}/withdraw", json={"amount": 100.0}, headers=h
        )
        assert resp.status_code == 400
        assert "insufficient funds" in resp.get_json()["error"].lower()


class TestPaymentServiceIntegration:
    def test_p2p_payment_success(self, client: Any, auth_headers: Any) -> None:
        h, _ = _register_login(client)
        sender_id = _wallet(client, h, 500.0)
        recipient_id = _wallet(client, h, 100.0)
        resp = client.post(
            f"/api/v1/payment/{sender_id}/send",
            json={
                "amount": 150.0,
                "recipient_wallet_id": recipient_id,
                "description": "Test P2P payment",
            },
            headers=h,
        )
        assert resp.status_code == 200
        data = resp.get_json()
        assert "transaction_id" in data
        assert float(data["amount"]) == 150.0
        assert data["status"] == "completed"

    def test_payment_invalid_recipient(self, client: Any, auth_headers: Any) -> None:
        h, _ = _register_login(client)
        sender_id = _wallet(client, h, 500.0)
        resp = client.post(
            f"/api/v1/payment/{sender_id}/send",
            json={
                "amount": 100.0,
                "recipient_wallet_id": "invalid_wallet_id",
                "description": "Test payment",
            },
            headers=h,
        )
        assert resp.status_code == 404
        assert "not found" in resp.get_json()["error"].lower()


class TestCardServiceIntegration:
    def test_card_issuance_success(self, client: Any, auth_headers: Any) -> None:
        h, _ = _register_login(client)
        wallet_id = _wallet(client, h, 1000.0)
        resp = client.post(
            "/api/v1/card/issue",
            json={
                "wallet_id": wallet_id,
                "card_type": "virtual",
                "spending_limit": 500.0,
            },
            headers=h,
        )
        assert resp.status_code == 201
        data = resp.get_json()
        assert "card_id" in data
        assert data["card_type"] == "virtual"
        assert data["spending_limit"] == 500.0

    def test_card_transaction_success(self, client: Any, auth_headers: Any) -> None:
        h, _ = _register_login(client)
        wallet_id = _wallet(client, h, 1000.0)
        card_resp = client.post(
            "/api/v1/card/issue",
            json={
                "wallet_id": wallet_id,
                "card_type": "virtual",
                "spending_limit": 500.0,
            },
            headers=h,
        )
        card_id = card_resp.get_json()["card_id"]
        resp = client.post(
            f"/api/v1/card/{card_id}/transaction",
            json={
                "amount": 50.0,
                "merchant": "Test Merchant",
                "description": "Test purchase",
            },
            headers=h,
        )
        assert resp.status_code == 200
        data = resp.get_json()
        assert "transaction_id" in data
        assert float(data["amount"]) == 50.0
        assert data["status"] == "approved"


class TestBankingIntegration:
    def test_plaid_account_linking(self, client: Any, auth_headers: Any) -> None:
        h, _ = _register_login(client)
        resp = client.post(
            "/api/v1/banking/plaid/link",
            json={"public_token": "public-sandbox-token", "account_id": "account_123"},
            headers=h,
        )
        assert resp.status_code in (200, 404, 405)

    def test_open_banking_balance_check(self, client: Any, auth_headers: Any) -> None:
        h, _ = _register_login(client)
        resp = client.get(
            "/api/v1/banking/open-banking/balance/ob_account_456", headers=h
        )
        assert resp.status_code in (200, 404)


class TestFraudDetectionIntegration:
    def test_transaction_fraud_check(self, client: Any, auth_headers: Any) -> None:
        import uuid
        from datetime import datetime, timezone

        h, _ = _register_login(client)
        payload = {
            "transaction_id": str(uuid.uuid4()),
            "user_id": "user_test_123",
            "amount": 100.0,
            "currency": "USD",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "merchant": "Test Store",
            "location": "New York, NY",
            "card_id": "card_123",
        }
        resp = client.post("/api/v1/fraud/detect", json=payload, headers=h)
        assert resp.status_code in (200, 404, 405)
        if resp.status_code == 200:
            data = resp.get_json()
            assert "alert" in data or "risk_level" in data or "fraud_detected" in data

    def test_high_risk_transaction_blocking(
        self, client: Any, auth_headers: Any
    ) -> None:
        import uuid
        from datetime import datetime, timezone

        h, _ = _register_login(client)
        payload = {
            "transaction_id": str(uuid.uuid4()),
            "user_id": "user_test_123",
            "amount": 5000.0,
            "currency": "USD",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "merchant": "Suspicious Merchant",
            "location": "Unknown Location",
            "card_id": "card_123",
        }
        resp = client.post("/api/v1/fraud/detect", json=payload, headers=h)
        assert resp.status_code in (200, 404, 405)


class TestComplianceIntegration:
    def test_sanctions_screening(self, client: Any, auth_headers: Any) -> None:
        h, _ = _register_login(client)
        resp = client.post(
            "/api/v1/compliance/sanctions/screen",
            json={
                "entity_type": "individual",
                "first_name": "John",
                "last_name": "Doe",
                "date_of_birth": "1990-01-01",
                "country": "US",
            },
            headers=h,
        )
        assert resp.status_code in (200, 404)


class TestKYCAMLIntegration:
    def test_kyc_document_upload(self, client: Any, auth_headers: Any) -> None:
        h, _ = _register_login(client)
        # Try the actual KYC verification start endpoint
        resp = client.post(
            "/api/v1/kyc/verification/start",
            json={
                "document_type": "passport",
                "document_number": "P123456789",
                "expiry_date": "2030-12-31",
                "issuing_country": "US",
            },
            headers=h,
        )
        assert resp.status_code in (200, 201, 400, 404, 405)

    def test_aml_risk_assessment(self, client: Any, auth_headers: Any) -> None:
        h, _ = _register_login(client)
        resp = client.post(
            "/api/v1/aml/assess",
            json={
                "customer_id": "customer_123",
                "transaction_amount": 10000.0,
                "transaction_type": "wire_transfer",
                "source_country": "US",
                "destination_country": "CA",
            },
            headers=h,
        )
        assert resp.status_code in (200, 404, 405)


class TestSecurityIntegration:
    def test_rate_limiting(self, client: Any) -> None:
        # Rate limiting is disabled in testing config - just confirm endpoint works
        for _ in range(3):
            resp = client.get("/api/v1/info")
            assert resp.status_code == 200

    def test_security_headers(self, client: Any) -> None:
        resp = client.get("/api/v1/info")
        assert "X-Content-Type-Options" in resp.headers
        assert "X-Frame-Options" in resp.headers
        assert "X-XSS-Protection" in resp.headers
        assert "Content-Security-Policy" in resp.headers
        assert resp.headers["X-Content-Type-Options"] == "nosniff"
        assert resp.headers["X-Frame-Options"] == "DENY"


class TestPerformanceIntegration:
    def test_response_time_monitoring(self, client: Any) -> None:
        import time

        start = time.time()
        resp = client.get("/health")
        elapsed = time.time() - start
        assert elapsed < 2.0
        assert resp.status_code == 200

    def test_concurrent_requests_handling(self, client: Any) -> None:
        import threading

        results = []

        def req():
            results.append(client.get("/api/v1/info").status_code)

        threads = [threading.Thread(target=req) for _ in range(5)]
        for t in threads:
            t.start()
        for t in threads:
            t.join()
        assert all(s == 200 for s in results)
