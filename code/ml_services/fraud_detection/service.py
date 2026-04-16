"""
Fraud Detection Service module.
The service implementation lives in __init__.py for unified exports.
This module re-exports for backward compatibility.
"""

import logging
from typing import Any, Dict, Optional

from . import FraudDetectionError, FraudDetectionService

logger = logging.getLogger(__name__)

__all__ = ["FraudDetectionService", "FraudDetectionError", "get_fraud_service"]


def get_fraud_service(config: Optional[Dict[str, Any]] = None) -> FraudDetectionService:
    """Get or create the global fraud detection service instance."""
    import ml_services.fraud_detection as fd_module

    if fd_module._fraud_service_instance is None:
        fd_module._fraud_service_instance = FraudDetectionService(
            config
            or {
                "model_path": "/tmp/fraud_model.joblib",
                "auto_retrain": True,
                "retrain_threshold_days": 30,
            }
        )
    return fd_module._fraud_service_instance
