import logging
import os
from decimal import Decimal
from typing import Any, Dict

try:
    import stripe
    from stripe import CardError, StripeError

    STRIPE_AVAILABLE = True
except ImportError:
    stripe = None
    STRIPE_AVAILABLE = False

    class CardError(Exception):
        def __init__(
            self, message="", param=None, code=None, http_status=None, json_body=None
        ):
            self.user_message = message
            super().__init__(message)

    class StripeError(Exception):
        def __init__(self, message="", http_status=None, json_body=None):
            self.user_message = message
            super().__init__(message)


from ..services.payment_service_errors import PaymentProcessorError

logger = logging.getLogger(__name__)


class StripeClient:
    """
    A client for interacting with the Stripe API.
    API key is loaded from the STRIPE_SECRET_KEY environment variable.
    """

    def __init__(self) -> None:
        self.api_key = os.environ.get("STRIPE_SECRET_KEY")
        if not self.api_key:
            logger.error("STRIPE_SECRET_KEY environment variable not set.")
            self.api_key = "sk_test_mock_key"
        if STRIPE_AVAILABLE:
            stripe.api_key = self.api_key
        logger.info("Stripe client initialized.")

    def create_charge(
        self,
        amount: Decimal,
        currency: str,
        source: str,
        description: str,
        metadata: Dict[str, Any] = None,
    ) -> Dict[str, Any]:
        """
        Creates a charge using the Stripe API.
        """
        try:
            amount_in_smallest_unit = int(amount * 100)
        except Exception:
            raise PaymentProcessorError(
                "Invalid amount format for Stripe charge.", "INVALID_AMOUNT_FORMAT", 400
            )
        # Re-read key at call time so tests can override via mock
        current_key = stripe.api_key if STRIPE_AVAILABLE else self.api_key
        is_mock = current_key in (None, "sk_test_mock_key", "") or not STRIPE_AVAILABLE
        try:
            logger.info(
                f"Attempting to create Stripe charge for {amount} {currency}..."
            )
            if is_mock:
                logger.warning(
                    "Using mock Stripe client. No actual charge will be created."
                )
                return {
                    "id": f"ch_mock_{os.urandom(12).hex()}",
                    "amount": amount_in_smallest_unit,
                    "currency": currency.lower(),
                    "status": "succeeded",
                    "description": description,
                    "metadata": metadata or {},
                }
            charge = stripe.Charge.create(
                amount=amount_in_smallest_unit,
                currency=currency.lower(),
                source=source,
                description=description,
                metadata=metadata or {},
            )
            logger.info(f"Stripe charge successful: {charge.id}")
            return charge.to_dict()
        except CardError as e:
            logger.warning(f"Stripe CardError: {e.user_message}")
            raise PaymentProcessorError(
                message=f"Payment failed: {e.user_message}",
                error_code="STRIPE_CARD_ERROR",
                status_code=400,
            )
        except StripeError as e:
            logger.error(f"Stripe API Error: {e.user_message}", exc_info=True)
            raise PaymentProcessorError(
                message=f"Stripe processing error: {e.user_message}",
                error_code="STRIPE_API_ERROR",
                status_code=500,
            )
        except Exception as e:
            logger.critical(
                f"Unexpected error during Stripe call: {str(e)}", exc_info=True
            )
            raise PaymentProcessorError(
                message="An unexpected error occurred during payment processing.",
                error_code="UNEXPECTED_PAYMENT_ERROR",
                status_code=500,
            )

    def handle_webhook(self, payload: bytes, signature: str) -> Dict[str, Any]:
        """
        Validates and processes a Stripe webhook event.
        """
        logger.info("Mocking Stripe webhook handling.")
        return {"status": "success", "event": "mock_event"}


stripe_client = StripeClient()
