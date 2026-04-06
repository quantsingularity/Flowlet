"""
Ensemble fraud detection model.
"""

import logging
from typing import Any, Dict, List

try:
    import numpy as np

    NUMPY_AVAILABLE = True
except ImportError:
    np = None
    NUMPY_AVAILABLE = False

try:
    import pandas as pd

    PANDAS_AVAILABLE = True
except ImportError:
    pd = None
    PANDAS_AVAILABLE = False

from . import EnsembleFraudModel, FraudAlert, RealTimeFraudDetector

__all__ = [
    "EnsembleFraudModel",
    "RealTimeFraudDetector",
]

logger = logging.getLogger(__name__)


def detect_fraud(
    detector, transaction_data: Dict[str, Any], user_history=None
) -> FraudAlert:
    """Detect fraud using the real-time detector."""
    return detector.detect_fraud(transaction_data, user_history)


def _weighted_voting(scores: List[float], weights: List[float]) -> float:
    """Perform weighted voting across model scores."""
    if not scores:
        return 0.0
    total = sum(weights)
    return sum(s * w for s, w in zip(scores, weights)) / total if total > 0 else 0.0


def _average_voting(scores: List[float]) -> float:
    """Perform simple average voting across model scores."""
    if not scores:
        return 0.0
    return sum(scores) / len(scores)
