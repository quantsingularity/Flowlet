"""Audit logging utilities"""

import logging
from typing import Any

logger = logging.getLogger(__name__)


def log_audit_event(
    user_id: str,
    event_type: Any,
    severity: Any,
    details: str,
    ip_address: str = None,
) -> object:
    """Log an audit event to the database."""
    try:
        from src.models import db
        from src.models.audit_log import AuditLog

        audit_log = AuditLog(
            user_id=user_id,
            event_type=event_type,
            severity=severity,
            description=details,
            ip_address=ip_address,
        )
        db.session.add(audit_log)
        db.session.commit()
        return audit_log
    except Exception as e:
        logger.error(f"Failed to write audit log: {e}", exc_info=True)
        try:
            from src.models import db

            db.session.rollback()
        except Exception:
            pass
        return None
