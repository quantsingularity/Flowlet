"""
Ensemble model for fraud detection combining multiple models.
Re-exports from main fraud_detection module.
"""

from src.fraud_detection import EnsembleFraudModel, RealTimeFraudDetector

__all__ = ["EnsembleFraudModel", "RealTimeFraudDetector"]


def detect_fraud(detector, transaction_data, user_history=None):
    """Detect fraud using the real-time detector."""
    return detector.detect_fraud(transaction_data, user_history)


def _weighted_voting(scores, weights):
    """Perform weighted voting across model scores."""
    if not scores:
        return 0.0
    total = sum(weights)
    return sum(s * w for s, w in zip(scores, weights)) / total if total > 0 else 0.0


def _average_voting(scores):
    """Perform simple average voting across model scores."""
    if not scores:
        return 0.0
    return sum(scores) / len(scores)
