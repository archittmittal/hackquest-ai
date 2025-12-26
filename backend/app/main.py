from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from app.api import generate
from app.agents.graph import app_agent
import json

app = FastAPI(title="HackQuest AI")

# --- CORS Settings ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Attach existing REST router
app.include_router(generate.router, prefix="/api", tags=["Agent"])

@app.get("/")
async def health_check():
    return {"status": "Agentic Core Online", "version": "1.0.0"}

# --- Professional WebSocket Logic ---
@app.websocket("/ws/agent")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        # 1. Wait for the initial configuration from the Frontend
        # Expecting: {"github_id": "...", "skills": ["...", "..."]}
        raw_data = await websocket.receive_text()
        config = json.loads(raw_data)
        
        github_id = config.get("github_id")
        skills = config.get("skills", [])

        # 2. Setup initial state for LangGraph
        initial_state = {
            "user_id": github_id,
            "skills": skills,
            "github_summary": "", # Will be populated by the first node
            "messages": []
        }

        print(f"🔌 WebSocket Connected: Starting flow for {github_id}")

        # 3. Stream LangGraph updates in real-time
        # stream_mode="updates" yields data every time a node finishes
        async for output in app_agent.astream(initial_state, stream_mode="updates"):
            for node_name, node_output in output.items():
                # Send a structured packet to the frontend
                await websocket.send_json({
                    "event": "node_complete",
                    "node": node_name,
                    "data": node_output
                })
        
        # 4. Signal that the agent has finished everything
        await websocket.send_json({"event": "flow_complete"})

    except WebSocketDisconnect:
        print(f"🔌 Client disconnected from WebSocket")
    except Exception as e:
        print(f"❌ WebSocket Error: {e}")
        await websocket.send_json({"event": "error", "message": str(e)})
    finally:
        try:
            await websocket.close()
        except:
            pass