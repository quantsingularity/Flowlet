"""
Supervised learning models for fraud detection.
Re-exports from main fraud_detection module.
"""

from src.fraud_detection import (
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


def train(model, training_data, labels=None):
    """Train a supervised fraud detection model."""
    return model.train(training_data, labels)


def predict(model, features):
    """Run prediction on a trained supervised model."""
    return model.predict(features)
