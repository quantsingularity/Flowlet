import os
import sys

os.environ.setdefault("SECRET_KEY", "test-secret-key-for-testing-only")
os.environ.setdefault("JWT_SECRET_KEY", "test-jwt-secret-for-testing-only")
# backend/ dir – resolves src.* imports
backend_root = os.path.dirname(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
)
if backend_root not in sys.path:
    sys.path.insert(0, backend_root)

# code/ dir (parent of backend/) – resolves ml_services.* imports
code_root = os.path.dirname(backend_root)
if code_root not in sys.path:
    sys.path.insert(0, code_root)
