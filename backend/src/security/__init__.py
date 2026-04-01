"""
Security Module
=======================
Advanced security features for financial applications including fraud detection,
threat prevention, and comprehensive security monitoring.

Imports are lazy to avoid heavy dependency loading at startup.
"""


def __getattr__(name):
    """Lazy-load security components on first access."""
    if name == "AdvancedAuthenticationService":
        from .authentication import AdvancedAuthenticationService

        return AdvancedAuthenticationService
    if name == "EncryptionService":
        from .encryption_service import EncryptionService

        return EncryptionService
    if name == "FraudDetectionEngine":
        from .fraud_detection import FraudDetectionEngine

        return FraudDetectionEngine
    if name == "SecurityMonitoringService":
        from .security_monitoring import SecurityMonitoringService

        return SecurityMonitoringService
    if name == "ThreatPreventionService":
        from .threat_prevention import ThreatPreventionService

        return ThreatPreventionService
    raise AttributeError(f"module 'src.security' has no attribute {name!r}")


__all__ = [
    "FraudDetectionEngine",
    "ThreatPreventionService",
    "SecurityMonitoringService",
    "AdvancedAuthenticationService",
    "EncryptionService",
]
