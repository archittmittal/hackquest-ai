# API Examples - Copy & Paste Ready

Quick reference for all API endpoints with ready-to-use examples.

## Authentication Endpoints

### Register New User
```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123!",
    "username": "johndoe",
    "full_name": "John Doe"
  }'
```

**Response:**
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "token_type": "bearer",
  "expires_in": 86400
}
```

### Login
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123!"
  }'
```

### Refresh Token
```bash
curl -X POST http://localhost:8000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refresh_token": "eyJ0eXAi..."
  }'
```

### Verify Token
```bash
curl -X POST http://localhost:8000/api/auth/verify \
  -H "Content-Type: application/json" \
  -d '{
    "token": "eyJ0eXAi..."
  }'
```

### Logout
```bash
curl -X POST http://localhost:8000/api/auth/logout
```

---

## Matches Endpoints

### Find Personalized Matches
```bash
curl -X POST http://localhost:8000/api/matches/find \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "user_id": "user_id_from_db",
    "limit": 10
  }'
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "hackathon_id",
      "title": "HackStart 2024",
      "platform": "devpost",
      "difficulty": "intermediate",
      "skills_match": 0.85,
      "win_probability": 0.72,
      "prize_pool": 10000,
      "matched_skills": ["python", "react"],
      "missing_skills": ["kubernetes"],
      "start_date": "2024-02-15T00:00:00",
      "end_date": "2024-02-17T23:59:59",
      "registration_link": "https://...",
      "theme": "Web3"
    }
  ],
  "total_matches": 5,
  "message": "Found 5 matching hackathons"
}
```

### Get All Hackathons
```bash
# Without filters
curl "http://localhost:8000/api/matches/hackathons"

# With filters
curl "http://localhost:8000/api/matches/hackathons?platform=devpost&difficulty=intermediate&skip=0&limit=20"
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "...",
      "title": "...",
      "platform": "devpost",
      "difficulty": "intermediate",
      ...
    }
  ],
  "total": 150,
  "message": "Retrieved 20 hackathons"
}
```

### Get Hackathon Details
```bash
curl "http://localhost:8000/api/matches/hackathon_id"
```

---

## Profile Endpoints

### Get User Profile
```bash
curl "http://localhost:8000/api/profile/user_id" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "user_id",
    "email": "john@example.com",
    "username": "johndoe",
    "full_name": "John Doe",
    "avatar_url": "https://...",
    "bio": "Full-stack developer",
    "skills": ["python", "javascript", "react"],
    "github_username": "johndoe",
    "github_stars": 150,
    "github_repos": 45,
    "github_followers": 200,
    "hackathons_participated": 5,
    "hackathons_won": 1,
    "win_rate": 0.2,
    "status": "active",
    "created_at": "2024-01-15T10:30:00",
    "updated_at": "2024-01-20T15:45:00"
  },
  "message": "Profile retrieved successfully"
}
```

### Update Profile
```bash
curl -X PATCH "http://localhost:8000/api/profile/user_id" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "full_name": "John Smith",
    "bio": "Full-stack developer & open source contributor",
    "skills": ["python", "javascript", "react", "fastapi"],
    "github_username": "john-smith"
  }'
```

### Sync GitHub Profile
```bash
curl -X POST "http://localhost:8000/api/profile/user_id/sync-github" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "github_token": "ghp_YOUR_GITHUB_TOKEN"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "GitHub profile synced successfully",
  "data": {
    "stars": 500,
    "repos": 50,
    "followers": 300
  }
}
```

### Get User Statistics
```bash
curl "http://localhost:8000/api/profile/user_id/stats" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "hackathons_participated": 5,
    "hackathons_won": 1,
    "win_rate": 0.2,
    "total_submissions": 8,
    "winning_submissions": 1,
    "github_stars": 500,
    "github_followers": 300
  }
}
```

---

## Code Generation Endpoints

### Generate Boilerplate Code
```bash
curl -X POST "http://localhost:8000/api/generate/code" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "hackathon_id": "hackathon_id",
    "problem_statement": "Build a real-time chat application with WebSockets and databases",
    "selected_skills": ["python", "javascript", "react", "fastapi"],
    "framework": "fastapi",
    "user_id": "user_id"
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "backend_code": "\"\"\"FastAPI Backend Template...\n...\n\"\"\"",
    "frontend_code": "import React...\n...",
    "docker_compose": "version: '3.8'...\n...",
    "requirements_txt": "fastapi==0.104.1...\n...",
    "package_json": "{\n  \"name\": \"generated-frontend\"...\n}"
  },
  "download_url": "/api/generate/download/submission_id",
  "message": "Code generated successfully"
}
```

### Download Generated Code
```bash
curl "http://localhost:8000/api/generate/download/submission_id" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## Health Check Endpoints

### Basic Health Check
```bash
curl http://localhost:8000/
```

**Response:**
```json
{
  "status": "healthy",
  "service": "HackQuest AI Backend",
  "version": "1.0.0",
  "environment": "development"
}
```

### Detailed Health Check
```bash
curl http://localhost:8000/api/health
```

**Response:**
```json
{
  "status": "operational",
  "mongodb": "connected",
  "redis": "connected",
  "pinecone": "connected",
  "timestamp": "2024-01-20T15:45:30.123456"
}
```

---

## WebSocket Endpoints

### Connect to Agent WebSocket
```javascript
// JavaScript example
const userId = "user_id_here";
const accessToken = "your_access_token";

const ws = new WebSocket(`ws://localhost:8000/ws/agent/${userId}`);

ws.onopen = () => {
  console.log('Connected to agent');
  
  // Send find_matches event
  ws.send(JSON.stringify({
    event: 'find_matches'
  }));
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Agent update:', data);
  // data will have:
  // - event: "status" | "complete" | "error"
  // - message: "Finding hackathon matches..."
  // - progress: 0-100
  // - data: {...} (if complete)
};

ws.onerror = (error) => {
  console.error('WebSocket error:', error);
};

ws.onclose = () => {
  console.log('Disconnected from agent');
};
```

### Connect to Notifications WebSocket
```javascript
const userId = "user_id_here";

const ws = new WebSocket(`ws://localhost:8000/ws/notifications/${userId}`);

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Notification:', data);
  // data structure:
  // {
  //   event: "notification",
  //   timestamp: "2024-01-20T15:45:30.123456",
  //   ...notification_specific_fields
  // }
};
```

---

## Error Responses

### 400 Bad Request
```json
{
  "detail": "Email already registered"
}
```

### 401 Unauthorized
```json
{
  "detail": "Invalid credentials"
}
```

### 404 Not Found
```json
{
  "detail": "User not found"
}
```

### 422 Unprocessable Entity
```json
{
  "detail": [
    {
      "loc": ["body", "email"],
      "msg": "invalid email format",
      "type": "value_error.email"
    }
  ]
}
```

### 500 Internal Server Error
```json
{
  "detail": "Internal server error"
}
```

---

## Common Headers

### Authorization Header
```bash
-H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Content-Type Header
```bash
-H "Content-Type: application/json"
```

### Combine Headers
```bash
curl -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:8000/api/endpoint
```

---

## Environment Variables Reference

Place these in `backend/.env`:

```env
# Application
ENVIRONMENT=development
PORT=8000

# Databases
MONGODB_URL=mongodb://localhost:27017
MONGODB_DB=hackquest
REDIS_URL=redis://localhost:6379/0

# APIs
GROQ_API_KEY=your_key_here
PINECONE_API_KEY=your_key_here
PINECONE_INDEX=hackquest-index
GITHUB_TOKEN=your_token_here
HF_API_KEY=your_key_here

# Authentication
JWT_SECRET=your-secret-key
JWT_ALGORITHM=HS256
JWT_EXPIRATION_HOURS=24

# CORS
CORS_ORIGINS=http://localhost:3000,http://localhost:5173,http://localhost:8000
```

---

## Python Requests Examples

If using Python for testing:

```python
import requests
import json

BASE_URL = "http://localhost:8000"

# Register
response = requests.post(f"{BASE_URL}/api/auth/register", json={
    "email": "test@example.com",
    "password": "TestPass123!",
    "username": "testuser",
    "full_name": "Test User"
})
print(response.json())

# Login
response = requests.post(f"{BASE_URL}/api/auth/login", json={
    "email": "test@example.com",
    "password": "TestPass123!"
})
tokens = response.json()
access_token = tokens['access_token']

# Get profile
headers = {"Authorization": f"Bearer {access_token}"}
response = requests.get(f"{BASE_URL}/api/profile/user_id", headers=headers)
print(response.json())

# Find matches
response = requests.post(f"{BASE_URL}/api/matches/find", json={
    "user_id": "user_id",
    "limit": 10
}, headers=headers)
print(response.json())
```

---

## Testing with Postman

1. Import these endpoints into Postman
2. Create environment variables:
   - `base_url`: http://localhost:8000
   - `access_token`: (gets filled after login)
3. Use `{{base_url}}` and `{{access_token}}` in requests
4. Set Authorization header: `Bearer {{access_token}}`

---

## Swagger UI

For interactive API testing:

1. Start backend: `uvicorn app.main:app --reload`
2. Visit: http://localhost:8000/docs
3. Try endpoints directly in browser
4. See auto-generated documentation

---

## Tips & Tricks

**Generate API Keys:**
```bash
# Python
python -c "import secrets; print(secrets.token_urlsafe(32))"

# Bash
openssl rand -hex 32
```

**Test API Speed:**
```bash
time curl http://localhost:8000/api/health
```

**Pretty Print JSON:**
```bash
curl http://localhost:8000/ | python -m json.tool
```

**Save Response to File:**
```bash
curl http://localhost:8000/api/matches/hackathons > hackathons.json
```

---

## Need More Help?

- API Documentation: http://localhost:8000/docs
- Full Setup Guide: See SETUP.md
- Testing Guide: See TESTING.md

---

**Ready to use! Copy & paste these examples to test your API.** 🚀
