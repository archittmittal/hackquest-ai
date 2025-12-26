import httpx
import os
from typing import List, Dict

class GitHubClient:
    def __init__(self):
        self.base_url = "https://api.github.com"
        # It's better to use an empty string as fallback to prevent 'None' errors
        self.token = os.getenv('GITHUB_TOKEN', '')
        self.headers = {"Authorization": f"token {self.token}"} if self.token else {}

    async def get_user_summary(self, username: str) -> str:
        """
        Fetches repos and returns a single string summary 
        perfect for an LLM to digest.
        """
        repos = await self.get_user_data(username)
        
        if not repos or "message" in str(repos):
            return "No public GitHub data available for this user."

        languages = set()
        repo_details = []

        for repo in repos:
            if repo["lang"]:
                languages.add(repo["lang"])
            
            desc = repo["desc"] if repo["desc"] else "No description"
            repo_details.append(f"- {repo['name']}: {desc} (Primary Language: {repo['lang']})")

        # Format the final string for the Agent
        summary = f"TECHNICAL PROFILE FOR {username}:\n"
        summary += f"Core Languages: {', '.join(languages)}\n"
        summary += "Recent Projects:\n" + "\n".join(repo_details)
        
        return summary

    async def get_user_data(self, username: str) -> List[Dict]:
        """Fetches raw repository data."""
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(
                    f"{self.base_url}/users/{username}/repos?sort=updated&per_page=10", 
                    headers=self.headers,
                    timeout=10.0
                )
                
                if response.status_code != 200:
                    print(f"⚠️ GitHub API Error: {response.status_code}")
                    return []
                
                repos = response.json()
                
                profile_data = []
                for repo in repos:
                    profile_data.append({
                        "name": repo.get("name"),
                        "desc": repo.get("description"),
                        "lang": repo.get("language")
                    })
                return profile_data
            except Exception as e:
                print(f"❌ Network Error fetching GitHub: {e}")
                return []