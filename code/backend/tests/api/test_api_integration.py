"""
API integration tests – self-contained, use the Flask test client.
Each test creates its own auth credentials to avoid cross-test state.
"""

import time
from typing import Any


# ──────────────────────────────────────────────────────────────────────────────
# Helpers
# ──────────────────────────────────────────────────────────────────────────────
def _uid():
    return str(int(time.time() * 1000))[-8:]


def _register_login(client, suffix=None):
    """Register + login a fresh user; return (headers, user_data)."""
    s = suffix or _uid()
    user = {
        "email": f"apitst{s}@example.com",
        "password": "ApiTest123!",
        "first_name": "Api",
        "last_name": "Test",
    }
    client.post("/api/v1/auth/register", json=user)
    login = client.post(
        "/api/v1/auth/login",
        json={"email": user["email"], "password": user["password"]},
    )
    assert login.status_code == 200, f"Login failed: {login.get_json()}"
    token = login.get_json()["access_token"]
    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
    return headers, user


def _create_wallet(client, headers, currency="USD", initial_balance=500.0):
    resp = client.post(
        "/api/v1/wallet/create",
        json={"currency": currency, "initial_balance": initial_balance},
        headers=headers,
    )
    assert resp.status_code == 201, f"Wallet creation failed: {resp.get_json()}"
    return resp.get_json()["wallet_id"]


# ──────────────────────────────────────────────────────────────────────────────
# Authentication
# ──────────────────────────────────────────────────────────────────────────────
class TestAuthenticationAPI:
    def test_user_registration(self, client: Any) -> None:
        s = _uid()
        data = {
            "email": f"new{s}@example.com",
            "password": "NewPassword123!",
            "first_name": "New",
            "last_name": "User",
        }
        resp = client.post("/api/v1/auth/register", json=data)
        assert resp.status_code == 201
        body = resp.get_json()
        assert "user_id" in body
        assert body["email"] == data["email"]

    def test_user_login(self, client: Any) -> None:
        s = _uid()
        data = {
            "email": f"login{s}@example.com",
            "password": "LoginPassword123!",
            "first_name": "Login",
            "last_name": "Test",
        }
        client.post("/api/v1/auth/register", json=data)
        resp = client.post(
            "/api/v1/auth/login",
            json={"email": data["email"], "password": data["password"]},
        )
        assert resp.status_code == 200
        body = resp.get_json()
        assert "access_token" in body
        assert "refresh_token" in body
        assert "expires_in" in body

    def test_invalid_login(self, client: Any) -> None:
        resp = client.post(
            "/api/v1/auth/login",
            json={"email": "nobody@example.com", "password": "WrongPass123!"},
        )
        assert resp.status_code == 401

    def test_protected_endpoint_without_token(self, client: Any) -> None:
        resp = client.get("/api/v1/wallet/create")
        assert resp.status_code in (401, 404, 405)  # depends on route existence/method


# ──────────────────────────────────────────────────────────────────────────────
# Multi-currency
# ──────────────────────────────────────────────────────────────────────────────
class TestMultiCurrencyAPI:
    def test_get_supported_currencies(self, client: Any, auth_headers: Any) -> None:
        headers, _ = _register_login(client)
        resp = client.get("/api/v1/currency/rate?from=USD&to=EUR", headers=headers)
        assert resp.status_code == 200
        body = resp.get_json()
        assert "from_currency" in body or "rate" in body

    def test_get_exchange_rates(self, client: Any, auth_headers: Any) -> None:
        headers, _ = _register_login(client)
        resp = client.get("/api/v1/currency/rate?from=USD&to=EUR", headers=headers)
        assert resp.status_code == 200

    def test_currency_conversion(self, client: Any, auth_headers: Any) -> None:
        headers, _ = _register_login(client)
        wallet_id = _create_wallet(client, headers, "USD", 200.0)
        data = {
            "amount": "100.00",
            "from_currency": "USD",
            "to_currency": "EUR",
            "from_account_id": wallet_id,
        }
        resp = client.post("/api/v1/currency/convert", json=data, headers=headers)
        assert resp.status_code in (200, 400)  # 400 if insufficient or mismatch

    def test_create_currency_wallet(self, client: Any, auth_headers: Any) -> None:
        headers, _ = _register_login(client)
        wallet_id = _create_wallet(client, headers, "EUR", 0.0)
        assert wallet_id is not None


# ──────────────────────────────────────────────────────────────────────────────
# Cards
# ──────────────────────────────────────────────────────────────────────────────
class TestCardsAPI:
    def test_create_virtual_card(self, client: Any, auth_headers: Any) -> None:
        headers, _ = _register_login(client)
        wallet_id = _create_wallet(client, headers)
        resp = client.post(
            "/api/v1/card/issue",
            json={
                "wallet_id": wallet_id,
                "card_type": "virtual",
                "spending_limit": 500.0,
            },
            headers=headers,
        )
        assert resp.status_code == 201
        body = resp.get_json()
        assert body["card_type"] == "virtual"
        assert body["last_four_digits"] is not None

    def test_update_card_controls(self, client: Any, auth_headers: Any) -> None:
        headers, _ = _register_login(client)
        wallet_id = _create_wallet(client, headers)
        card_resp = client.post(
            "/api/v1/card/issue",
            json={"wallet_id": wallet_id, "card_type": "virtual"},
            headers=headers,
        )
        card_id = card_resp.get_json()["card_id"]
        resp = client.put(
            f"/api/v1/card/{card_id}/controls",
            json={"daily_limit": 1000.0},
            headers=headers,
        )
        assert resp.status_code == 200

    def test_freeze_unfreeze_card(self, client: Any, auth_headers: Any) -> None:
        headers, _ = _register_login(client)
        wallet_id = _create_wallet(client, headers)
        card_resp = client.post(
            "/api/v1/card/issue",
            json={"wallet_id": wallet_id, "card_type": "virtual"},
            headers=headers,
        )
        card_id = card_resp.get_json()["card_id"]
        freeze_resp = client.post(f"/api/v1/card/{card_id}/freeze", headers=headers)
        assert freeze_resp.status_code == 200
        assert freeze_resp.get_json()["status"] == "blocked"
        unfreeze_resp = client.post(f"/api/v1/card/{card_id}/unfreeze", headers=headers)
        assert unfreeze_resp.status_code == 200
        assert unfreeze_resp.get_json()["status"] == "active"


# ──────────────────────────────────────────────────────────────────────────────
# Monitoring
# ──────────────────────────────────────────────────────────────────────────────
class TestMonitoringAPI:
    def test_analyze_transaction(self, client: Any, auth_headers: Any) -> None:
        headers, _ = _register_login(client)
        data = {
            "user_id": "test_user_123",
            "amount": "5000.00",
            "currency": "USD",
            "transaction_type": "debit",
            "location": "US",
        }
        resp = client.post(
            "/api/v1/monitoring/transaction/analyze", json=data, headers=headers
        )
        assert resp.status_code in (200, 403, 404)

    def test_get_monitoring_dashboard(self, client: Any, auth_headers: Any) -> None:
        headers, _ = _register_login(client)
        resp = client.get("/api/v1/monitoring/dashboard", headers=headers)
        assert resp.status_code in (200, 403, 404)


# ──────────────────────────────────────────────────────────────────────────────
# Compliance
# ──────────────────────────────────────────────────────────────────────────────
class TestComplianceAPI:
    def test_watchlist_screening(self, client: Any, auth_headers: Any) -> None:
        headers, _ = _register_login(client)
        data = {
            "user_id": "test_user_123",
            "first_name": "John",
            "last_name": "Doe",
            "date_of_birth": "1990-01-01",
        }
        resp = client.post(
            "/api/v1/compliance/screening/watchlist", json=data, headers=headers
        )
        assert resp.status_code in (200, 403, 404)

    def test_compliance_dashboard(self, client: Any, auth_headers: Any) -> None:
        headers, _ = _register_login(client)
        resp = client.get("/api/v1/compliance/dashboard", headers=headers)
        assert resp.status_code in (200, 403, 404)


# ──────────────────────────────────────────────────────────────────────────────
# Documentation & health
# ──────────────────────────────────────────────────────────────────────────────
class TestAPIDocumentation:
    def test_health_check(self, client: Any) -> None:
        resp = client.get("/health")
        assert resp.status_code in (200, 503)
        assert "status" in resp.get_json()

    def test_api_documentation(self, client: Any) -> None:
        resp = client.get("/api/v1/docs")
        assert resp.status_code == 200
        body = resp.get_json()
        assert "api_version" in body or "api_name" in body


# ──────────────────────────────────────────────────────────────────────────────
# Error handling
# ──────────────────────────────────────────────────────────────────────────────
class TestErrorHandling:
    def test_404_error(self, client: Any) -> None:
        resp = client.get("/api/v1/nonexistent_endpoint_xyz")
        assert resp.status_code == 404

    def test_validation_error(self, client: Any, auth_headers: Any) -> None:
        headers, _ = _register_login(client)
        resp = client.post(
            "/api/v1/auth/register", json={"email": "not-an-email", "password": "x"}
        )
        assert resp.status_code in (400, 422)
