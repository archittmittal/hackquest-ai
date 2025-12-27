"""Hackathon and matching database models."""
from sqlalchemy import Column, String, DateTime, Boolean, Integer, Float, Text
from app.models.database import Base
from datetime import datetime


class Hackathon(Base):
    """Hackathon model."""
    __tablename__ = "hackathons"

    id = Column(String(36), primary_key=True)
    title = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=True)
    platform = Column(String(50), nullable=False)
    url = Column(String(500), nullable=True)
    difficulty = Column(String(50), default="intermediate")
    required_skills = Column(String(2000), default="[]")  # JSON
    prize_pool = Column(String(255), nullable=True)
    location = Column(String(255), nullable=True)
    team_size = Column(String(100), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class HackathonMatch(Base):
    """User-Hackathon match scores."""
    __tablename__ = "hackathon_matches"

    id = Column(String(36), primary_key=True)
    user_id = Column(String(36), nullable=False, index=True)
    hackathon_id = Column(String(36), nullable=False, index=True)
    match_score = Column(Float, default=0.0)
    skill_match = Column(Float, default=0.0)
    difficulty_match = Column(Float, default=0.0)
    reasoning = Column(Text, nullable=True)
    is_applied = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class UserSkills(Base):
    """User skills."""
    __tablename__ = "user_skills"

    id = Column(String(36), primary_key=True)
    user_id = Column(String(36), nullable=False, index=True)
    skill_name = Column(String(100), nullable=False)
    proficiency = Column(String(50), default="intermediate")
    years_of_experience = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
