"""Summarization node for final results."""
import logging
from typing import Dict, Any

logger = logging.getLogger(__name__)


async def summarize_results_node(state: Dict[str, Any]) -> Dict[str, Any]:
    """Summarize and prepare final results for the user."""
    print("---SUMMARIZING RESULTS---")
    
    try:
        summary = {
            "selected_hackathon": state.get("selected_hackathon"),
            "win_probability": state.get("win_probability", 0.0),
            "judge_critique": state.get("judge_critique", ""),
            "boilerplate_code": state.get("boilerplate_code", {"content": ""}),
            "skills_used": state.get("skills", []),
            "github_summary": state.get("github_summary", "")
        }
        
        logger.info(f"Results summarized for hackathon: {summary['selected_hackathon'].get('title') if summary['selected_hackathon'] else 'None'}")
        
        return {
            "summary": summary,
            "messages": state.get("messages", [])
        }
    
    except Exception as e:
        logger.error(f"Error during result summarization: {e}")
        return {
            "summary": {"error": str(e)},
            "messages": state.get("messages", [])
        }
 
