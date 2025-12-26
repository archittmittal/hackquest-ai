from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.agents.graph import app_agent
import json

router = APIRouter()

@router.websocket("/ws/agent")
async def websocket_agent_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        # 1. Receive initial data (github_id, skills)
        data = await websocket.receive_json()
        github_id = data.get("github_id")
        skills = data.get("skills", [])

        initial_state = {
            "user_id": github_id,
            "skills": skills,
            "github_summary": "", # Fetched in the first node
            "messages": []
        }

        # 2. Stream LangGraph updates
        # stream_mode="updates" tells LangGraph to yield after every node
        async for output in app_agent.astream(initial_state, stream_mode="updates"):
            for node_name, node_output in output.items():
                # Send the node name so the frontend knows the current step
                await websocket.send_json({
                    "event": "node_complete",
                    "node": node_name,
                    "data": node_output
                })

        # 3. Send final completion signal
        await websocket.send_json({"event": "flow_complete"})

    except WebSocketDisconnect:
        print(f"Client disconnected")
    except Exception as e:
        await websocket.send_json({"event": "error", "message": str(e)})