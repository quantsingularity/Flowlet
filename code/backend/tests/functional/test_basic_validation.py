"""
Basic validation tests for banking integrations and fraud detection modules.
Tests file existence and structural content without importing heavy ML dependencies.
"""

import sys
from pathlib import Path
from typing import Any

import pytest

backend_dir = Path(__file__).parent.parent.parent
src_dir = backend_dir / "src"
code_dir = backend_dir.parent  # code/ root – resolves ml_services.*
ml_fraud_dir = code_dir / "ml_services" / "fraud_detection"  # new canonical location
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))
if str(code_dir) not in sys.path:
    sys.path.insert(0, str(code_dir))


class TestModuleStructure:
    """Test that all modules can be imported and have correct structure"""

    def test_banking_integration_files_exist(self) -> Any:
        """Test that banking integration files exist"""
        banking_dir = src_dir / "integrations" / "banking"
        required_files = [
            "__init__.py",
            "manager.py",
            "plaid_integration.py",
            "open_banking_integration.py",
            "fdx_integration.py",
        ]
        for file_name in required_files:
            file_path = banking_dir / file_name
            assert file_path.exists(), f"Missing file: {file_path}"
            assert file_path.stat().st_size > 0, f"Empty file: {file_path}"

    def test_fraud_detection_files_exist(self) -> Any:
        """Test that fraud detection files exist in ml_services/fraud_detection"""
        required_files = [
            "__init__.py",
            "service.py",
            "anomaly_models.py",
            "ensemble_model.py",
            "supervised_models.py",
        ]
        for file_name in required_files:
            file_path = ml_fraud_dir / file_name
            assert (
                file_path.exists()
            ), f"Missing file: {file_name} in ml_services/fraud_detection"
            assert file_path.stat().st_size > 0, f"Empty file: {file_path}"

    def test_routes_files_exist(self) -> Any:
        """Test that route files exist"""
        routes_dir = src_dir / "routes"
        required_files = ["banking_integrations.py", "fraud_detection.py"]
        for file_name in required_files:
            file_path = routes_dir / file_name
            assert file_path.exists(), f"Missing file: {file_path}"
            assert file_path.stat().st_size > 0, f"Empty file: {file_path}"


class TestCodeQuality:
    """Test code quality and structure"""

    def test_banking_integration_classes_defined(self) -> Any:
        """Test that banking integration classes are properly defined"""
        manager_file = src_dir / "integrations" / "banking" / "manager.py"
        content = manager_file.read_text()
        assert "class BankingIntegrationManager" in content
        assert "class IntegrationType" in content
        assert "def register_integration" in content
        assert "def authenticate_all" in content
        assert "def get_accounts_from_all" in content

    def test_plaid_integration_structure(self) -> Any:
        """Test Plaid integration structure"""
        plaid_file = src_dir / "integrations" / "banking" / "plaid_integration.py"
        content = plaid_file.read_text()
        assert "class PlaidIntegration" in content
        assert "async def authenticate" in content
        assert "async def get_accounts" in content
        assert "async def get_transactions" in content
        assert "async def initiate_payment" in content

    def test_fraud_detection_models_structure(self) -> Any:
        """Test fraud detection models structure"""
        fraud_init = ml_fraud_dir / "__init__.py"
        content = fraud_init.read_text()
        # Anomaly models
        assert "class IsolationForestModel" in content
        assert "class OneClassSVMModel" in content
        assert "class AutoencoderModel" in content
        assert "def train" in content
        assert "def predict" in content
        # Supervised models
        assert "class RandomForestFraudModel" in content
        assert "class XGBoostFraudModel" in content
        assert "class LightGBMFraudModel" in content
        assert "class NeuralNetworkFraudModel" in content

    def test_ensemble_model_structure(self) -> Any:
        """Test ensemble model structure"""
        fraud_init = ml_fraud_dir / "__init__.py"
        content = fraud_init.read_text()
        assert "class EnsembleFraudModel" in content
        assert "class RealTimeFraudDetector" in content
        assert "def detect_fraud" in content
        assert "def _weighted_voting" in content
        assert "def _average_voting" in content

    def test_service_structure(self) -> Any:
        """Test fraud detection service structure"""
        service_file = ml_fraud_dir / "__init__.py"
        content = service_file.read_text()
        assert "class FraudDetectionService" in content
        assert "async def train_model" in content
        assert "async def detect_fraud" in content
        assert "async def batch_detect_fraud" in content

    def test_fraud_detection_init(self) -> Any:
        """Test fraud detection __init__ exports"""
        fraud_init = ml_fraud_dir / "__init__.py"
        content = fraud_init.read_text()
        assert "FraudDetectionError" in content
        assert "ModelNotTrainedError" in content

    def test_input_validation(self) -> Any:
        """Test input validation module"""
        validator_file = src_dir / "security" / "input_validator.py"
        content = validator_file.read_text()
        assert "class ValidationError" in content
        assert "class InputValidator" in content

    def test_banking_auth_logging(self) -> Any:
        """Test banking routes contain auth logging"""
        banking_routes = src_dir / "routes" / "banking_integrations.py"
        content = banking_routes.read_text()
        assert "log_authentication" in content

    def test_fraud_detection_compliance(self) -> Any:
        """Test fraud detection compliance features"""
        service_file = ml_fraud_dir / "__init__.py"
        content = service_file.read_text()
        assert "update_model_feedback" in content
        assert "performance_metrics" in content
        assert "model_version" in content


class TestAPIEndpoints:
    """Test API endpoint structure"""

    def test_banking_api_endpoints(self) -> Any:
        """Test banking API endpoints are properly defined"""
        banking_routes = src_dir / "routes" / "banking_integrations.py"
        content = banking_routes.read_text()
        endpoints = [
            "/integrations",
            "/accounts/<customer_id>",
            "/transactions",
            "/payments",
            "/payments/status",
            "/health",
        ]
        for endpoint in endpoints:
            assert endpoint in content, f"Missing endpoint: {endpoint}"

    def test_fraud_api_endpoints(self) -> Any:
        """Test fraud detection API endpoints are properly defined"""
        fraud_routes = src_dir / "routes" / "fraud_detection.py"
        content = fraud_routes.read_text()
        endpoints = [
            "/detect",
            "/detect/batch",
            "/model/train",
            "/model/status",
            "/alerts",
            "/statistics",
            "/feedback",
            "/health",
        ]
        for endpoint in endpoints:
            assert endpoint in content, f"Missing endpoint: {endpoint}"

    def test_cors_configuration(self) -> Any:
        """Test CORS configuration"""
        banking_routes = src_dir / "routes" / "banking_integrations.py"
        content = banking_routes.read_text()
        assert "@cross_origin()" in content
        assert "from flask_cors import cross_origin" in content
        fraud_routes = src_dir / "routes" / "fraud_detection.py"
        content = fraud_routes.read_text()
        assert "@cross_origin()" in content
        assert "from flask_cors import cross_origin" in content


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
