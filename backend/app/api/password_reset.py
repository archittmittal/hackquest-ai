"""Password reset and email verification endpoints."""
from fastapi import APIRouter, HTTPException, status
from datetime import datetime, timedelta
import secrets
import json

from app.models.schemas import PasswordResetRequest, PasswordResetConfirm

router = APIRouter(prefix="/api/auth", tags=["auth"])

# In-memory token storage (use Redis or database in production)
reset_tokens = {}
verification_tokens = {}


@router.post("/password-reset/request")
async def request_password_reset(request: PasswordResetRequest):
    """Request password reset token via email."""
    if not request.email or "@" not in request.email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid email address"
        )
    
    # Generate reset token
    token = secrets.token_urlsafe(32)
    reset_tokens[token] = {
        "email": request.email,
        "expires_at": (datetime.utcnow() + timedelta(hours=1)).isoformat()
    }
    
    # In production, send email with reset link
    reset_link = f"http://localhost:5173/reset-password?token={token}"
    
    return {
        "success": True,
        "message": "Password reset email sent",
        "reset_link": reset_link  # Only for development/testing
    }


@router.post("/password-reset/confirm")
async def confirm_password_reset(request: PasswordResetConfirm):
    """Confirm password reset with token."""
    if request.token not in reset_tokens:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset token"
        )
    
    token_data = reset_tokens[request.token]
    
    # Check expiration
    if datetime.fromisoformat(token_data["expires_at"]) < datetime.utcnow():
        del reset_tokens[request.token]
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Reset token has expired"
        )
    
    # In production, update user password in database
    email = token_data["email"]
    
    # Clean up token
    del reset_tokens[request.token]
    
    return {
        "success": True,
        "message": f"Password reset successfully for {email}",
        "email": email
    }


@router.post("/email/verify")
async def send_verification_email(email: str):
    """Send email verification token."""
    if not email or "@" not in email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid email address"
        )
    
    # Generate verification token
    token = secrets.token_urlsafe(32)
    verification_tokens[token] = {
        "email": email,
        "expires_at": (datetime.utcnow() + timedelta(hours=24)).isoformat(),
        "verified": False
    }
    
    # In production, send email with verification link
    verification_link = f"http://localhost:5173/verify-email?token={token}"
    
    return {
        "success": True,
        "message": "Verification email sent",
        "verification_link": verification_link  # Only for development
    }


@router.post("/email/verify/confirm")
async def confirm_email_verification(token: str):
    """Confirm email verification with token."""
    if token not in verification_tokens:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired verification token"
        )
    
    token_data = verification_tokens[token]
    
    # Check expiration
    if datetime.fromisoformat(token_data["expires_at"]) < datetime.utcnow():
        del verification_tokens[token]
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Verification token has expired"
        )
    
    # Mark as verified
    token_data["verified"] = True
    email = token_data["email"]
    
    # In production, update user verified status in database
    
    return {
        "success": True,
        "message": f"Email verified successfully for {email}",
        "email": email
    }
