"""
Anomaly detection models for fraud detection.
Re-exports from main fraud_detection module.
"""

from src.fraud_detection import (
    AutoencoderModel,
    FraudModelBase,
    IsolationForestModel,
    OneClassSVMModel,
)

__all__ = [
    "IsolationForestModel",
    "OneClassSVMModel",
    "AutoencoderModel",
    "FraudModelBase",
]


def train(model, training_data, labels=None):
    """Train a fraud detection model."""
    return model.train(training_data, labels)


def predict(model, features):
    """Run prediction on a trained model."""
    return model.predict(features)
