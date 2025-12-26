"""User profile API endpoints"""
import logging
from fastapi import APIRouter, HTTPException
from app.models.schemas import UpdateProfileRequest, UserProfileResponse, UserProfile
from app.core.database import Collections
from bson.objectid import ObjectId
from datetime import datetime
import httpx

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/profile", tags=["profile"])


@router.get("/{user_id}", response_model=UserProfileResponse)
async def get_profile(user_id: str):
    """Get user profile"""
    try:
        user = await Collections.users().find_one({"_id": ObjectId(user_id)})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        profile = UserProfile(
            id=str(user["_id"]),
            email=user["email"],
            username=user["username"],
            full_name=user["full_name"],
            avatar_url=user.get("avatar_url"),
            bio=user.get("bio"),
            skills=user.get("skills", []),
            github_username=user.get("github_username"),
            github_profile_url=user.get("github_profile_url"),
            github_stars=user.get("github_stars", 0),
            github_repos=user.get("github_repos", 0),
            github_followers=user.get("github_followers", 0),
            hackathons_participated=user.get("hackathons_participated", 0),
            hackathons_won=user.get("hackathons_won", 0),
            win_rate=user.get("win_rate", 0.0),
            status=user.get("status", "active"),
            created_at=user["created_at"],
            updated_at=user["updated_at"]
        )
        
        return UserProfileResponse(
            success=True,
            data=profile,
            message="Profile retrieved successfully"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Get profile error: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve profile")


@router.patch("/{user_id}", response_model=UserProfileResponse)
async def update_profile(user_id: str, req: UpdateProfileRequest):
    """Update user profile"""
    try:
        update_data = {}
        
        if req.full_name:
            update_data["full_name"] = req.full_name
        if req.bio is not None:
            update_data["bio"] = req.bio
        if req.skills:
            update_data["skills"] = req.skills
        if req.github_username:
            update_data["github_username"] = req.github_username
        
        update_data["updated_at"] = datetime.utcnow()
        
        result = await Collections.users().update_one(
            {"_id": ObjectId(user_id)},
            {"$set": update_data}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Fetch updated user
        user = await Collections.users().find_one({"_id": ObjectId(user_id)})
        
        profile = UserProfile(
            id=str(user["_id"]),
            email=user["email"],
            username=user["username"],
            full_name=user["full_name"],
            avatar_url=user.get("avatar_url"),
            bio=user.get("bio"),
            skills=user.get("skills", []),
            github_username=user.get("github_username"),
            github_profile_url=user.get("github_profile_url"),
            github_stars=user.get("github_stars", 0),
            github_repos=user.get("github_repos", 0),
            github_followers=user.get("github_followers", 0),
            hackathons_participated=user.get("hackathons_participated", 0),
            hackathons_won=user.get("hackathons_won", 0),
            win_rate=user.get("win_rate", 0.0),
            status=user.get("status", "active"),
            created_at=user["created_at"],
            updated_at=user["updated_at"]
        )
        
        return UserProfileResponse(
            success=True,
            data=profile,
            message="Profile updated successfully"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Update profile error: {e}")
        raise HTTPException(status_code=500, detail="Failed to update profile")


@router.post("/{user_id}/sync-github")
async def sync_github_profile(user_id: str, github_token: str):
    """Sync GitHub profile data"""
    try:
        user = await Collections.users().find_one({"_id": ObjectId(user_id)})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        github_username = user.get("github_username")
        if not github_username:
            raise HTTPException(status_code=400, detail="GitHub username not set")
        
        # Fetch GitHub data
        async with httpx.AsyncClient() as client:
            # Get user data
            user_response = await client.get(
                f"https://api.github.com/users/{github_username}",
                headers={"Authorization": f"Bearer {github_token}"}
            )
            
            if user_response.status_code != 200:
                raise HTTPException(status_code=400, detail="Failed to fetch GitHub data")
            
            gh_user = user_response.json()
            
            # Get repositories
            repos_response = await client.get(
                f"https://api.github.com/users/{github_username}/repos",
                headers={"Authorization": f"Bearer {github_token}"}
            )
            
            repos = repos_response.json() if repos_response.status_code == 200 else []
            total_stars = sum(repo.get("stargazers_count", 0) for repo in repos)
        
        # Update user
        update_data = {
            "github_profile_url": gh_user.get("html_url"),
            "github_stars": total_stars,
            "github_repos": gh_user.get("public_repos", 0),
            "github_followers": gh_user.get("followers", 0),
            "avatar_url": gh_user.get("avatar_url"),
            "bio": gh_user.get("bio") or user.get("bio"),
            "updated_at": datetime.utcnow()
        }
        
        await Collections.users().update_one(
            {"_id": ObjectId(user_id)},
            {"$set": update_data}
        )
        
        logger.info(f"GitHub profile synced: {github_username}")
        
        return {
            "success": True,
            "message": "GitHub profile synced successfully",
            "data": {
                "stars": total_stars,
                "repos": gh_user.get("public_repos", 0),
                "followers": gh_user.get("followers", 0)
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"GitHub sync error: {e}")
        raise HTTPException(status_code=500, detail="Failed to sync GitHub profile")


@router.get("/{user_id}/stats")
async def get_user_stats(user_id: str):
    """Get user performance statistics"""
    try:
        user = await Collections.users().find_one({"_id": ObjectId(user_id)})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Count submissions
        total_submissions = await Collections.submissions().count_documents({"user_id": user_id})
        won_submissions = await Collections.submissions().count_documents({
            "user_id": user_id,
            "status": "winner"
        })
        
        return {
            "success": True,
            "data": {
                "hackathons_participated": user.get("hackathons_participated", 0),
                "hackathons_won": user.get("hackathons_won", 0),
                "win_rate": user.get("win_rate", 0.0),
                "total_submissions": total_submissions,
                "winning_submissions": won_submissions,
                "github_stars": user.get("github_stars", 0),
                "github_followers": user.get("github_followers", 0)
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Get stats error: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve statistics")
