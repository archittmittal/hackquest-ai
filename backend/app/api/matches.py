"""Hackathon matching API endpoints"""
import logging
from typing import Optional, List
from fastapi import APIRouter, HTTPException, Query
from app.models.schemas import (
    MatchRequest, FindMatchesResponse, HackathonMatch, HackathonListResponse
)
from app.core.database import Collections
from app.core.cache import get_cache, set_cache, publish_message
from datetime import datetime
from bson.objectid import ObjectId

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/matches", tags=["matches"])


@router.post("/find", response_model=FindMatchesResponse)
async def find_matches(req: MatchRequest):
    """Find hackathon matches for user"""
    try:
        # Get user from database
        user = await Collections.users().find_one({"_id": ObjectId(req.user_id)})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Get user's skills
        user_skills = set(user.get("skills", []))
        
        # Check cache first
        cache_key = f"matches:{req.user_id}"
        cached = await get_cache(cache_key)
        if cached:
            logger.info(f"Cache hit for matches: {req.user_id}")
            return FindMatchesResponse(
                success=True,
                data=cached,
                total_matches=len(cached),
                message="Matches retrieved from cache"
            )
        
        # Get active hackathons
        hackathons = await Collections.hackathons().find({
            "end_date": {"$gte": datetime.utcnow()}
        }).limit(req.limit).to_list(req.limit)
        
        if not hackathons:
            return FindMatchesResponse(
                success=True,
                data=[],
                total_matches=0,
                message="No active hackathons found"
            )
        
        matches = []
        for hackathon in hackathons:
            # Calculate skill match percentage
            required = set(hackathon.get("required_skills", []))
            matched = user_skills.intersection(required)
            skills_match = len(matched) / len(required) if required else 0.5
            
            # Calculate win probability (simplified)
            win_probability = min(skills_match * 1.2, 1.0)  # Bonus for perfect match
            if user.get("hackathons_participated", 0) > 0:
                win_probability *= user.get("win_rate", 0.3) + 0.3
            
            match = HackathonMatch(
                id=str(hackathon["_id"]),
                title=hackathon["title"],
                description=hackathon["description"],
                platform=hackathon["platform"],
                difficulty=hackathon["difficulty"],
                skills_match=skills_match,
                win_probability=min(win_probability, 1.0),
                prize_pool=hackathon.get("prize_pool", 0),
                matched_skills=list(matched),
                missing_skills=list(required - matched),
                start_date=hackathon["start_date"],
                end_date=hackathon["end_date"],
                registration_link=hackathon.get("registration_link", ""),
                theme=hackathon.get("theme", "")
            )
            matches.append(match)
        
        # Sort by win probability
        matches.sort(key=lambda x: x.win_probability, reverse=True)
        
        # Cache results
        await set_cache(cache_key, [m.dict() for m in matches])
        
        # Publish event
        await publish_message("matches:found", {
            "user_id": req.user_id,
            "count": len(matches),
            "timestamp": datetime.utcnow().isoformat()
        })
        
        return FindMatchesResponse(
            success=True,
            data=matches,
            total_matches=len(matches),
            message=f"Found {len(matches)} matching hackathons"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Find matches error: {e}")
        raise HTTPException(status_code=500, detail="Failed to find matches")


@router.get("/hackathons", response_model=HackathonListResponse)
async def get_all_hackathons(
    platform: Optional[str] = Query(None),
    difficulty: Optional[str] = Query(None),
    skip: int = Query(0),
    limit: int = Query(20)
):
    """Get all active hackathons with filters"""
    try:
        query = {"end_date": {"$gte": datetime.utcnow()}}
        
        if platform:
            query["platform"] = platform
        if difficulty:
            query["difficulty"] = difficulty
        
        total = await Collections.hackathons().count_documents(query)
        
        hackathons = await Collections.hackathons().find(query)\
            .skip(skip)\
            .limit(limit)\
            .to_list(limit)
        
        matches = [
            HackathonMatch(
                id=str(h["_id"]),
                title=h["title"],
                description=h["description"],
                platform=h["platform"],
                difficulty=h["difficulty"],
                skills_match=0.5,  # Default for list view
                win_probability=0.5,
                prize_pool=h.get("prize_pool", 0),
                matched_skills=[],
                missing_skills=h.get("required_skills", []),
                start_date=h["start_date"],
                end_date=h["end_date"],
                registration_link=h.get("registration_link", ""),
                theme=h.get("theme", "")
            )
            for h in hackathons
        ]
        
        return HackathonListResponse(
            success=True,
            data=matches,
            total=total,
            message=f"Retrieved {len(matches)} hackathons"
        )
        
    except Exception as e:
        logger.error(f"Get hackathons error: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve hackathons")


@router.get("/{hackathon_id}", response_model=HackathonListResponse)
async def get_hackathon_details(hackathon_id: str):
    """Get detailed hackathon information"""
    try:
        hackathon = await Collections.hackathons().find_one({"_id": ObjectId(hackathon_id)})
        
        if not hackathon:
            raise HTTPException(status_code=404, detail="Hackathon not found")
        
        match = HackathonMatch(
            id=str(hackathon["_id"]),
            title=hackathon["title"],
            description=hackathon["description"],
            platform=hackathon["platform"],
            difficulty=hackathon["difficulty"],
            skills_match=0.5,
            win_probability=0.5,
            prize_pool=hackathon.get("prize_pool", 0),
            matched_skills=[],
            missing_skills=hackathon.get("required_skills", []),
            start_date=hackathon["start_date"],
            end_date=hackathon["end_date"],
            registration_link=hackathon.get("registration_link", ""),
            theme=hackathon.get("theme", "")
        )
        
        return HackathonListResponse(
            success=True,
            data=[match],
            total=1,
            message="Hackathon details retrieved"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Get hackathon error: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve hackathon")

