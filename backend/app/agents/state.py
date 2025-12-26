 
from typing import Annotated, List, TypedDict, Optional
from langchain_core.messages import BaseMessage
import operator

class AgentState(TypedDict):
    # 'operator.add' allows the agent to append messages to history
    messages: Annotated[List[BaseMessage], operator.add]
    
    # User Profile Data
    user_id: str
    skills: List[str]
    github_summary: str
    
    # Hackathon Data
    candidate_matches: List[dict] # Top 5 from Pinecone
    selected_hackathon: Optional[dict]
    
    # Analysis results
    win_probability: float
    judge_critique: str
    
    # Output
    boilerplate_code: dict # { "main.py": "code...", "README.md": "..." }