"""
KYC (Know Your Customer) routes
"""

from flask import Blueprint, jsonify, request

kyc_bp = Blueprint("kyc", __name__, url_prefix="/kyc-legacy")


@kyc_bp.route("/verify", methods=["POST"])
def verify_kyc() -> None:
    """Verify KYC information"""
    data = request.get_json()
    return jsonify({"message": "KYC verification initiated", "data": data})


@kyc_bp.route("/status/<int:user_id>", methods=["GET"])
def get_kyc_status(user_id: int) -> "flask.Response":
    """Get KYC status for user"""
    return jsonify({"user_id": user_id, "status": "pending"})
