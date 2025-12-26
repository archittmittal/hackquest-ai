from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional, List
import os

class Settings(BaseSettings):
    # --- Project Metadata ---
    PROJECT_NAME: str = "HackQuest AI"
    DEBUG: bool = True
    VERSION: str = "1.0.0"
    environment: str = "development"
    port: int = 8000
    
    # --- Databases ---
    MONGODB_URL: str = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
    DATABASE_NAME: str = "hackquest"
    
    # --- Pinecone ---
    PINECONE_API_KEY: str = os.getenv("PINECONE_API_KEY", "")
    PINECONE_INDEX: str = "hackquest-index"
    PINECONE_ENVIRONMENT: str = os.getenv("PINECONE_ENV", "us-east-1")
    
    # --- Redis Cache ---
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379")
    
    # --- AI/ML Keys ---
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
    GROQ_MODEL: str = "llama-3.1-8b-instant"
    HF_API_KEY: str = os.getenv("HF_API_KEY", "")
    HF_MODEL_ID: str = "sentence-transformers/all-MiniLM-L6-v2"
    GITHUB_TOKEN: Optional[str] = os.getenv("GITHUB_TOKEN")
    
    # --- JWT Auth ---
    JWT_SECRET: str = os.getenv("JWT_SECRET", "change-this-in-production")
    secret_key: str = os.getenv("JWT_SECRET", "change-this-in-production")
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRATION: int = 86400  # 24 hours
    
    # --- CORS ---
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://0.0.0.0:5173",
    ]
    
    # --- Scraper Settings ---
    SCRAPER_TIMEOUT: int = 30
    MAX_WORKERS: int = 4
    USER_AGENT: str = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
    
    # --- Pydantic Config ---
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

settings = Settings()