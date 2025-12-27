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
    MONGODB_URL: str = "mongodb://localhost:27017"
    DATABASE_NAME: str = "hackquest"
    
    # --- JWT Auth ---
    secret_key: str = "change-this-in-production"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRATION: int = 86400  # 24 hours
    
    # --- CORS ---
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://0.0.0.0:5173",
    ]
    
    # --- Pydantic Config ---
    model_config = SettingsConfigDict(extra="ignore")

settings = Settings()
