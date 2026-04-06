"""
Fraud detection test suite.
Tests fraud detection models, feature engineering, and service functionality.
"""

from datetime import datetime, timezone
from typing import Any

import pytest

try:
    import numpy as np
    import pandas as pd

    ML_AVAILABLE = True
except ImportError:
    np = None
    pd = None
    ML_AVAILABLE = False

from src.fraud_detection import (
    EnsembleFraudModel,
    FeatureEngineer,
    FraudAlert,
    FraudDetectionService,
    FraudExplainer,
    IsolationForestModel,
    RealTimeFraudDetector,
    RiskLevel,
    XGBoostFraudModel,
)


class TestFraudDetection:
    """Test suite for fraud detection models"""

    @pytest.fixture
    def sample_features_data(self) -> Any:
        """Generate sample feature data for testing"""
        if pd is None or np is None:
            pytest.skip("numpy/pandas not available")
        np.random.seed(42)
        n_samples = 100
        data = {
            "amount": np.random.lognormal(3, 1, n_samples),
            "hour_of_day": np.random.randint(0, 24, n_samples),
            "day_of_week": np.random.randint(0, 7, n_samples),
            "is_weekend": np.random.randint(0, 2, n_samples),
            "amount_zscore": np.random.normal(0, 1, n_samples),
            "velocity_1h": np.random.poisson(2, n_samples),
            "velocity_24h": np.random.poisson(10, n_samples),
            "velocity_7d": np.random.poisson(50, n_samples),
            "user_age_days": np.random.randint(1, 1000, n_samples),
            "avg_transaction_amount": np.random.lognormal(3, 1, n_samples),
            "transaction_count_30d": np.random.poisson(20, n_samples),
            "unique_merchants_30d": np.random.poisson(5, n_samples),
            "new_device": np.random.randint(0, 2, n_samples),
            "new_location": np.random.randint(0, 2, n_samples),
            "unusual_time": np.random.randint(0, 2, n_samples),
            "high_risk_merchant": np.random.randint(0, 2, n_samples),
        }
        return pd.DataFrame(data)

    @pytest.fixture
    def sample_labels(self, sample_features_data: Any) -> Any:
        """Generate sample labels (fraud/not fraud)"""
        if np is None:
            pytest.skip("numpy not available")
        np.random.seed(42)
        n_samples = len(sample_features_data)
        labels = np.zeros(n_samples)
        fraud_indices = np.random.choice(
            n_samples, max(1, int(n_samples * 0.05)), replace=False
        )
        labels[fraud_indices] = 1
        return pd.Series(labels)

    def test_risk_level_calculation(self) -> Any:
        """Test risk level calculation from FraudModelBase"""
        model = IsolationForestModel({})
        assert model.calculate_risk_level(0.1) == RiskLevel.LOW
        assert model.calculate_risk_level(0.4) == RiskLevel.MEDIUM
        assert model.calculate_risk_level(0.7) == RiskLevel.HIGH
        assert model.calculate_risk_level(0.9) == RiskLevel.CRITICAL

    def test_isolation_forest_model_init(self) -> Any:
        """Test IsolationForest model initialization"""
        config = {"contamination": 0.1, "n_estimators": 50, "random_state": 42}
        model = IsolationForestModel(config)
        assert model is not None
        assert not model.is_trained
        assert model.model_version is not None

    def test_xgboost_model_init(self) -> Any:
        """Test XGBoost model initialization"""
        config = {
            "n_estimators": 50,
            "max_depth": 4,
            "learning_rate": 0.1,
            "random_state": 42,
        }
        model = XGBoostFraudModel(config)
        assert model is not None
        assert not model.is_trained

    def test_ensemble_model_init(self) -> Any:
        """Test ensemble model initialization"""
        config = {
            "voting_strategy": "weighted",
            "anomaly_weight": 0.3,
            "supervised_weight": 0.7,
            "models": {
                "isolation_forest": {
                    "contamination": 0.1,
                    "n_estimators": 10,
                    "random_state": 42,
                },
            },
        }
        model = EnsembleFraudModel(config)
        assert model is not None
        assert model.voting_strategy == "weighted"

    def test_isolation_forest_train(self, sample_features_data: Any) -> Any:
        """Test IsolationForest model training"""
        if pd is None:
            pytest.skip("pandas not available")
        config = {"contamination": 0.1, "n_estimators": 10, "random_state": 42}
        model = IsolationForestModel(config)
        model.train(sample_features_data)
        assert model.is_trained
        assert model.training_timestamp is not None

    def test_feature_engineer_basic(self) -> Any:
        """Test feature engineer with minimal transaction data"""
        fe = FeatureEngineer()
        tx_data = {
            "transaction_id": "txn_001",
            "user_id": "user_001",
            "amount": 100.0,
            "currency": "USD",
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }
        features = fe.extract_transaction_features(tx_data)
        assert features is not None
        assert features.transaction_id == "txn_001"
        assert features.amount == 100.0
        assert features.hour_of_day is not None
        assert features.day_of_week is not None

    def test_real_time_detector_detect_fraud(self) -> Any:
        """Test real-time fraud detector"""
        detector = RealTimeFraudDetector()
        tx_data = {
            "transaction_id": "txn_test_001",
            "user_id": "user_test_001",
            "amount": 50.0,
            "currency": "USD",
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }
        alert = detector.detect_fraud(tx_data)
        assert isinstance(alert, FraudAlert)
        assert alert.transaction_id == "txn_test_001"
        assert isinstance(alert.risk_level, RiskLevel)
        assert 0.0 <= alert.risk_score <= 1.0
        assert isinstance(alert.fraud_types, list)
        assert alert.confidence >= 0.0

    def test_real_time_detector_high_amount(self) -> Any:
        """Test that high-amount transactions get elevated risk"""
        detector = RealTimeFraudDetector()
        tx_data = {
            "transaction_id": "txn_high_001",
            "user_id": "user_001",
            "amount": 50000.0,
            "currency": "USD",
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }
        alert = detector.detect_fraud(tx_data)
        assert isinstance(alert, FraudAlert)
        assert alert.risk_score >= 0.3

    def test_fraud_explainer(self) -> Any:
        """Test fraud explainer"""
        explainer = FraudExplainer()
        fe = FeatureEngineer()
        tx_data = {
            "transaction_id": "txn_001",
            "user_id": "user_001",
            "amount": 500.0,
            "currency": "USD",
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }
        features = fe.extract_transaction_features(tx_data)
        explanation = explainer.explain_prediction(
            features, 0.75, {"amount": 0.5, "velocity_1h": 0.2}
        )
        assert "risk_score" in explanation
        assert "summary" in explanation
        assert "primary_risk_factors" in explanation

    def test_fraud_detection_service_init(self) -> Any:
        """Test fraud detection service initialization"""
        config = {
            "model_config": {
                "voting_strategy": "weighted",
                "models": {
                    "isolation_forest": {
                        "contamination": 0.1,
                        "n_estimators": 10,
                        "random_state": 42,
                    }
                },
            }
        }
        service = FraudDetectionService(config)
        assert service is not None
        assert service.ensemble_model is not None
        assert service.real_time_detector is not None

    def test_fraud_service_model_status(self) -> Any:
        """Test getting model status from service"""
        service = FraudDetectionService({})
        status = service.get_model_status()
        assert "model_initialized" in status
        assert "model_trained" in status
        assert "performance_metrics" in status

    def test_fraud_service_statistics_empty(self) -> Any:
        """Test fraud statistics when no alerts"""
        service = FraudDetectionService({})
        stats = service.get_fraud_statistics(hours=1)
        assert "total_transactions" in stats
        assert "fraud_detected" in stats
        assert "fraud_rate" in stats
        assert stats["total_transactions"] == 0

    @pytest.mark.asyncio
    async def test_fraud_service_detect(self) -> Any:
        """Test async fraud detection"""
        service = FraudDetectionService({})
        tx_data = {
            "transaction_id": "async_txn_001",
            "user_id": "user_001",
            "amount": 100.0,
            "currency": "USD",
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }
        alert = await service.detect_fraud(tx_data)
        assert isinstance(alert, FraudAlert)
        assert alert.transaction_id == "async_txn_001"


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
