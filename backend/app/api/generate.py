from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from app.agents.graph import app_agent
from app.utils.github_client import GitHubClient  # New Import

router = APIRouter()

# Instantiate the GitHub Client
github_client = GitHubClient()

# Simple request model for validation
class UserData(BaseModel):
    github_id: str
    skills: List[str]
    bio: Optional[str] = ""

@router.post("/run-agent")
async def run_hackathon_agent(user_data: UserData):
    try:
        print(f"🚀 API received request for user: {user_data.github_id}")

        # 1. Fetch REAL technical data from GitHub
        # This turns a username into a detailed summary of their repos
        github_summary = await github_client.get_user_summary(user_data.github_id)
        
        # 2. Prepare the initial state
        # We combine the manual skills with the scraped GitHub history
        initial_state = {
            "user_id": user_data.github_id,
            "skills": user_data.skills,
            "github_summary": github_summary, 
            "messages": []
        }
        
        # 3. Execute the Graph
        # The agent now matches the user based on real repo data
        final_state = await app_agent.ainvoke(initial_state)
        
        # 4. Structure the final response
        return {
            "status": "success",
            "data": {
                "recommendation": final_state.get("selected_hackathon"),
                "win_probability": final_state.get("win_probability", 0),
                "critique": final_state.get("judge_critique"),
                "boilerplate": final_state.get("boilerplate_code", {}).get("content", "")
            }
        }
        
    except Exception as e:
        print(f"❌ API Error: {str(e)}")
        # Log more details for debugging during the hackathon
        raise HTTPException(
            status_code=500, 
            detail=f"Agent execution failed: {str(e)}"
        )