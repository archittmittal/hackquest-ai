from langgraph.graph import StateGraph, END
from app.agents.state import AgentState
from app.agents.nodes_data import analyze_profile_node
from app.agents.nodes_match import match_hackathons_node
from app.agents.nodes_judge import judge_simulation_node
from app.agents.nodes_gen import generate_boilerplate_node

# Initialize the Graph
workflow = StateGraph(AgentState)

# Add our Nodes (the workers)
workflow.add_node("analyze_profile", analyze_profile_node)
workflow.add_node("match_hackathons", match_hackathons_node)
workflow.add_node("judge_simulation", judge_simulation_node)
workflow.add_node("generate_boilerplate", generate_boilerplate_node)

# Define the Flow (the edges)
workflow.set_entry_point("analyze_profile")
workflow.add_edge("analyze_profile", "match_hackathons")
workflow.add_edge("match_hackathons", "judge_simulation")
workflow.add_edge("judge_simulation", "generate_boilerplate")
workflow.add_edge("generate_boilerplate", END)

# Compile the Graph
app_agent = workflow.compile()
