"""
MVP functionality tests - self-contained pytest tests using the Flask test client.
"""

import json
import time
from typing import Any


def _unique():
    return str(int(time.time() * 1000))[-8:]


def _register_and_login(client):
    uid = _unique()
    user_data = {
        "email": f"mvp{uid}@example.com",
        "password": "MvpPassword123!",
        "first_name": "MVP",
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
    assert login.status_code == 200
    token = login.get_json().get("access_token")
    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
    return headers


def _create_wallet(client, headers, initial_balance=500.0):
    resp = client.post(
        "/api/v1/wallet/create",
        data=json.dumps({"currency": "USD", "initial_balance": initial_balance}),
        headers=headers,
    )
    assert resp.status_code == 201
    return resp.get_json()["wallet_id"]


def test_health_check(client: Any) -> None:
    response = client.get("/health")
    assert response.status_code == 200
    data = response.get_json()
    assert data["status"] == "healthy"


def test_api_info(client: Any) -> None:
    response = client.get("/api/v1/info")
    assert response.status_code == 200
    data = response.get_json()
    assert "api_name" in data
    assert "version" in data


def test_wallet_creation(client: Any) -> None:
    headers = _register_and_login(client)
    wallet_id = _create_wallet(client, headers, initial_balance=0)
    assert wallet_id


def test_wallet_balance(client: Any) -> None:
    headers = _register_and_login(client)
    wallet_id = _create_wallet(client, headers, initial_balance=250.0)
    resp = client.get(f"/api/v1/wallet/{wallet_id}/balance", headers=headers)
    assert resp.status_code == 200
    data = resp.get_json()
    assert "balance" in data
    assert float(data["balance"]) == 250.0


def test_deposit(client: Any) -> None:
    headers = _register_and_login(client)
    wallet_id = _create_wallet(client, headers, initial_balance=100.0)
    resp = client.post(
        f"/api/v1/wallet/{wallet_id}/deposit",
        data=json.dumps({"amount": 50.0, "description": "Test deposit"}),
        headers=headers,
    )
    assert resp.status_code == 200
    data = resp.get_json()
    assert "transaction_id" in data
    assert float(data["new_balance"]) == 150.0


def test_withdrawal(client: Any) -> None:
    headers = _register_and_login(client)
    wallet_id = _create_wallet(client, headers, initial_balance=200.0)
    resp = client.post(
        f"/api/v1/wallet/{wallet_id}/withdraw",
        data=json.dumps({"amount": 75.0, "description": "Test withdrawal"}),
        headers=headers,
    )
    assert resp.status_code == 200
    data = resp.get_json()
    assert "transaction_id" in data
    assert float(data["new_balance"]) == 125.0


def test_transaction_history(client: Any) -> None:
    headers = _register_and_login(client)
    wallet_id = _create_wallet(client, headers, initial_balance=100.0)
    # Make a deposit so there's at least one transaction
    client.post(
        f"/api/v1/wallet/{wallet_id}/deposit",
        data=json.dumps({"amount": 25.0}),
        headers=headers,
    )
    resp = client.get(f"/api/v1/wallet/{wallet_id}/transactions", headers=headers)
    assert resp.status_code == 200
    data = resp.get_json()
    assert "transactions" in data


def test_transfer(client: Any) -> None:
    headers = _register_and_login(client)
    sender_id = _create_wallet(client, headers, initial_balance=300.0)
    receiver_id = _create_wallet(client, headers, initial_balance=100.0)
    resp = client.post(
        f"/api/v1/payment/{sender_id}/send",
        data=json.dumps(
            {
                "amount": 50.0,
                "recipient_wallet_id": receiver_id,
                "description": "Test transfer",
            }
        ),
        headers=headers,
    )
    assert resp.status_code == 200
    data = resp.get_json()
    assert "transaction_id" in data
    assert float(data["amount"]) == 50.0
