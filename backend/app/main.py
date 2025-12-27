"""FastAPI application entry point"""
import logging
from datetime import datetime
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from contextlib import asynccontextmanager

from app.core.config import settings
from app.core.db import init_db
from app.api import auth_db, generate, matching, password_reset

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifecycle management"""
    # Startup
    logger.info("[START] Starting HackQuest AI Backend...")
    
    try:
        # Initialize SQLite database
        init_db()
        logger.info("[OK] SQLite database initialized")
    except Exception as e:
        logger.error(f"[ERROR] Startup error: {e}")
        raise
    
    yield
    
    # Shutdown
    logger.info("[SHUTDOWN] Shutting down HackQuest AI Backend...")
    logger.info("[OK] Shutdown complete")


# Create FastAPI app with lifespan
app = FastAPI(
    title="HackQuest AI",
    description="AI-Powered Hackathon Matching & Code Generation Platform",
    version="1.0.0",
    lifespan=lifespan
)

# Middleware
app.add_middleware(GZipMiddleware, minimum_size=1000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_db.router)
app.include_router(generate.router)
app.include_router(matching.router)
app.include_router(password_reset.router)


@app.get("/")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "HackQuest AI Backend",
        "version": "1.0.0",
        "environment": settings.environment
    }


@app.get("/api/health")
async def api_health():
    """Detailed health check"""
    return {
        "status": "operational",
        "database": "connected",
        "timestamp": datetime.utcnow().isoformat()
    }


if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        log_level="info"
    )
