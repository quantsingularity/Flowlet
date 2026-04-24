# Flowlet ML Services

## Overview

The `ml_services/` directory contains the machine learning stack that powers Flowlet's AI-enhanced financial intelligence. These services provide real-time fraud detection, risk assessment, transaction intelligence, and intelligent support capabilities. Built with Python and industry-standard ML frameworks, the models are designed for low-latency inference in production financial pipelines.

## Directory Structure

```
ml_services/
├── ai_models/                    # Core AI model implementations
│   ├── fraud_detection.py        # Real-time transaction fraud scoring
│   ├── risk_assessment.py        # User and transaction risk profiling
│   ├── transaction_intelligence.py  # Pattern analysis and anomaly detection for transactions
│   └── support_chatbot.py        # Conversational AI for customer support
├── fraud_detection/              # Production fraud detection pipeline
│   ├── anomaly_models.py         # Unsupervised anomaly detection models
│   ├── ensemble_model.py         # Stacked ensemble of XGBoost, LightGBM, and Random Forest
│   ├── supervised_models.py      # Individual supervised classifier implementations
│   └── service.py                # Real-time inference service entry point
└── tests/                        # ML-specific tests and benchmarks
```

## Core AI Models (`ai_models/`)

The `ai_models/` package provides the foundational intelligence layer used by the backend services.

| Module                        | Purpose                   | Key Functionality                                                                                                               |
| ----------------------------- | ------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `fraud_detection.py`          | Transaction Fraud Scoring | Identifies suspicious transactions using learned behavioral patterns and feature engineering.                                   |
| `risk_assessment.py`          | Risk Profiling            | Evaluates user-level and transaction-level risk using statistical and machine learning methods.                                 |
| `transaction_intelligence.py` | Pattern Analysis          | Detects anomalies in transaction sequences, identifies recurring patterns, and flags deviations from established user behavior. |
| `support_chatbot.py`          | Conversational AI         | Provides automated customer support responses and routes complex queries to human agents.                                       |

## Fraud Detection Pipeline (`fraud_detection/`)

The `fraud_detection/` package is the operational heart of Flowlet's security AI. It implements a multi-layered detection strategy that combines supervised learning, unsupervised anomaly detection, and ensemble stacking to achieve high accuracy with low latency.

### Architecture

| Component              | Role                                                                                                                                                            |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `supervised_models.py` | Trains and manages individual classifiers (XGBoost, LightGBM, Random Forest) on labeled historical transaction data.                                            |
| `anomaly_models.py`    | Implements unsupervised methods (isolation forest, autoencoder variants) to catch novel fraud patterns not seen in training data.                               |
| `ensemble_model.py`    | Combines outputs from supervised and anomaly models via a meta-learner to produce a final risk score, reducing false positives while maintaining strong recall. |
| `service.py`           | Production inference service that accepts transaction features via API calls and returns real-time fraud scores and decision recommendations.                   |

### Performance Benchmarks

The fraud detection ensemble (XGBoost + LightGBM + Random Forest stacking) achieves the following on production validation data:

| Metric                  | Value |
| ----------------------- | ----- |
| AUC-ROC                 | 0.987 |
| Precision               | 97.3% |
| Recall                  | 96.1% |
| F1 Score                | 96.7% |
| Inference latency (p50) | 8 ms  |

For full performance reports including confusion matrices, walk-forward validation results, fairness analysis, and operational benchmarks, see `docs/ML_MODEL_PERFORMANCE.md` in the project root.

## Technology Stack

| Component           | Technology                      |
| ------------------- | ------------------------------- |
| Language            | Python 3.11+                    |
| ML Frameworks       | scikit-learn, XGBoost, LightGBM |
| Feature Engineering | NumPy, pandas                   |
| Model Serialization | joblib / pickle                 |
| API Integration     | Flask-compatible service layer  |

## Integration with Backend

The ML services integrate with the main backend through the `backend/src/ai/` module. During transaction processing, the backend calls the fraud detection service to obtain a risk score before authorizing a payment. Similarly, risk assessment and transaction intelligence models are invoked during user onboarding, KYC workflows, and wallet operations.

## Testing

ML service tests are located in `ml_services/tests/` and cover:

- **Model correctness**: Unit tests for individual model predictions and edge cases
- **Pipeline integrity**: End-to-end validation of the preprocessing, inference, and scoring pipeline
- **Performance benchmarks**: Latency and throughput tests under simulated load
- **Fairness and drift**: Validation that models maintain equitable performance across user segments and detect data drift

Run ML tests:

```bash
cd code/ml_services
pytest tests/
```

## Usage

### Real-Time Fraud Scoring

The primary production entry point is `fraud_detection/service.py`, which exposes a callable interface for real-time transaction scoring:

```python
from ml_services.fraud_detection.service import FraudDetectionService

service = FraudDetectionService()
score = service.predict(transaction_features)
```

### Model Retraining

Individual models can be retrained by running their respective module scripts directly. Training pipelines expect preprocessed transaction data in the format documented in `docs/ML_MODEL_PERFORMANCE.md`.

## Related Documentation

- [Backend README](../backend/README.md) - API routes and backend architecture that consume these ML services
- [Project README](../../README.md) - High-level project overview and installation guide
- `docs/ML_MODEL_PERFORMANCE.md` - Detailed model tearsheets and operational metrics
