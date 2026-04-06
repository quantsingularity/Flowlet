"""
Supervised learning fraud detection models.
"""

import logging

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

try:
    import xgboost as xgb

    XGBOOST_AVAILABLE = True
except ImportError:
    xgb = None
    XGBOOST_AVAILABLE = False

try:
    import lightgbm as lgb

    LIGHTGBM_AVAILABLE = True
except ImportError:
    lgb = None
    LIGHTGBM_AVAILABLE = False

try:
    import tensorflow as tf

    TF_AVAILABLE = True
except ImportError:
    tf = None
    TF_AVAILABLE = False

try:
    from sklearn.ensemble import RandomForestClassifier

    SKLEARN_AVAILABLE = True
except ImportError:
    RandomForestClassifier = None
    SKLEARN_AVAILABLE = False

from . import (
    LightGBMFraudModel,
    NeuralNetworkFraudModel,
    RandomForestFraudModel,
    XGBoostFraudModel,
)

__all__ = [
    "RandomForestFraudModel",
    "XGBoostFraudModel",
    "LightGBMFraudModel",
    "NeuralNetworkFraudModel",
]

logger = logging.getLogger(__name__)
