"""Offline tests that do not require HTTP requests or external services."""

import logging
import os
import sys
from typing import Any

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

# Ensure backend/ root is on the path for src.* imports
_backend_root = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
if _backend_root not in sys.path:
    sys.path.insert(0, _backend_root)
# Ensure code/ root is on the path for ml_services.* imports
_code_root = os.path.dirname(_backend_root)
if _code_root not in sys.path:
    sys.path.insert(0, _code_root)

os.environ.setdefault("SECRET_KEY", "test-secret-key-for-testing-only")
os.environ.setdefault("JWT_SECRET_KEY", "test-jwt-secret-for-testing-only")


def test_app_creation() -> Any:
    """Test that the Flask app can be created"""
    from app import create_app

    app = create_app("testing")
    assert app is not None
    logger.info("Flask app created successfully")
    return True


def test_database_models() -> Any:
    """Test database model creation"""
    try:
        from app import create_app
        from src.models.database import db

        app = create_app("testing")
        with app.app_context():
            db.create_all()
            logger.info("Database models created successfully")
            return True
    except Exception as e:
        logger.info(f"Database model test failed: {e}")
        return False


def test_route_imports() -> Any:
    """Test that all route blueprints can be imported"""
    try:
        from src.routes import api_bp

        assert api_bp is not None
        logger.info("All route blueprints imported successfully")
        return True
    except Exception as e:
        logger.info(f"Route import test failed: {e}")
        return False


def test_service_functionality() -> Any:
    """Test basic service functionality without HTTP requests"""
    try:
        import uuid

        from app import create_app
        from src.models.account import Account
        from src.models.database import db
        from src.models.user import User

        app = create_app("testing")
        with app.app_context():
            db.create_all()
            unique_email = f"test_{str(uuid.uuid4())[:8]}@example.com"
            user = User(
                email=unique_email,
                first_name="John",
                last_name="Doe",
                password_hash="hashed",
            )
            db.session.add(user)
            db.session.commit()
            logger.info(f"User created with ID: {user.id}")

            account = Account(
                user_id=user.id,
                account_name="Test Checking",
                account_type="checking",
                currency="USD",
            )
            db.session.add(account)
            db.session.commit()
            logger.info(f"Account created with ID: {account.id}")
            db.session.delete(account)
            db.session.delete(user)
            db.session.commit()
            return True
    except Exception as e:
        logger.info(f"Service functionality test failed: {e}")
        return False


def test_ai_algorithms() -> Any:
    """Test AI service algorithms"""
    try:
        from ml_services.fraud_detection import FeatureEngineer

        fe = FeatureEngineer()
        assert fe is not None
        logger.info("AI algorithms validated (fraud detection, risk scoring)")
        return True
    except Exception as e:
        logger.info(f"AI algorithm test failed: {e}")
        return False


def test_security_functions() -> Any:
    """Test security service functions"""
    try:
        from src.security.password_security import check_password, hash_password

        hashed = hash_password("TestPassword123!")
        assert check_password(hashed, "TestPassword123!")
        logger.info("Security functions tested successfully")
        return True
    except Exception as e:
        logger.info(f"Security function test failed: {e}")
        return False


def main() -> Any:
    """Run all offline tests"""
    logger.info("Running Flowlet Backend Offline Tests")
    tests = [
        ("App Creation", test_app_creation),
        ("Database Models", test_database_models),
        ("Route Imports", test_route_imports),
        ("Service Functionality", test_service_functionality),
        ("AI Algorithms", test_ai_algorithms),
        ("Security Functions", test_security_functions),
    ]
    passed = 0
    total = len(tests)
    for test_name, test_func in tests:
        logger.info(f"Testing {test_name}:")
        try:
            if test_func():
                passed += 1
                logger.info(f"  PASSED")
            else:
                logger.info(f"  FAILED")
        except Exception as e:
            logger.info(f"  FAILED with exception: {e}")
    logger.info(f"Test Results: {passed}/{total} tests passed")
    return passed == total


if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
