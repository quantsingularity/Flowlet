"""KYC Record model for Know Your Customer verification"""

import uuid
from datetime import datetime, timezone
from enum import Enum as PyEnum
from typing import Any

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Index, String, Text

from .database import Base, db


class KYCVerificationStatus(PyEnum):
    """KYC verification status"""

    PENDING = "pending"
    IN_REVIEW = "in_review"
    APPROVED = "approved"
    REJECTED = "rejected"
    EXPIRED = "expired"
    REQUIRES_RESUBMISSION = "requires_resubmission"


class KYCDocumentType(PyEnum):
    """Types of KYC documents"""

    PASSPORT = "passport"
    DRIVERS_LICENSE = "drivers_license"
    NATIONAL_ID = "national_id"
    PROOF_OF_ADDRESS = "proof_of_address"
    PROOF_OF_INCOME = "proof_of_income"
    BANK_STATEMENT = "bank_statement"
    UTILITY_BILL = "utility_bill"
    OTHER = "other"


class KYCRecord(Base):
    """KYC verification record"""

    __tablename__ = "kyc_records"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    verification_level = Column(String(20), nullable=False, default="basic")
    status = Column(
        db.Enum(KYCVerificationStatus),
        default=KYCVerificationStatus.PENDING,
        nullable=False,
    )
    document_type = Column(db.Enum(KYCDocumentType), nullable=True)
    document_number = Column(String(100), nullable=True)
    document_expiry = Column(DateTime(timezone=True), nullable=True)
    document_country = Column(String(2), nullable=True)
    document_url = Column(String(500), nullable=True)
    selfie_url = Column(String(500), nullable=True)
    verification_notes = Column(Text, nullable=True)
    rejection_reason = Column(String(500), nullable=True)
    reviewer_id = Column(String(36), nullable=True)
    reviewed_at = Column(DateTime(timezone=True), nullable=True)
    expires_at = Column(DateTime(timezone=True), nullable=True)
    is_resubmission = Column(Boolean, default=False, nullable=False)
    previous_record_id = Column(String(36), ForeignKey("kyc_records.id"), nullable=True)
    risk_score = Column(db.Integer, default=0)
    sanctions_checked = Column(Boolean, default=False, nullable=False)
    pep_checked = Column(Boolean, default=False, nullable=False)
    adverse_media_checked = Column(Boolean, default=False, nullable=False)
    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    user = db.relationship("User", back_populates="kyc_records")

    __table_args__ = (
        Index("idx_kyc_user_id", "user_id"),
        Index("idx_kyc_status", "status"),
        Index("idx_kyc_created_at", "created_at"),
    )

    def to_dict(self) -> Any:
        """Convert to dictionary for API responses"""
        return {
            "id": self.id,
            "user_id": self.user_id,
            "verification_level": self.verification_level,
            "status": self.status.value if self.status else None,
            "document_type": self.document_type.value if self.document_type else None,
            "document_number": self.document_number,
            "document_country": self.document_country,
            "verification_notes": self.verification_notes,
            "rejection_reason": self.rejection_reason,
            "reviewed_at": self.reviewed_at.isoformat() if self.reviewed_at else None,
            "expires_at": self.expires_at.isoformat() if self.expires_at else None,
            "risk_score": self.risk_score,
            "sanctions_checked": self.sanctions_checked,
            "pep_checked": self.pep_checked,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }

    def __repr__(self) -> Any:
        return f"<KYCRecord {self.id} user={self.user_id} status={self.status.value if self.status else 'N/A'}>"
