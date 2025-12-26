"""Authentication API endpoints - In-memory for testing"""
import logging
from datetime import datetime, timedelta
from typing import Optional, Dict
import jwt
from fastapi import APIRouter, HTTPException, status
from passlib.context import CryptContext
from app.models.schemas import (
    RegisterRequest, LoginRequest, TokenResponse, UserResponse
)
from app.core.config import settings
from bson.objectid import ObjectId

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/auth", tags=["auth"])

# In-memory user store (for testing - replace with database)
users_db: Dict[str, Dict] = {}

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    """Hash password using bcrypt"""
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify password against hash"""
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(user_id: str, expires_delta: Optional[timedelta] = None) -> str:
    """Create JWT access token"""
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(hours=24)
    
    payload = {
        "sub": user_id,
        "exp": expire,
        "iat": datetime.utcnow(),
    }
    
    token = jwt.encode(payload, settings.jwt_secret, algorithm="HS256")
    return token


def verify_token(token: str) -> str:
    """Verify JWT token and return user_id"""
    try:
        payload = jwt.decode(token, settings.jwt_secret, algorithms=["HS256"])
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")
        return user_id
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")


@router.post("/register", response_model=TokenResponse)
async def register(req: RegisterRequest):
    """Register new user"""
    try:
        # Check if user exists
        for user in users_db.values():
            if user["email"] == req.email or user["username"] == req.username:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Email or username already registered"
                )
        
        # Create new user
        user_id = str(ObjectId())
        user_doc = {
            "id": user_id,
            "email": req.email,
            "username": req.username,
            "password_hash": hash_password(req.password),
            "full_name": req.full_name or req.username,
            "avatar_url": None,
            "github_username": None,
            "skills": [],
            "bio": "",
            "created_at": datetime.utcnow().isoformat(),
            "is_active": True,
        }
        
        users_db[user_id] = user_doc
        
        # Create token
        token = create_access_token(user_id)
        
        logger.info(f"✅ User registered: {req.email}")
        return TokenResponse(
            access_token=token,
            token_type="bearer",
            user={
                "id": user_id,
                "email": req.email,
                "username": req.username,
                "full_name": user_doc["full_name"],
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Registration error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Registration failed"
        )


@router.post("/login", response_model=TokenResponse)
async def login(req: LoginRequest):
    """Login user"""
    try:
        # Find user by email
        user = None
        for u in users_db.values():
            if u["email"] == req.email:
                user = u
                break
        
        if not user or not verify_password(req.password, user.get("password_hash", "")):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )
        
        if not user.get("is_active", True):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User account is disabled"
            )
        
        # Create token
        token = create_access_token(user["id"])
        
        logger.info(f"✅ User logged in: {req.email}")
        return TokenResponse(
            access_token=token,
            token_type="bearer",
            user={
                "id": user["id"],
                "email": user["email"],
                "username": user["username"],
                "full_name": user.get("full_name", user["username"]),
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Login error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Login failed"
        )


@router.post("/oauth/github", response_model=TokenResponse)
async def github_oauth(code: str):
    """GitHub OAuth login"""
    try:
        # Mock GitHub user data
        github_user = {
            "login": "github_user",
            "email": f"github_user@github.com",
            "avatar_url": "",
            "name": "GitHub User"
        }
        
        # Find or create user
        user = None
        for u in users_db.values():
            if u.get("github_username") == github_user["login"]:
                user = u
                break
        
        if not user:
            user_id = str(ObjectId())
            user_doc = {
                "id": user_id,
                "email": github_user["email"],
                "username": github_user["login"],
                "password_hash": None,
                "full_name": github_user["name"],
                "avatar_url": github_user["avatar_url"],
                "github_username": github_user["login"],
                "skills": [],
                "bio": "",
                "created_at": datetime.utcnow().isoformat(),
                "is_active": True,
            }
            users_db[user_id] = user_doc
            user = user_doc
        
        token = create_access_token(user["id"])
        
        logger.info(f"✅ User logged in via GitHub: {github_user['login']}")
        return TokenResponse(
            access_token=token,
            token_type="bearer",
            user={
                "id": user["id"],
                "email": github_user["email"],
                "username": github_user["login"],
                "full_name": github_user["name"],
            }
        )
        
    except Exception as e:
        logger.error(f"❌ GitHub OAuth error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="GitHub authentication failed"
        )


@router.post("/oauth/google", response_model=TokenResponse)
async def google_oauth(id_token: str):
    """Google OAuth login"""
    try:
        # Mock Google user data
        google_user = {
            "email": "google_user@google.com",
            "name": "Google User",
            "picture": ""
        }
        
        # Find or create user
        user = None
        for u in users_db.values():
            if u["email"] == google_user["email"]:
                user = u
                break
        
        if not user:
            user_id = str(ObjectId())
            user_doc = {
                "id": user_id,
                "email": google_user["email"],
                "username": google_user["email"].split("@")[0],
                "password_hash": None,
                "full_name": google_user["name"],
                "avatar_url": google_user.get("picture", ""),
                "github_username": None,
                "skills": [],
                "bio": "",
                "created_at": datetime.utcnow().isoformat(),
                "is_active": True,
            }
            users_db[user_id] = user_doc
            user = user_doc
        
        token = create_access_token(user["id"])
        
        logger.info(f"✅ User logged in via Google: {google_user['email']}")
        return TokenResponse(
            access_token=token,
            token_type="bearer",
            user={
                "id": user["id"],
                "email": google_user["email"],
                "username": google_user["email"].split("@")[0],
                "full_name": google_user["name"],
            }
        )
        
    except Exception as e:
        logger.error(f"❌ Google OAuth error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Google authentication failed"
        )


@router.get("/me", response_model=UserResponse)
async def get_me(token: str):
    """Get current user info"""
    try:
        user_id = verify_token(token)
        user = users_db.get(user_id)
        
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        return UserResponse(
            id=user["id"],
            email=user["email"],
            username=user["username"],
            full_name=user.get("full_name"),
            avatar_url=user.get("avatar_url"),
            skills=user.get("skills", []),
            bio=user.get("bio", ""),
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Get user error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve user"
        )
