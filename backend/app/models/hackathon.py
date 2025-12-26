from pydantic import BaseModel, Field
from typing import List, Optional

class Hackathon(BaseModel):
    title: str
    platform: str  # e.g., "SIH", "Unstop"
    problem_statement: str
    tags: List[str]
    deadline: str
    reward: Optional[str]
    win_probability: Optional[float] = 0.0
    skills_required: List[str]
