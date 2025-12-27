"""Research node for gathering hackathon data."""
import logging

logger = logging.getLogger(__name__)


async def research_hackathons_node(state):
    """Research and fetch hackathon data from database."""
    print("---RESEARCHING HACKATHONS---")
    
    try:
        # This would fetch from database in production
        # For now, we pass through the candidate matches from matching node
        candidate_matches = state.get("candidate_matches", [])
        
        if not candidate_matches:
            logger.warning("No candidate matches found during research phase")
        
        logger.info(f"Researched {len(candidate_matches)} hackathons")
        
        return {
            "candidate_matches": candidate_matches
        }
    
    except Exception as e:
        logger.error(f"Error during hackathon research: {e}")
        return {"candidate_matches": []}
 
