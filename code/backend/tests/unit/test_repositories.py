"""
Unit tests for the database repository layer.

Uses an in-memory SQLite database so no external services are required.
"""

from __future__ import annotations

import os
import uuid
from datetime import datetime, timezone
from decimal import Decimal

import pytest

os.environ.setdefault("FLASK_CONFIG", "testing")
os.environ.setdefault("STRIPE_SECRET_KEY", "sk_test_mock")

from app import create_app
from src.database import AccountRepository, TransactionRepository, UserRepository
from src.models import db as _db
from src.models.account import Account, AccountStatus, AccountType
from src.models.transaction import (
    Transaction,
    TransactionCategory,
    TransactionStatus,
    TransactionType,
)
from src.models.user import User

# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------


@pytest.fixture(scope="module")
def app():
    application = create_app("testing")
    with application.app_context():
        _db.create_all()
        yield application
        _db.drop_all()


@pytest.fixture
def session(app):
    """Provide a fresh, rolled-back session for each test."""
    with app.app_context():
        connection = _db.engine.connect()
        transaction = connection.begin()
        sess = _db.session
        yield sess
        sess.remove()
        transaction.rollback()
        connection.close()


def _make_user(session, **kwargs) -> User:
    defaults = dict(
        id=str(uuid.uuid4()),
        username=f"user_{uuid.uuid4().hex[:8]}",
        email=f"{uuid.uuid4().hex[:8]}@test.com",
        password_hash="hashed",
        first_name="Test",
        last_name="User",
        is_active=True,
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc),
    )
    defaults.update(kwargs)
    user = User(**defaults)
    session.add(user)
    session.flush()
    return user


def _make_account(session, user_id: str, **kwargs) -> Account:
    defaults = dict(
        id=str(uuid.uuid4()),
        user_id=user_id,
        account_name="Checking",
        account_type=AccountType.CHECKING,
        status=AccountStatus.ACTIVE,
        currency="USD",
        balance=Decimal("1000.00"),
        available_balance=Decimal("1000.00"),
        pending_balance=Decimal("0.00"),
        is_primary=False,
    )
    defaults.update(kwargs)
    acct = Account(**defaults)
    session.add(acct)
    session.flush()
    return acct


def _make_transaction(session, user_id: str, account_id: str, **kwargs) -> Transaction:
    defaults = dict(
        id=str(uuid.uuid4()),
        transaction_id=f"TXN-{uuid.uuid4().hex[:12].upper()}",
        user_id=user_id,
        account_id=account_id,
        transaction_type=TransactionType.DEBIT,
        status=TransactionStatus.COMPLETED,
        amount=Decimal("50.00"),
        currency="USD",
        description="Test transaction",
        category=TransactionCategory.PAYMENT,
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc),
    )
    defaults.update(kwargs)
    tx = Transaction(**defaults)
    session.add(tx)
    session.flush()
    return tx


# ---------------------------------------------------------------------------
# UserRepository tests
# ---------------------------------------------------------------------------


class TestUserRepository:
    def test_get_by_id_returns_user(self, session) -> None:
        user = _make_user(session)
        repo = UserRepository(session)
        found = repo.get_by_id(user.id)
        assert found is not None
        assert found.id == user.id

    def test_get_by_id_missing_returns_none(self, session) -> None:
        repo = UserRepository(session)
        assert repo.get_by_id(str(uuid.uuid4())) is None

    def test_get_by_email_case_insensitive(self, session) -> None:
        user = _make_user(session, email="Alice@Example.COM")
        repo = UserRepository(session)
        assert repo.get_by_email("alice@example.com") is not None
        assert repo.get_by_email("ALICE@EXAMPLE.COM") is not None

    def test_get_by_email_missing_returns_none(self, session) -> None:
        repo = UserRepository(session)
        assert repo.get_by_email("nobody@nowhere.com") is None

    def test_get_by_username(self, session) -> None:
        user = _make_user(session, username="uniqueuser123")
        repo = UserRepository(session)
        assert repo.get_by_username("uniqueuser123") is not None

    def test_list_active_returns_only_active(self, session) -> None:
        active = _make_user(session, is_active=True)
        inactive = _make_user(session, is_active=False)
        repo = UserRepository(session)
        ids = {u.id for u in repo.list_active()}
        assert active.id in ids
        assert inactive.id not in ids

    def test_count_active(self, session) -> None:
        before = UserRepository(session).count_active()
        _make_user(session, is_active=True)
        _make_user(session, is_active=False)
        after = UserRepository(session).count_active()
        assert after == before + 1

    def test_soft_delete_marks_user_inactive(self, session) -> None:
        user = _make_user(session)
        repo = UserRepository(session)
        repo.soft_delete(user)
        assert user.is_active is False
        assert user.deleted_at is not None


# ---------------------------------------------------------------------------
# AccountRepository tests
# ---------------------------------------------------------------------------


class TestAccountRepository:
    def test_get_by_id(self, session) -> None:
        user = _make_user(session)
        acct = _make_account(session, user.id)
        repo = AccountRepository(session)
        found = repo.get_by_id(acct.id)
        assert found is not None
        assert found.id == acct.id

    def test_get_by_id_missing(self, session) -> None:
        assert AccountRepository(session).get_by_id(str(uuid.uuid4())) is None

    def test_get_by_account_number(self, session) -> None:
        user = _make_user(session)
        acct = _make_account(session, user.id)
        repo = AccountRepository(session)
        found = repo.get_by_account_number(acct.account_number)
        assert found is not None

    def test_list_by_user_returns_user_accounts(self, session) -> None:
        u1 = _make_user(session)
        u2 = _make_user(session)
        a1 = _make_account(session, u1.id)
        a2 = _make_account(session, u1.id)
        _make_account(session, u2.id)
        repo = AccountRepository(session)
        results = repo.list_by_user(u1.id)
        ids = {a.id for a in results}
        assert a1.id in ids
        assert a2.id in ids

    def test_list_by_user_filters_by_status(self, session) -> None:
        user = _make_user(session)
        active = _make_account(session, user.id, status=AccountStatus.ACTIVE)
        frozen = _make_account(session, user.id, status=AccountStatus.FROZEN)
        repo = AccountRepository(session)
        actives = repo.list_by_user(user.id, status=AccountStatus.ACTIVE)
        ids = {a.id for a in actives}
        assert active.id in ids
        assert frozen.id not in ids

    def test_get_primary_account(self, session) -> None:
        user = _make_user(session)
        _make_account(session, user.id, is_primary=False)
        primary = _make_account(session, user.id, is_primary=True)
        repo = AccountRepository(session)
        found = repo.get_primary_account(user.id)
        assert found is not None
        assert found.id == primary.id

    def test_total_balance_by_currency(self, session) -> None:
        user = _make_user(session)
        _make_account(session, user.id, currency="USD", balance=Decimal("100.00"))
        _make_account(session, user.id, currency="USD", balance=Decimal("200.00"))
        _make_account(session, user.id, currency="EUR", balance=Decimal("50.00"))
        repo = AccountRepository(session)
        totals = dict(repo.total_balance_by_currency(user.id))
        assert totals["USD"] == Decimal("300.00")
        assert totals["EUR"] == Decimal("50.00")

    def test_list_high_risk(self, session) -> None:
        user = _make_user(session)
        low = _make_account(session, user.id, risk_score=10)
        high = _make_account(session, user.id, risk_score=90)
        repo = AccountRepository(session)
        risky = repo.list_high_risk(threshold=70)
        ids = {a.id for a in risky}
        assert high.id in ids
        assert low.id not in ids

    def test_soft_delete(self, session) -> None:
        user = _make_user(session)
        acct = _make_account(session, user.id)
        repo = AccountRepository(session)
        repo.soft_delete(acct)
        assert acct.status == AccountStatus.CLOSED
        assert acct.deleted_at is not None


# ---------------------------------------------------------------------------
# TransactionRepository tests
# ---------------------------------------------------------------------------


class TestTransactionRepository:
    def test_get_by_id(self, session) -> None:
        user = _make_user(session)
        acct = _make_account(session, user.id)
        tx = _make_transaction(session, user.id, acct.id)
        found = TransactionRepository(session).get_by_id(tx.id)
        assert found is not None
        assert found.id == tx.id

    def test_get_by_transaction_id(self, session) -> None:
        user = _make_user(session)
        acct = _make_account(session, user.id)
        tx = _make_transaction(
            session, user.id, acct.id, transaction_id="TXN-UNIQUE-001"
        )
        repo = TransactionRepository(session)
        found = repo.get_by_transaction_id("TXN-UNIQUE-001")
        assert found is not None

    def test_list_by_account(self, session) -> None:
        user = _make_user(session)
        a1 = _make_account(session, user.id)
        a2 = _make_account(session, user.id)
        t1 = _make_transaction(session, user.id, a1.id)
        t2 = _make_transaction(session, user.id, a1.id)
        _make_transaction(session, user.id, a2.id)
        repo = TransactionRepository(session)
        results = repo.list_by_account(a1.id)
        ids = {t.id for t in results}
        assert t1.id in ids
        assert t2.id in ids

    def test_list_by_account_status_filter(self, session) -> None:
        user = _make_user(session)
        acct = _make_account(session, user.id)
        pending = _make_transaction(
            session, user.id, acct.id, status=TransactionStatus.PENDING
        )
        done = _make_transaction(
            session, user.id, acct.id, status=TransactionStatus.COMPLETED
        )
        repo = TransactionRepository(session)
        results = repo.list_by_account(acct.id, status=TransactionStatus.PENDING)
        ids = {t.id for t in results}
        assert pending.id in ids
        assert done.id not in ids

    def test_list_pending(self, session) -> None:
        user = _make_user(session)
        acct = _make_account(session, user.id)
        p = _make_transaction(
            session, user.id, acct.id, status=TransactionStatus.PENDING
        )
        c = _make_transaction(
            session, user.id, acct.id, status=TransactionStatus.COMPLETED
        )
        repo = TransactionRepository(session)
        pending_ids = {t.id for t in repo.list_pending()}
        assert p.id in pending_ids
        assert c.id not in pending_ids

    def test_total_volume_by_account(self, session) -> None:
        user = _make_user(session)
        acct = _make_account(session, user.id)
        _make_transaction(
            session,
            user.id,
            acct.id,
            transaction_type=TransactionType.DEBIT,
            status=TransactionStatus.COMPLETED,
            amount=Decimal("100.00"),
        )
        _make_transaction(
            session,
            user.id,
            acct.id,
            transaction_type=TransactionType.DEBIT,
            status=TransactionStatus.COMPLETED,
            amount=Decimal("50.00"),
        )
        repo = TransactionRepository(session)
        total = repo.total_volume_by_account(acct.id)
        assert total == Decimal("150.00")

    def test_count_by_status(self, session) -> None:
        user = _make_user(session)
        acct = _make_account(session, user.id)
        _make_transaction(session, user.id, acct.id, status=TransactionStatus.COMPLETED)
        _make_transaction(session, user.id, acct.id, status=TransactionStatus.PENDING)
        repo = TransactionRepository(session)
        counts = dict(repo.count_by_status(acct.id))
        assert counts.get("completed", 0) >= 1
        assert counts.get("pending", 0) >= 1

    def test_update_transaction(self, session) -> None:
        user = _make_user(session)
        acct = _make_account(session, user.id)
        tx = _make_transaction(
            session, user.id, acct.id, status=TransactionStatus.PENDING
        )
        repo = TransactionRepository(session)
        updated = repo.update(tx, status=TransactionStatus.COMPLETED)
        assert updated.status == TransactionStatus.COMPLETED
