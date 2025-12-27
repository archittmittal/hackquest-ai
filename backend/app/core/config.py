from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional, List
import os

class Settings(BaseSettings):
    # --- Project Metadata ---
    PROJECT_NAME: str = "HackQuest AI"
    DEBUG: bool = os.getenv("DEBUG", "False").lower() == "true"
    VERSION: str = "1.0.0"
    environment: str = os.getenv("ENVIRONMENT", "development")
    port: int = int(os.getenv("PORT", "8000"))
    
    # --- Databases ---
    MONGODB_URL: str = "mongodb://localhost:27017"
    DATABASE_NAME: str = "hackquest"
    
    # --- JWT Auth ---
    secret_key: str = os.getenv("SECRET_KEY", "change-this-in-production")
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRATION: int = int(os.getenv("JWT_EXPIRATION", "86400"))  # 24 hours
    
    # --- CORS ---
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
    ]
    CORS_ORIGINS_PROD: List[str] = []  # Set via environment: CORS_ORIGINS_PROD="https://app.com,https://www.app.com"
    CORS_ALLOW_CREDENTIALS: bool = True
    
    # --- Rate Limiting ---
    # Default: 100 requests per minute per IP
    RATE_LIMIT_DEFAULT: str = os.getenv("RATE_LIMIT_DEFAULT", "100/minute")
    # Storage for rate limit state (memory, redis, etc.)
    RATE_LIMIT_STORAGE: str = os.getenv("RATE_LIMIT_STORAGE", "memory://")
    # Strategy: fixed-window or moving-window
    RATE_LIMIT_STRATEGY: str = os.getenv("RATE_LIMIT_STRATEGY", "fixed-window")
    
    # Per-endpoint rate limits (can be customized)
    RATE_LIMIT_AUTH: str = "10/minute"  # Stricter for auth endpoints
    RATE_LIMIT_API: str = "100/minute"  # Standard for API endpoints
    RATE_LIMIT_UPLOAD: str = "5/minute"  # Stricter for upload endpoints
    
    # --- LLM & AI ---
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "test-key-replace-in-production")
    PINECONE_API_KEY: str = os.getenv("PINECONE_API_KEY", "test-key-replace-in-production")
    PINECONE_INDEX: str = "hackathons"
    
    # --- Security ---
    # Enforce HTTPS in production
    ENFORCE_HTTPS: bool = os.getenv("ENFORCE_HTTPS", "true").lower() == "true" if environment == "production" else False
    # Enable authentication on all protected routes
    REQUIRE_AUTH: bool = os.getenv("REQUIRE_AUTH", "true").lower() == "true"
    
    # --- Pydantic Config ---
    model_config = SettingsConfigDict(extra="ignore")

settings = Settings()
