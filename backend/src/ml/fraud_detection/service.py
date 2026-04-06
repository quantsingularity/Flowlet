"""
Fraud detection service - re-exports from main module.
"""

from src.fraud_detection import FraudDetectionError, FraudDetectionService
from src.fraud_detection.service import get_fraud_service

__all__ = ["FraudDetectionService", "FraudDetectionError", "get_fraud_service"]
