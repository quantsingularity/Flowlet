import hashlib
import math
import re
import secrets
import string
from datetime import datetime, timedelta, timezone
from typing import List

try:
    import bcrypt

    BCRYPT_AVAILABLE = True
except ImportError:
    bcrypt = None
    BCRYPT_AVAILABLE = False

"""
Password Security Module - Provides secure hashing, verification, and strength validation.
"""


# --- Core Hashing Functions ---


def hash_password(password: str) -> str:
    """Hash password using bcrypt with salt"""
    if BCRYPT_AVAILABLE:
        salt = bcrypt.gensalt(rounds=12)
        return bcrypt.hashpw(password.encode("utf-8"), salt).decode("utf-8")
    # Fallback: use hashlib (NOT for production use)
    salt = secrets.token_hex(16)
    h = hashlib.sha256(f"{salt}:{password}".encode()).hexdigest()
    return f"sha256:{salt}:{h}"


def check_password(hashed: str, password: str) -> bool:
    """Verify password against hash"""
    if BCRYPT_AVAILABLE and not hashed.startswith("sha256:"):
        return bcrypt.checkpw(password.encode("utf-8"), hashed.encode("utf-8"))
    # Fallback for sha256 hashes
    if hashed.startswith("sha256:"):
        _, salt, stored_hash = hashed.split(":", 2)
        computed = hashlib.sha256(f"{salt}:{password}".encode()).hexdigest()
        return computed == stored_hash
    return False


def validate_password_strength(password: str) -> tuple[bool, List[str]]:
    """Validate password meets financial industry requirements"""
    errors = []
    if len(password) < 12:
        errors.append("Password must be at least 12 characters long")
    if not re.search(r"[A-Z]", password):
        errors.append("Password must contain at least one uppercase letter")
    if not re.search(r"[a-z]", password):
        errors.append("Password must contain at least one lowercase letter")
    if not re.search(r"\d", password):
        errors.append("Password must contain at least one number")
    if not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
        errors.append("Password must contain at least one special character")
    if re.search(r"(.)\1{2,}", password):
        errors.append("Password cannot contain three or more repeated characters")
    common_passwords = [
        "password",
        "123456",
        "password123",
        "admin",
        "qwerty",
        "flowlet123",
        "flowlet",
    ]
    if password.lower() in common_passwords:
        errors.append("Password cannot be a common password")
    return len(errors) == 0, errors


def generate_secure_password(length: int = 16) -> str:
    """Generate a cryptographically secure password"""
    if length < 12:
        length = 12
    password = [
        secrets.choice(string.ascii_uppercase),
        secrets.choice(string.ascii_lowercase),
        secrets.choice(string.digits),
        secrets.choice('!@#$%^&*(),.?":{}|<>'),
    ]
    all_chars = string.ascii_letters + string.digits + '!@#$%^&*(),.?":{}|<>'
    for _ in range(length - 4):
        password.append(secrets.choice(all_chars))
    secrets.SystemRandom().shuffle(password)
    return "".join(password)


def check_password_history(new_password: str, password_history: List[str]) -> bool:
    """Check if password was used recently"""
    for old_hash in password_history:
        if check_password(old_hash, new_password):
            return False
    return True


def is_password_expired(last_changed: datetime, max_age_days: int = 90) -> bool:
    """Check if password has expired"""
    if not last_changed:
        return True
    expiry_date = last_changed + timedelta(days=max_age_days)
    return (
        datetime.now(timezone.utc) > expiry_date.replace(tzinfo=timezone.utc)
        if expiry_date.tzinfo is None
        else datetime.now(timezone.utc) > expiry_date
    )


def calculate_password_entropy(password: str) -> float:
    """Calculate password entropy for strength assessment"""
    charset_size = 0
    if re.search(r"[a-z]", password):
        charset_size += 26
    if re.search(r"[A-Z]", password):
        charset_size += 26
    if re.search(r"\d", password):
        charset_size += 10
    if re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
        charset_size += 32
    if charset_size == 0:
        return 0
    return len(password) * math.log2(charset_size)


def get_password_strength_score(password: str) -> tuple[int, str]:
    """Get password strength score (0-100) and description"""
    entropy = calculate_password_entropy(password)
    if entropy < 30:
        return 0, "Very Weak"
    elif entropy < 50:
        return 25, "Weak"
    elif entropy < 70:
        return 50, "Fair"
    elif entropy < 90:
        return 75, "Good"
    else:
        return 100, "Excellent"


class PasswordSecurity:
    """Class-based wrapper for password security operations (for test compatibility)."""

    @staticmethod
    def hash_password(password: str) -> str:
        """Hash a password securely."""
        return hash_password(password)

    @staticmethod
    def verify_password(password: str, hashed: str) -> bool:
        """Verify a password against its hash."""
        return check_password(hashed, password)

    @staticmethod
    def validate_password_strength(password: str) -> tuple[bool, List[str]]:
        """Validate password strength."""
        return validate_password_strength(password)

    @staticmethod
    def generate_secure_password(length: int = 16) -> str:
        """Generate a secure random password."""
        return generate_secure_password(length)

    @staticmethod
    def calculate_password_entropy(password: str) -> float:
        """Calculate password entropy."""
        return calculate_password_entropy(password)

    @staticmethod
    def check_password_history(new_password: str, password_history: List[str]) -> bool:
        """Check if password was recently used."""
        return check_password_history(new_password, password_history)
