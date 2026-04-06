"""
Anomaly detection models for fraud detection.
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
    from sklearn.ensemble import IsolationForest
    from sklearn.svm import OneClassSVM

    SKLEARN_AVAILABLE = True
except ImportError:
    IsolationForest = None
    OneClassSVM = None
    SKLEARN_AVAILABLE = False

try:
    import tensorflow as tf

    TF_AVAILABLE = True
except ImportError:
    tf = None
    TF_AVAILABLE = False

from . import AutoencoderModel, IsolationForestModel, OneClassSVMModel

__all__ = [
    "IsolationForestModel",
    "OneClassSVMModel",
    "AutoencoderModel",
]

logger = logging.getLogger(__name__)
