"""
Repository pattern for Flowlet's database access layer.

Each repository encapsulates all SQLAlchemy queries for its aggregate root,
keeping raw ORM calls out of route handlers and service functions.  All
methods are fully type-annotated; none uses ``Any`` as a substitute for a
real return type.
"""

from __future__ import annotations

import logging
from datetime import datetime, timezone
from decimal import Decimal
from typing import List, Optional, Tuple

from sqlalchemy import and_, desc, func, or_, select
from sqlalchemy.orm import Session

from ..models.account import Account, AccountStatus, AccountType
from ..models.card import Card, CardStatus
from ..models.transaction import Transaction, TransactionStatus, TransactionType
from ..models.user import User

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Base repository
# ---------------------------------------------------------------------------


class BaseRepository:
    """Thin base providing a shared SQLAlchemy session."""

    def __init__(self, session: Session) -> None:
        self._session = session

    @property
    def session(self) -> Session:
        return self._session


# ---------------------------------------------------------------------------
# UserRepository
# ---------------------------------------------------------------------------


class UserRepository(BaseRepository):
    """CRUD and query operations for :class:`~src.models.user.User`."""

    def get_by_id(self, user_id: str) -> Optional[User]:
        """Return the user with *user_id*, or ``None`` if not found."""
        return self._session.get(User, user_id)

    def get_by_email(self, email: str) -> Optional[User]:
        """Return the user whose email matches *email* (case-insensitive)."""
        stmt = select(User).where(func.lower(User.email) == func.lower(email))
        return self._session.scalars(stmt).first()

    def get_by_username(self, username: str) -> Optional[User]:
        """Return the user with the given *username*, or ``None``."""
        stmt = select(User).where(User.username == username)
        return self._session.scalars(stmt).first()

    def list_active(self, *, limit: int = 100, offset: int = 0) -> List[User]:
        """Return paginated active users, newest first."""
        stmt = (
            select(User)
            .where(User.is_active.is_(True))
            .order_by(desc(User.created_at))
            .limit(limit)
            .offset(offset)
        )
        return list(self._session.scalars(stmt))

    def search(self, query: str, *, limit: int = 50) -> List[User]:
        """Full-text search across email, username, first and last name."""
        pattern = f"%{query}%"
        stmt = (
            select(User)
            .where(
                or_(
                    User.email.ilike(pattern),
                    User.username.ilike(pattern),
                    User.first_name.ilike(pattern),
                    User.last_name.ilike(pattern),
                )
            )
            .limit(limit)
        )
        return list(self._session.scalars(stmt))

    def count_active(self) -> int:
        """Return the total count of active users."""
        stmt = select(func.count()).select_from(User).where(User.is_active.is_(True))
        return self._session.scalar(stmt) or 0

    def create(self, **kwargs: object) -> User:
        """Create, persist, and return a new :class:`User`."""
        user = User(**kwargs)
        self._session.add(user)
        self._session.flush()
        logger.info("Created user id=%s email=%s", user.id, user.email)
        return user

    def update(self, user: User, **kwargs: object) -> User:
        """Apply *kwargs* as attribute updates on *user* and flush."""
        for key, value in kwargs.items():
            setattr(user, key, value)
        user.updated_at = datetime.now(timezone.utc)
        self._session.flush()
        return user

    def soft_delete(self, user: User) -> None:
        """Mark the user as deleted without removing the row."""
        user.is_active = False
        user.deleted_at = datetime.now(timezone.utc)
        self._session.flush()


# ---------------------------------------------------------------------------
# AccountRepository
# ---------------------------------------------------------------------------


class AccountRepository(BaseRepository):
    """CRUD and query operations for :class:`~src.models.account.Account`."""

    def get_by_id(self, account_id: str) -> Optional[Account]:
        """Return the account with *account_id*, or ``None``."""
        return self._session.get(Account, account_id)

    def get_by_account_number(self, account_number: str) -> Optional[Account]:
        """Return the account matching *account_number*."""
        stmt = select(Account).where(Account.account_number == account_number)
        return self._session.scalars(stmt).first()

    def list_by_user(
        self,
        user_id: str,
        *,
        status: Optional[AccountStatus] = None,
        account_type: Optional[AccountType] = None,
        limit: int = 50,
        offset: int = 0,
    ) -> List[Account]:
        """Return accounts owned by *user_id*, optionally filtered."""
        conditions = [Account.user_id == user_id]
        if status is not None:
            conditions.append(Account.status == status)
        if account_type is not None:
            conditions.append(Account.account_type == account_type)
        stmt = (
            select(Account)
            .where(and_(*conditions))
            .order_by(desc(Account.created_at))
            .limit(limit)
            .offset(offset)
        )
        return list(self._session.scalars(stmt))

    def get_primary_account(self, user_id: str) -> Optional[Account]:
        """Return the user's primary account, or ``None``."""
        stmt = select(Account).where(
            and_(Account.user_id == user_id, Account.is_primary.is_(True))
        )
        return self._session.scalars(stmt).first()

    def get_active_by_user(self, user_id: str) -> List[Account]:
        """Return all active, non-deleted accounts for *user_id*."""
        stmt = select(Account).where(
            and_(
                Account.user_id == user_id,
                Account.status == AccountStatus.ACTIVE,
                Account.deleted_at.is_(None),
            )
        )
        return list(self._session.scalars(stmt))

    def total_balance_by_currency(self, user_id: str) -> List[Tuple[str, Decimal]]:
        """Return ``[(currency, total_balance)]`` for each currency the user holds."""
        stmt = (
            select(Account.currency, func.sum(Account.balance))
            .where(
                and_(
                    Account.user_id == user_id,
                    Account.status == AccountStatus.ACTIVE,
                )
            )
            .group_by(Account.currency)
        )
        rows = self._session.execute(stmt).all()
        return [(str(row[0]), Decimal(str(row[1] or 0))) for row in rows]

    def count_by_status(self) -> List[Tuple[str, int]]:
        """Return ``[(status_name, count)]`` for all account statuses."""
        stmt = select(Account.status, func.count()).group_by(Account.status)
        rows = self._session.execute(stmt).all()
        return [(str(row[0].value), int(row[1])) for row in rows]

    def list_high_risk(self, threshold: int = 70, *, limit: int = 100) -> List[Account]:
        """Return accounts whose risk score is at or above *threshold*."""
        stmt = (
            select(Account)
            .where(Account.risk_score >= threshold)
            .order_by(desc(Account.risk_score))
            .limit(limit)
        )
        return list(self._session.scalars(stmt))

    def create(self, **kwargs: object) -> Account:
        """Create, persist, and return a new :class:`Account`."""
        account = Account(**kwargs)
        self._session.add(account)
        self._session.flush()
        logger.info(
            "Created account id=%s user_id=%s type=%s",
            account.id,
            account.user_id,
            account.account_type,
        )
        return account

    def update(self, account: Account, **kwargs: object) -> Account:
        """Apply *kwargs* as attribute updates on *account* and flush."""
        for key, value in kwargs.items():
            setattr(account, key, value)
        account.updated_at = datetime.now(timezone.utc)
        self._session.flush()
        return account

    def soft_delete(self, account: Account) -> None:
        """Soft-delete an account (sets deleted_at and closes it)."""
        account.deleted_at = datetime.now(timezone.utc)
        account.status = AccountStatus.CLOSED
        self._session.flush()


# ---------------------------------------------------------------------------
# TransactionRepository
# ---------------------------------------------------------------------------


class TransactionRepository(BaseRepository):
    """CRUD and query operations for :class:`~src.models.transaction.Transaction`."""

    def get_by_id(self, transaction_id: str) -> Optional[Transaction]:
        """Return the transaction with *transaction_id* (PK), or ``None``."""
        return self._session.get(Transaction, transaction_id)

    def get_by_transaction_id(self, transaction_id: str) -> Optional[Transaction]:
        """Return the transaction with the business-level *transaction_id*."""
        stmt = select(Transaction).where(Transaction.transaction_id == transaction_id)
        return self._session.scalars(stmt).first()

    def list_by_account(
        self,
        account_id: str,
        *,
        status: Optional[TransactionStatus] = None,
        tx_type: Optional[TransactionType] = None,
        since: Optional[datetime] = None,
        until: Optional[datetime] = None,
        limit: int = 50,
        offset: int = 0,
    ) -> List[Transaction]:
        """Return transactions for *account_id* with optional filters."""
        conditions = [Transaction.account_id == account_id]
        if status is not None:
            conditions.append(Transaction.status == status)
        if tx_type is not None:
            conditions.append(Transaction.transaction_type == tx_type)
        if since is not None:
            conditions.append(Transaction.created_at >= since)
        if until is not None:
            conditions.append(Transaction.created_at <= until)
        stmt = (
            select(Transaction)
            .where(and_(*conditions))
            .order_by(desc(Transaction.created_at))
            .limit(limit)
            .offset(offset)
        )
        return list(self._session.scalars(stmt))

    def list_by_user(
        self,
        user_id: str,
        *,
        limit: int = 50,
        offset: int = 0,
    ) -> List[Transaction]:
        """Return transactions belonging to *user_id*, newest first."""
        stmt = (
            select(Transaction)
            .where(Transaction.user_id == user_id)
            .order_by(desc(Transaction.created_at))
            .limit(limit)
            .offset(offset)
        )
        return list(self._session.scalars(stmt))

    def list_pending(self, *, limit: int = 200) -> List[Transaction]:
        """Return all pending transactions, oldest first (for processing queues)."""
        stmt = (
            select(Transaction)
            .where(Transaction.status == TransactionStatus.PENDING)
            .order_by(Transaction.created_at)
            .limit(limit)
        )
        return list(self._session.scalars(stmt))

    def list_suspicious(self, *, limit: int = 100) -> List[Transaction]:
        """Return flagged / high-risk transactions for compliance review."""
        stmt = (
            select(Transaction)
            .where(Transaction.is_suspicious.is_(True))
            .order_by(desc(Transaction.created_at))
            .limit(limit)
        )
        return list(self._session.scalars(stmt))

    def total_volume_by_account(
        self,
        account_id: str,
        *,
        since: Optional[datetime] = None,
    ) -> Decimal:
        """Return the total debited volume for *account_id* (optionally since a date)."""
        conditions = [
            Transaction.account_id == account_id,
            Transaction.transaction_type == TransactionType.DEBIT,
            Transaction.status == TransactionStatus.COMPLETED,
        ]
        if since is not None:
            conditions.append(Transaction.created_at >= since)
        stmt = select(func.sum(Transaction.amount)).where(and_(*conditions))
        result = self._session.scalar(stmt)
        return Decimal(str(result or 0))

    def count_by_status(
        self, account_id: Optional[str] = None
    ) -> List[Tuple[str, int]]:
        """Return ``[(status_name, count)]``, optionally scoped to *account_id*."""
        conditions = []
        if account_id is not None:
            conditions.append(Transaction.account_id == account_id)
        stmt = select(Transaction.status, func.count()).group_by(Transaction.status)
        if conditions:
            stmt = stmt.where(and_(*conditions))
        rows = self._session.execute(stmt).all()
        return [(str(row[0].value), int(row[1])) for row in rows]

    def daily_volume(
        self,
        account_id: str,
        *,
        since: Optional[datetime] = None,
    ) -> List[Tuple[str, Decimal]]:
        """Return ``[(date_str, total_amount)]`` grouped by calendar day."""
        conditions = [
            Transaction.account_id == account_id,
            Transaction.status == TransactionStatus.COMPLETED,
        ]
        if since is not None:
            conditions.append(Transaction.created_at >= since)
        date_col = func.date(Transaction.created_at).label("day")
        stmt = (
            select(date_col, func.sum(Transaction.amount).label("total"))
            .where(and_(*conditions))
            .group_by(date_col)
            .order_by(date_col)
        )
        rows = self._session.execute(stmt).all()
        return [(str(row[0]), Decimal(str(row[1] or 0))) for row in rows]

    def create(self, **kwargs: object) -> Transaction:
        """Create, persist, and return a new :class:`Transaction`."""
        tx = Transaction(**kwargs)
        self._session.add(tx)
        self._session.flush()
        logger.info(
            "Created transaction id=%s account_id=%s amount=%s",
            tx.id,
            tx.account_id,
            tx.amount,
        )
        return tx

    def update(self, tx: Transaction, **kwargs: object) -> Transaction:
        """Apply *kwargs* as attribute updates on *tx* and flush."""
        for key, value in kwargs.items():
            setattr(tx, key, value)
        tx.updated_at = datetime.now(timezone.utc)
        self._session.flush()
        return tx


# ---------------------------------------------------------------------------
# CardRepository
# ---------------------------------------------------------------------------


class CardRepository(BaseRepository):
    """CRUD and query operations for :class:`~src.models.card.Card`."""

    def get_by_id(self, card_id: str) -> Optional[Card]:
        """Return the card with *card_id*, or ``None``."""
        return self._session.get(Card, card_id)

    def list_by_account(
        self,
        account_id: str,
        *,
        status: Optional[CardStatus] = None,
    ) -> List[Card]:
        """Return all cards linked to *account_id*, optionally filtered by status."""
        conditions = [Card.account_id == account_id]
        if status is not None:
            conditions.append(Card.status == status)
        stmt = select(Card).where(and_(*conditions)).order_by(desc(Card.created_at))
        return list(self._session.scalars(stmt))

    def list_by_user(self, user_id: str) -> List[Card]:
        """Return all non-deleted cards for *user_id*."""
        stmt = (
            select(Card)
            .where(and_(Card.user_id == user_id, Card.deleted_at.is_(None)))
            .order_by(desc(Card.created_at))
        )
        return list(self._session.scalars(stmt))

    def get_active_card(self, card_id: str) -> Optional[Card]:
        """Return the card only if it is currently active."""
        stmt = select(Card).where(
            and_(Card.id == card_id, Card.status == CardStatus.ACTIVE)
        )
        return self._session.scalars(stmt).first()

    def count_active_by_user(self, user_id: str) -> int:
        """Return the number of active cards for *user_id*."""
        stmt = (
            select(func.count())
            .select_from(Card)
            .where(
                and_(
                    Card.user_id == user_id,
                    Card.status == CardStatus.ACTIVE,
                    Card.deleted_at.is_(None),
                )
            )
        )
        return self._session.scalar(stmt) or 0

    def create(self, **kwargs: object) -> Card:
        """Create, persist, and return a new :class:`Card`."""
        card = Card(**kwargs)
        self._session.add(card)
        self._session.flush()
        logger.info("Created card id=%s account_id=%s", card.id, card.account_id)
        return card

    def update(self, card: Card, **kwargs: object) -> Card:
        """Apply *kwargs* as attribute updates on *card* and flush."""
        for key, value in kwargs.items():
            setattr(card, key, value)
        self._session.flush()
        return card

    def soft_delete(self, card: Card) -> None:
        """Soft-delete a card."""
        card.deleted_at = datetime.now(timezone.utc)
        card.status = CardStatus.CANCELLED
        self._session.flush()
