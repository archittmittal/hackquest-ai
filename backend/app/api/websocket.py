"""WebSocket endpoints for real-time updates"""
import logging
import json
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.core.cache import redis_client
from datetime import datetime
from typing import Set

logger = logging.getLogger(__name__)

router = APIRouter()

# Track active WebSocket connections
active_connections: Set[WebSocket] = set()


@router.websocket("/ws/agent/{user_id}")
async def websocket_agent_endpoint(websocket: WebSocket, user_id: str):
    """WebSocket endpoint for real-time agent execution"""
    await websocket.accept()
    active_connections.add(websocket)
    
    try:
        while True:
            # Receive data from client
            data = await websocket.receive_json()
            event_type = data.get("event")
            
            if event_type == "find_matches":
                # Subscribe to Redis channel
                pubsub = redis_client.pubsub()
                await pubsub.subscribe(f"agent:{user_id}:matches")
                
                # Send initial message
                await websocket.send_json({
                    "event": "status",
                    "message": "Finding hackathon matches...",
                    "progress": 0
                })
                
                # Listen for updates
                async for message in pubsub.listen():
                    if message["type"] == "message":
                        await websocket.send_json(json.loads(message["data"]))
            
            elif event_type == "generate_code":
                await websocket.send_json({
                    "event": "status",
                    "message": "Generating boilerplate code...",
                    "progress": 50
                })
                
                # Simulate code generation
                await websocket.send_json({
                    "event": "complete",
                    "message": "Code generated successfully",
                    "progress": 100,
                    "data": {
                        "submission_id": "sample_123",
                        "download_url": "/api/generate/download/sample_123"
                    }
                })
            
            elif event_type == "ping":
                await websocket.send_json({"event": "pong"})
    
    except WebSocketDisconnect:
        active_connections.remove(websocket)
        logger.info(f"Client disconnected: {user_id}")
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        active_connections.discard(websocket)


@router.websocket("/ws/notifications/{user_id}")
async def websocket_notifications(websocket: WebSocket, user_id: str):
    """WebSocket for user notifications"""
    await websocket.accept()
    active_connections.add(websocket)
    
    try:
        pubsub = redis_client.pubsub()
        await pubsub.subscribe(f"notifications:{user_id}")
        
        async for message in pubsub.listen():
            if message["type"] == "message":
                data = json.loads(message["data"])
                await websocket.send_json({
                    "event": "notification",
                    "timestamp": datetime.utcnow().isoformat(),
                    **data
                })
    
    except WebSocketDisconnect:
        active_connections.remove(websocket)
        logger.info(f"Notification client disconnected: {user_id}")
    except Exception as e:
        logger.error(f"Notification WebSocket error: {e}")
        active_connections.discard(websocket)


async def broadcast_notification(user_id: str, message: dict):
    """Broadcast notification to all active connections for a user"""
    if redis_client:
        await redis_client.publish(
            f"notifications:{user_id}",
            json.dumps(message)
        )


async def broadcast_agent_update(user_id: str, update: dict):
    """Broadcast agent status update"""
    if redis_client:
        await redis_client.publish(
            f"agent:{user_id}:matches",
            json.dumps(update)
        )