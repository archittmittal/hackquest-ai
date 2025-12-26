"""Authentication endpoints with SQLite persistence."""
from fastapi import APIRouter, HTTPException, Depends, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from datetime import datetime, timedelta
from typing import Optional
import jwt
import bcrypt
import uuid
import secrets
import json

from app.core.config import settings
from app.core.db import get_db
from app.models.database import User, RefreshToken
from app.models.schemas import (
    RegisterRequest,
    LoginRequest,
    TokenResponse,
    UserResponse,
    OAuthRequest
)

router = APIRouter(prefix="/api/auth", tags=["auth"])


def hash_password(password: str) -> str:
    """Hash a password using bcrypt."""
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')


def verify_password(plain: str, hashed: str) -> bool:
    """Verify a password against hash."""
    return bcrypt.checkpw(plain.encode('utf-8'), hashed.encode('utf-8'))


def parse_skills(skills_str: str) -> list:
    """Parse skills from JSON string to list."""
    if not skills_str:
        return []
    try:
        return json.loads(skills_str)
    except (json.JSONDecodeError, TypeError):
        return []


def build_user_response(user: User) -> UserResponse:
    """Build UserResponse from User model."""
    return UserResponse(
        id=user.id,
        email=user.email,
        username=user.username,
        full_name=user.full_name,
        avatar_url=user.avatar_url,
        skills=parse_skills(user.skills),
        bio=user.bio
    )


def create_access_token(user_id: str, expires_delta: Optional[timedelta] = None) -> str:
    """Create JWT access token."""
    if expires_delta is None:
        expires_delta = timedelta(hours=24)
    
    expire = datetime.utcnow() + expires_delta
    payload = {
        "sub": user_id,
        "exp": expire,
        "iat": datetime.utcnow(),
        "type": "access"
    }
    
    token = jwt.encode(
        payload,
        settings.secret_key,
        algorithm="HS256"
    )
    return token


def create_refresh_token(user_id: str, expires_delta: Optional[timedelta] = None) -> str:
    """Create JWT refresh token."""
    if expires_delta is None:
        expires_delta = timedelta(days=7)
    
    expire = datetime.utcnow() + expires_delta
    payload = {
        "sub": user_id,
        "exp": expire,
        "iat": datetime.utcnow(),
        "type": "refresh"
    }
    
    token = jwt.encode(
        payload,
        settings.secret_key,
        algorithm="HS256"
    )
    return token


def verify_token(token: str) -> dict:
    """Verify and decode JWT token."""
    try:
        payload = jwt.decode(
            token,
            settings.secret_key,
            algorithms=["HS256"]
        )
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired"
        )
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )


@router.post("/register", response_model=TokenResponse)
async def register(req: RegisterRequest, db: Session = Depends(get_db)):
    """Register a new user."""
    # Check if user already exists
    existing = db.query(User).filter(
        (User.email == req.email) | (User.username == req.username)
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email or username already registered"
        )
    
    # Create new user
    user_id = str(uuid.uuid4())
    user = User(
        id=user_id,
        email=req.email,
        username=req.username,
        password_hash=hash_password(req.password),
        full_name=req.full_name,
        avatar_url=req.avatar_url
    )
    
    try:
        db.add(user)
        db.commit()
        db.refresh(user)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User creation failed - email or username may be taken"
        )
    
    # Create tokens
    access_token = create_access_token(user_id)
    refresh_token = create_refresh_token(user_id)
    
    # Store refresh token in database
    db_refresh = RefreshToken(
        user_id=user_id,
        token=refresh_token,
        expires_at=datetime.utcnow() + timedelta(days=7)
    )
    db.add(db_refresh)
    db.commit()
    
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        user=build_user_response(user)
    )


@router.post("/login", response_model=TokenResponse)
async def login(req: LoginRequest, db: Session = Depends(get_db)):
    """Login a user."""
    user = db.query(User).filter(User.email == req.email).first()
    
    if not user or not verify_password(req.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is disabled"
        )
    
    # Create tokens
    access_token = create_access_token(user.id)
    refresh_token = create_refresh_token(user.id)
    
    # Store refresh token
    db_refresh = RefreshToken(
        user_id=user.id,
        token=refresh_token,
        expires_at=datetime.utcnow() + timedelta(days=7)
    )
    db.add(db_refresh)
    db.commit()
    
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        user=build_user_response(user)
    )


@router.post("/oauth/github", response_model=TokenResponse)
async def github_oauth(req: OAuthRequest, db: Session = Depends(get_db)):
    """GitHub OAuth callback - create or update user."""
    user = db.query(User).filter(User.email == req.email).first()
    
    if not user:
        user_id = str(uuid.uuid4())
        user = User(
            id=user_id,
            email=req.email,
            username=req.username or req.email.split('@')[0],
            password_hash=hash_password(secrets.token_urlsafe(32)),
            full_name=req.full_name,
            avatar_url=req.avatar_url
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    
    # Create tokens
    access_token = create_access_token(user.id)
    refresh_token = create_refresh_token(user.id)
    
    # Store refresh token
    db_refresh = RefreshToken(
        user_id=user.id,
        token=refresh_token,
        expires_at=datetime.utcnow() + timedelta(days=7)
    )
    db.add(db_refresh)
    db.commit()
    
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        user=build_user_response(user)
    )


@router.post("/oauth/google", response_model=TokenResponse)
async def google_oauth(req: OAuthRequest, db: Session = Depends(get_db)):
    """Google OAuth callback - create or update user."""
    user = db.query(User).filter(User.email == req.email).first()
    
    if not user:
        user_id = str(uuid.uuid4())
        user = User(
            id=user_id,
            email=req.email,
            username=req.username or req.email.split('@')[0],
            password_hash=hash_password(secrets.token_urlsafe(32)),
            full_name=req.full_name,
            avatar_url=req.avatar_url
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    
    # Create tokens
    access_token = create_access_token(user.id)
    refresh_token = create_refresh_token(user.id)
    
    # Store refresh token
    db_refresh = RefreshToken(
        user_id=user.id,
        token=refresh_token,
        expires_at=datetime.utcnow() + timedelta(days=7)
    )
    db.add(db_refresh)
    db.commit()
    
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        user=build_user_response(user)
    )


@router.get("/me", response_model=UserResponse)
async def get_current_user(
    token: str = None,
    db: Session = Depends(get_db)
):
    """Get current user profile from JWT token."""
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No token provided"
        )
    
    payload = verify_token(token)
    user_id = payload.get("sub")
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return build_user_response(user)


@router.post("/refresh")
async def refresh_access_token(refresh_token: str, db: Session = Depends(get_db)):
    """Refresh access token using refresh token."""
    payload = verify_token(refresh_token)
    if payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )
    
    user_id = payload.get("sub")
    user = db.query(User).filter(User.id == user_id).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    new_access_token = create_access_token(user_id)
    return {"access_token": new_access_token, "token_type": "bearer"}
