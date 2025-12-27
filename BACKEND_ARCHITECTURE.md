# Backend Architecture & Integration Guide

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend (React)                          │
│                    TypeScript + Vite + Tailwind                  │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                    HTTP / WebSocket
                           │
┌──────────────────────────▼──────────────────────────────────────┐
│                    FastAPI Backend                               │
│                   (Async/Await Ready)                            │
├──────────────────────────────────────────────────────────────────┤
│                     API Routers                                   │
│  ┌─────────────┬──────────────┬────────────┬─────────────────┐  │
│  │   Auth      │  Matching    │  Generate  │  Agent (NEW)    │  │
│  │   /auth     │  /matching   │  /generate │  /agent         │  │
│  │   WebSocket │  WebSocket   │            │  WebSocket (NEW)│  │
│  └─────────────┴──────────────┴────────────┴─────────────────┘  │
├──────────────────────────────────────────────────────────────────┤
│                   Core Services                                   │
│  ┌────────────┬───────────┬────────────┬──────────────────────┐  │
│  │  Database  │   Cache   │  Embedding │   LLM Integration    │  │
│  │  (MongoDB) │  (Redis)  │  (Pinecone)│   (Groq Llama 3.3)   │  │
│  └────────────┴───────────┴────────────┴──────────────────────┘  │
├──────────────────────────────────────────────────────────────────┤
│              LangGraph Agent Workflow (NEW)                       │
│  ┌──────────────┬──────────────┬──────────────┬──────────────┐  │
│  │   Analyze    │    Match     │     Judge    │   Generate   │  │
│  │   Profile    │  Hackathons  │  Simulation  │   Boilerplate│  │
│  │   (Node 1)   │   (Node 2)   │   (Node 3)   │   (Node 4)   │  │
│  └──────────────┴──────────────┴──────────────┴──────────────┘  │
└──────────────────────────────────────────────────────────────────┘
```

## Data Flow

### 1. User Authentication
```
Client
  ↓
POST /api/auth/login {email, password}
  ↓
Backend validates credentials
  ↓
Return JWT token + user data
  ↓
Client stores token locally
```

### 2. Hackathon Matching (Agent Workflow)
```
Client
  ↓
POST /api/agent/analyze {
  user_id: "user123",
  skills: ["python", "react", "fastapi"],
  github_summary: "Full-stack developer..."
}
  ↓
┌─ Agent Node 1: Analyze Profile
│   - Extract skills
│   - Generate user profile vector
│   ↓
├─ Agent Node 2: Match Hackathons
│   - Query Pinecone for similar hackathons
│   - Return top 5 matches
│   ↓
├─ Agent Node 3: Judge Simulation
│   - Use Groq to evaluate fit
│   - Calculate win probability
│   - Generate critique
│   ↓
└─ Agent Node 4: Generate Boilerplate
    - Use Groq to generate code
    - FastAPI + React starter
    - Docker Compose config
  ↓
Return complete response with:
  - selected_hackathon
  - win_probability
  - judge_critique
  - boilerplate_code
```

### 3. Real-time Streaming (WebSocket)
```
Client connects to:
  WS /api/agent/ws/agent/{user_id}

Send:
  { event: "start_analysis", skills: [...], ... }

Server executes agent and streams:
  { event: "status", message: "...", progress: 0 }
  { event: "status", message: "...", progress: 25 }
  { event: "status", message: "...", progress: 50 }
  { event: "status", message: "...", progress: 75 }
  { event: "analysis_complete", data: {...} }

Client displays progress in real-time
```

## API Endpoint Categories

### Authentication Endpoints
```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/token/refresh
```

### Agent Endpoints (NEW)
```
POST   /api/agent/analyze
GET    /api/agent/hackathons/{user_id}/matches
POST   /api/agent/matches/score
WS     /api/agent/ws/agent/{user_id}
```

### Matching Endpoints
```
GET    /api/matching/recommendations
POST   /api/matching/find
GET    /api/matching/{hackathon_id}
WS     /ws/notifications/{user_id}
```

### Code Generation Endpoints (ENHANCED)
```
POST   /api/generate/code
POST   /api/generate/boilerplate
POST   /api/generate/code/explain
POST   /api/generate/code/optimize
POST   /api/generate/download/{submission_id}
```

### Profile Endpoints
```
GET    /api/profile
PUT    /api/profile
POST   /api/profile/sync-github
```

## Request/Response Examples

### Example 1: Agent Analysis
```json
// REQUEST
POST /api/agent/analyze
{
  "user_id": "user_123",
  "skills": ["python", "react", "fastapi", "mongodb"],
  "github_summary": "5+ years full-stack development experience. Built 10+ projects."
}

// RESPONSE
{
  "status": "success",
  "user_id": "user_123",
  "selected_hackathon": {
    "id": "hack_456",
    "title": "TechCrunch Disrupt 2025",
    "ps": "Build a sustainable energy monitoring app...",
    "difficulty": "advanced",
    "prize_pool": 50000
  },
  "win_probability": 78.5,
  "judge_critique": "Excellent match. Your experience with full-stack development and database optimization makes this an ideal fit...",
  "boilerplate_code": {
    "backend": "# FastAPI app with SQLAlchemy, Pydantic, JWT auth...",
    "frontend": "// React TypeScript component with hooks, routing...",
    "docker_compose": "# MongoDB, Redis, FastAPI, React configuration...",
    "requirements": "fastapi==0.104.1\nmotor==3.3.1\n...",
    "package_json": "{ \"dependencies\": { \"react\": \"^18.0.0\", ... } }"
  },
  "timestamp": "2025-12-27T10:30:45.123Z"
}
```

### Example 2: Code Generation
```json
// REQUEST
POST /api/generate/boilerplate
{
  "user_id": "user_123",
  "problem_statement": "Build a sustainable energy monitoring app...",
  "skills": ["python", "react", "fastapi"]
}

// RESPONSE
{
  "success": true,
  "user_id": "user_123",
  "boilerplate": {
    "backend": "from fastapi import FastAPI\nfrom motor.motor_asyncio import AsyncIOMotorClient\n...",
    "frontend": "import React, { useState } from 'react';\nimport axios from 'axios';\n...",
    "docker_compose": "version: '3.8'\nservices:\n  backend:\n    build: ./backend\n...",
    "requirements": "fastapi==0.104.1\nuvicorn==0.24.0\n...",
    "package_json": "{ \"name\": \"app\", \"version\": \"1.0.0\", ... }"
  },
  "timestamp": "2025-12-27T10:30:45.123Z"
}
```

### Example 3: WebSocket Communication
```javascript
// Client
const ws = new WebSocket('ws://localhost:8000/api/agent/ws/agent/user_123');

ws.onopen = () => {
  ws.send(JSON.stringify({
    event: "start_analysis",
    skills: ["python", "react"],
    github_summary: "Developer with 3 years experience"
  }));
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  
  if (data.event === "status") {
    console.log(`Progress: ${data.progress}% - ${data.message}`);
  } else if (data.event === "analysis_complete") {
    console.log("Results:", data);
    // Display matched hackathon
    // Show generated boilerplate
    // Display win probability
  } else if (data.event === "error") {
    console.error("Error:", data.message);
  }
};
```

## State Management in Agent

```python
class AgentState(TypedDict):
    # Messages for conversation history
    messages: List[BaseMessage]
    
    # User Information
    user_id: str
    skills: List[str]
    github_summary: str
    
    # Processing Data
    candidate_matches: List[dict]          # Top 5 from Pinecone
    selected_hackathon: Optional[dict]     # Best match
    
    # Results
    win_probability: float                 # 0-100
    judge_critique: str                    # AI evaluation
    boilerplate_code: dict                 # Generated code
```

## Error Handling

### Standard Error Response
```json
{
  "detail": "Error description",
  "status_code": 400
}
```

### Validation Error Response
```json
{
  "detail": [
    {
      "loc": ["body", "user_id"],
      "msg": "field required",
      "type": "value_error.missing"
    }
  ]
}
```

### Agent-specific Errors
```json
{
  "status": "error",
  "error": "Agent analysis failed",
  "message": "Details about what went wrong"
}
```

## Performance Characteristics

| Operation | Latency | Notes |
|-----------|---------|-------|
| User Auth | ~50ms | JWT validation |
| Hackathon Search | ~100ms | Pinecone vector search |
| Judge Simulation | ~500ms | Groq LLM inference |
| Code Generation | ~1s | Groq code generation |
| Full Agent Workflow | ~2-3s | All 4 nodes combined |
| WebSocket Push | <10ms | Redis pub/sub |

## Security Measures

1. **Authentication**
   - JWT tokens with expiration
   - Secure password hashing (bcrypt)
   - Token refresh mechanism

2. **Authorization**
   - User isolation per user_id
   - WebSocket authentication
   - Resource ownership validation

3. **Data Protection**
   - Input validation (Pydantic)
   - SQL injection prevention (ORM)
   - CORS policy enforcement

4. **Error Handling**
   - No sensitive info in error messages
   - Logging without PII
   - Graceful degradation

## Deployment Checklist

- [ ] MongoDB running and configured
- [ ] Redis running and configured
- [ ] Groq API key set
- [ ] Pinecone API key set
- [ ] GitHub token set (optional)
- [ ] Environment variables configured
- [ ] CORS origins configured
- [ ] Secret key set to secure random value
- [ ] JWT expiration set appropriately
- [ ] Database initialized with schema
- [ ] Pinecone index created and populated

## Monitoring & Logging

### Enabled Logging
- Request/response logging
- Agent node execution logging
- Error logging with tracebacks
- Performance timing

### Metrics to Monitor
- Request latency
- Error rates
- Agent success rates
- LLM token usage
- Database query times

## Integration Points with Frontend

1. **Authentication**
   - POST /api/auth/login → Get JWT token
   - Store token in localStorage
   - Include in Authorization header

2. **Agent Workflow**
   - POST /api/agent/analyze → Get matches
   - Display results in UI
   - Download boilerplate

3. **Real-time Updates**
   - Connect to WS endpoint
   - Show progress updates
   - Display results as they arrive

4. **Code Generation**
   - POST /api/generate/boilerplate
   - Download ZIP file
   - Display in editor

---

**Complete Backend Integration Architecture** ✅
