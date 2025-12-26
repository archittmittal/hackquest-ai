from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

class Settings(BaseSettings):
    # --- Project Metadata ---
    PROJECT_NAME: str = "HackQuest AI"
    
    # --- Databases ---
    MONGODB_URL: str = "mongodb://localhost:27017"
    DATABASE_NAME: str = "hackquest"
    
    # --- Pinecone ---
    PINECONE_API_KEY: str
    PINECONE_INDEX: str = "hackquest-index"
    
    # --- AI Keys ---
    # Add your Groq Key to your .env file
    GROQ_API_KEY: str 
    GITHUB_TOKEN: Optional[str] = None
    
    # --- Pydantic Config ---
    # This tells Pydantic to read from the .env file in the current directory
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

settings = Settings()