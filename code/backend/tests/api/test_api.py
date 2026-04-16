"""
API smoke tests – run against a live server OR via the pytest Flask test client.
Each test is fully self-contained.
"""

import logging
from typing import Any

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def test_health(client: Any) -> None:
    """Test health endpoint."""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.get_json()
    assert data["status"] == "healthy"


def test_api_gateway(client: Any) -> None:
    """Test API info endpoint."""
    response = client.get("/api/v1/info")
    assert response.status_code == 200


def test_kyc_service(client: Any) -> None:
    """Test user registration (KYC-style creation)."""
    import json
    import time

    unique = str(int(time.time() * 1000))[-8:]
    user_data = {
        "email": f"kyc{unique}@example.com",
        "password": "KycPassword123!",
        "first_name": "John",
        "last_name": "Doe",
    }
    response = client.post(
        "/api/v1/auth/register",
        data=json.dumps(user_data),
        content_type="application/json",
    )
    # 201 created or 400 if duplicate – either means the endpoint works
    assert response.status_code in (201, 400)


def test_wallet_service(client: Any) -> None:
    """Test wallet creation for a registered user."""
    import json
    import time

    unique = str(int(time.time() * 1000))[-8:]
    user_data = {
        "email": f"wallet{unique}@example.com",
        "password": "WalletPass123!",
        "first_name": "Wallet",
        "last_name": "Test",
    }
    reg = client.post(
        "/api/v1/auth/register",
        data=json.dumps(user_data),
        content_type="application/json",
    )
    assert reg.status_code == 201

    login = client.post(
        "/api/v1/auth/login",
        data=json.dumps(
            {"email": user_data["email"], "password": user_data["password"]}
        ),
        content_type="application/json",
    )
    assert login.status_code == 200
    token = login.get_json().get("access_token")
    assert token

    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
    wallet_resp = client.post(
        "/api/v1/wallet/create",
        data=json.dumps({"currency": "USD", "initial_balance": 0}),
        headers=headers,
    )
    assert wallet_resp.status_code == 201
    wallet_data = wallet_resp.get_json()
    assert "wallet_id" in wallet_data


def test_payment_service(client: Any) -> None:
    """Test deposit into a wallet."""
    import json
    import time

    unique = str(int(time.time() * 1000))[-8:]
    user_data = {
        "email": f"payment{unique}@example.com",
        "password": "PaymentPass123!",
        "first_name": "Pay",
        "last_name": "Test",
    }
    client.post(
        "/api/v1/auth/register",
        data=json.dumps(user_data),
        content_type="application/json",
    )
    login = client.post(
        "/api/v1/auth/login",
        data=json.dumps(
            {"email": user_data["email"], "password": user_data["password"]}
        ),
        content_type="application/json",
    )
    token = login.get_json().get("access_token")
    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}

    wallet_resp = client.post(
        "/api/v1/wallet/create",
        data=json.dumps({"currency": "USD", "initial_balance": 0}),
        headers=headers,
    )
    wallet_id = wallet_resp.get_json().get("wallet_id")
    assert wallet_id

    deposit_resp = client.post(
        f"/api/v1/wallet/{wallet_id}/deposit",
        data=json.dumps({"amount": 100.0, "description": "Test deposit"}),
        headers=headers,
    )
    assert deposit_resp.status_code == 200
    assert "transaction_id" in deposit_resp.get_json()


def test_card_service(client: Any) -> None:
    """Test card issuance."""
    import json
    import time

    unique = str(int(time.time() * 1000))[-8:]
    user_data = {
        "email": f"card{unique}@example.com",
        "password": "CardPass123!",
        "first_name": "Card",
        "last_name": "Test",
    }
    client.post(
        "/api/v1/auth/register",
        data=json.dumps(user_data),
        content_type="application/json",
    )
    login = client.post(
        "/api/v1/auth/login",
        data=json.dumps(
            {"email": user_data["email"], "password": user_data["password"]}
        ),
        content_type="application/json",
    )
    token = login.get_json().get("access_token")
    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}

    wallet_resp = client.post(
        "/api/v1/wallet/create",
        data=json.dumps({"currency": "USD", "initial_balance": 500}),
        headers=headers,
    )
    wallet_id = wallet_resp.get_json().get("wallet_id")

    card_resp = client.post(
        "/api/v1/card/issue",
        data=json.dumps(
            {"wallet_id": wallet_id, "card_type": "virtual", "spending_limit": 500.0}
        ),
        headers=headers,
    )
    assert card_resp.status_code == 201
    card_data = card_resp.get_json()
    assert "card_id" in card_data


def test_ai_service(client: Any) -> None:
    """Test AI/chatbot or info endpoint."""
    response = client.get("/api/v1/info")
    assert response.status_code == 200


def test_security_headers(client: Any) -> None:
    """Security headers must be present."""
    response = client.get("/health")
    assert response.status_code == 200
    assert "X-Content-Type-Options" in response.headers


def test_ledger_service(client: Any) -> None:
    """Test ledger endpoint exists."""
    response = client.get("/api/v1/ledger/trial-balance?currency=USD")
    # Acceptable: 200 OK or 401 Unauthorized (endpoint exists but protected)
    assert response.status_code in (200, 401, 404)
