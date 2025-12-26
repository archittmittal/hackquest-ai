import asyncio
import json
from app.agents.graph import app_agent

async def test_run():
    # 1. Simulated input from a user login
    initial_state = {
        "user_id": "test_user_01",
        "skills": ["FastAPI", "React", "Tailwind", "Python"],
        "github_summary": "Built a real-time chat app and a crypto tracker.",
        "messages": []
    }
    
    print("\n" + "="*50)
    print("🚀 STARTING HACKQUEST AGENTIC FLOW")
    print("="*50 + "\n")

    # This dictionary will store the combined output of ALL nodes
    accumulated_state = initial_state.copy()

    # 2. Execute the Graph and Stream updates
    async for output in app_agent.astream(initial_state, stream_mode="updates"):
        for node_name, node_output in output.items():
            print(f"✅ FINISHED NODE: [{node_name}]")
            
            # CRITICAL FIX: Merge the new node data into our accumulated tracker
            accumulated_state.update(node_output)
            
            # UI Feedback per node
            if "candidate_matches" in node_output:
                print(f"    🔍 Found {len(node_output['candidate_matches'])} hackathon matches.")
            if "win_probability" in node_output:
                print(f"    📈 Win Probability: {node_output['win_probability']}%")
            if "judge_critique" in node_output:
                print(f"    ⚖️  Judge Critique length: {len(node_output['judge_critique'])} characters.")
            if "boilerplate_code" in node_output:
                print(f"    💻 Boilerplate code generated.")

    # 3. Final Summary Output (Now using the accumulated_state)
    print("\n" + "="*50)
    print("🏁 AGENT RUN COMPLETE")
    print("="*50)
    
    # Check the accumulated results
    if "selected_hackathon" in accumulated_state:
        match = accumulated_state['selected_hackathon']
        print(f"\n🎯 TOP MATCH: {match.get('title')}")
        print(f"📈 WIN PROBABILITY: {accumulated_state.get('win_probability', 'N/A')}%")
        
        # Safely handle the critique and boilerplate
        critique = accumulated_state.get('judge_critique', 'No critique available.')
        print(f"📝 CRITIQUE SNIPPET: {critique[:150]}...")
        
        code_data = accumulated_state.get('boilerplate_code', {})
        code_content = code_data.get('content', '') if isinstance(code_data, dict) else ''
        print(f"💻 CODE SIZE: {len(code_content)} characters")
    else:
        print("\n⚠️ Agent finished but no specific hackathon was matched in the state.")

if __name__ == "__main__":
    try:
        asyncio.run(test_run())
    except Exception as e:
        print(f"\n❌ CRITICAL ERROR DURING RUN: {e}")