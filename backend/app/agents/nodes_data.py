import httpx
import os

async def analyze_profile_node(state):
    print("---ANALYZING USER PROFILE---")
    
    # In a real scenario, this would use the GitHubClient we wrote.
    # For this test, we are simulating the extraction of skills.
    user_skills = state.get("skills", [])
    github_summary = state.get("github_summary", "No summary provided.")
    
    # Return the updated state
    return {
        "skills": user_skills,
        "github_summary": github_summary
    }