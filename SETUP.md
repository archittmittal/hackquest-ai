# HackQuest AI - Production-Ready Platform

> AI-Powered Hackathon Matching & Code Generation Platform

## 🚀 Overview

HackQuest AI is a comprehensive full-stack platform that:
- **Matches** users to hackathons based on skill analysis
- **Generates** tailored boilerplate code for each match
- **Simulates** judge feedback for improvement
- **Aggregates** hackathon data from multiple sources (DevPost, Unstop, SIH, etc.)

### Architecture

```
┌─────────────────────────────────────────────────┐
│ Frontend (React 18 + Vite + Tailwind)          │
│ - Dashboard, Matches, Code Generator           │
│ - Nothing OS inspired glass-morphism design    │
│ - Real-time WebSocket integration              │
└──────────────────┬──────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────┐
│ API Gateway (FastAPI + Uvicorn)                │
│ - Authentication (JWT)                          │
│ - Matches API                                   │
│ - Profile Management                           │
│ - Code Generation                              │
│ - WebSocket Server                             │
└──────────────────┬──────────────────────────────┘
                   │
        ┌──────────┼──────────┬──────────┐
        ▼          ▼          ▼          ▼
    ┌────────┐┌────────┐┌────────┐┌────────┐
    │MongoDB ││Pinecone││ Redis  ││Groq   │
    │ Users  ││Vectors ││ Cache  ││ LLM   │
    └────────┘└────────┘└────────┘└────────┘
```

## 📋 Prerequisites

### System Requirements
- Python 3.9+
- Node.js 18+
- MongoDB 5.0+
- Redis 6.0+
- 4GB RAM minimum

### Required API Keys
Get these from the respective platforms:
1. **Groq** - LLM inference → https://console.groq.com
2. **Pinecone** - Vector DB → https://pinecone.io
3. **GitHub** - User data → https://github.com/settings/tokens
4. **HuggingFace** - Embeddings → https://huggingface.co/settings/tokens

## 🔧 Installation

### 1. Clone Repository
```bash
git clone https://github.com/yourusername/hackquest-ai.git
cd hackquest-ai
```

### 2. Backend Setup

#### Create Python Environment
```bash
cd backend
python -m venv venv

# Activate (Windows)
venv\Scripts\activate

# Activate (macOS/Linux)
source venv/bin/activate
```

#### Install Dependencies
```bash
pip install -r requirements.txt
```

#### Configure Environment Variables
```bash
# Copy example to .env
cp .env.example .env

# Edit .env and fill in your API keys
nano .env  # or code .env
```

**Required `.env` variables:**
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
PINECONE_ENV=your_env_here
PINECONE_INDEX=hackquest-index
GITHUB_TOKEN=your_token_here
HF_API_KEY=your_key_here

# JWT
JWT_SECRET=your-secret-key-change-in-production
JWT_ALGORITHM=HS256
JWT_EXPIRATION_HOURS=24

# CORS
CORS_ORIGINS=http://localhost:3000,http://localhost:5173,http://localhost:8000
```

#### Start Backend
```bash
# Option 1: Direct
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Option 2: Using Python
python -m uvicorn app.main:app --reload
```

**Backend will be available at:** http://localhost:8000

### 3. Frontend Setup

#### Install Dependencies
```bash
cd frontend
npm install
```

#### Configure API Endpoint
Edit `frontend/src/config/index.ts`:
```typescript
export const config = {
  api: {
    baseUrl: 'http://localhost:8000'
  }
};
```

#### Start Development Server
```bash
npm run dev
```

**Frontend will be available at:** http://localhost:5173

### 4. Database Setup

#### MongoDB
```bash
# Option 1: Local Installation
# Windows: Download from https://www.mongodb.com/try/download/community
# macOS: brew install mongodb-community
# Linux: sudo apt-get install mongodb

# Start MongoDB
mongod

# Option 2: Docker
docker pull mongo:latest
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

#### Redis
```bash
# Option 1: Local Installation
# Windows: Download from https://github.com/microsoftarchive/redis/releases
# macOS: brew install redis
# Linux: sudo apt-get install redis-server

# Start Redis
redis-server

# Option 2: Docker
docker pull redis:latest
docker run -d -p 6379:6379 --name redis redis:latest
```

### 5. Complete Setup with Docker Compose

For easiest setup, use Docker:

```bash
# From project root
docker-compose -f docker/docker-compose.yml up -d

# This starts:
# - Frontend (port 5173)
# - Backend (port 8000)
# - MongoDB (port 27017)
# - Redis (port 6379)
```

## 📚 API Documentation

### Authentication Endpoints

```bash
# Register
POST /api/auth/register
{
  "email": "user@example.com",
  "password": "secure_password",
  "username": "john_doe",
  "full_name": "John Doe"
}

# Login
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "secure_password"
}

# Response
{
  "access_token": "eyJ0eXAi...",
  "refresh_token": "eyJ0eXAi...",
  "expires_in": 86400
}
```

### Matching Endpoints

```bash
# Find Matches for User
POST /api/matches/find
{
  "user_id": "user_id_here",
  "limit": 10
}

# Get All Hackathons
GET /api/matches/hackathons?platform=devpost&difficulty=intermediate

# Get Hackathon Details
GET /api/matches/{hackathon_id}
```

### Code Generation

```bash
# Generate Boilerplate Code
POST /api/generate/code
{
  "hackathon_id": "hack_123",
  "problem_statement": "Build a real-time chat application",
  "selected_skills": ["python", "react", "fastapi"],
  "framework": "fastapi"
}

# Download Generated Code
GET /api/generate/download/{submission_id}
```

### Profile Management

```bash
# Get User Profile
GET /api/profile/{user_id}

# Update Profile
PATCH /api/profile/{user_id}
{
  "bio": "Full-stack developer",
  "skills": ["python", "javascript", "react"]
}

# Sync GitHub
POST /api/profile/{user_id}/sync-github
{
  "github_token": "ghp_..."
}

# Get Statistics
GET /api/profile/{user_id}/stats
```

### WebSocket Events

```javascript
// Connect to WebSocket
const ws = new WebSocket('ws://localhost:8000/ws/agent/user_id');

// Send find_matches event
ws.send(JSON.stringify({
  event: 'find_matches'
}));

// Listen for responses
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log(data);
};
```

## 🎨 Frontend Routes

| Route | Component | Description |
|-------|-----------|-------------|
| `/` | Dashboard | Main dashboard with match overview |
| `/dashboard` | Dashboard | Alias for home |
| `/explore` | Home | Explore hackathons & get started |
| `/matches` | Matches | Browse all matches with filters |
| `/generate` | CodeGenerator | Generate boilerplate code |

## 📊 Database Collections

### MongoDB Collections

#### users
```json
{
  "_id": ObjectId,
  "email": "user@example.com",
  "username": "john_doe",
  "full_name": "John Doe",
  "password_hash": "$2b$12$...",
  "avatar_url": "https://...",
  "bio": "Full-stack developer",
  "skills": ["python", "javascript", "react"],
  "github_username": "john-doe",
  "github_stars": 150,
  "hackathons_participated": 5,
  "hackathons_won": 1,
  "win_rate": 0.2,
  "status": "active",
  "created_at": ISODate,
  "updated_at": ISODate
}
```

#### hackathons
```json
{
  "_id": ObjectId,
  "title": "HackStart 2024",
  "description": "Web development hackathon",
  "platform": "devpost",
  "difficulty": "intermediate",
  "start_date": ISODate,
  "end_date": ISODate,
  "prize_pool": 10000,
  "theme": "Web3",
  "required_skills": ["javascript", "react", "nodejs"],
  "location": "San Francisco, CA",
  "is_remote": true,
  "registration_link": "https://...",
  "platform_id": "unique_id_from_platform"
}
```

#### submissions
```json
{
  "_id": ObjectId,
  "user_id": ObjectId,
  "hackathon_id": ObjectId,
  "title": "Smart Chat App",
  "description": "Real-time chat with AI",
  "repository_url": "https://github.com/...",
  "demo_url": "https://demo.example.com",
  "technologies": ["python", "react", "fastapi"],
  "status": "submitted",
  "judge_feedback": {...},
  "score": 85.5,
  "created_at": ISODate,
  "updated_at": ISODate
}
```

### Pinecone Vector Index

**Index Name:** `hackquest-index`
**Dimensions:** 1536 (OpenAI embeddings)
**Metric:** cosine

Stores embeddings for:
- Hackathon descriptions
- Problem statements
- User skill profiles

## 🤖 LangGraph Agent Pipeline

The system uses LangGraph for orchestrating multi-step agent workflows:

```
[User Input] 
    ↓
[DataAgent] → Fetches hackathon data from Pinecone
    ↓
[ProfileAgent] → Analyzes user GitHub profile
    ↓
[MatchAgent] → Calculates skill-hackathon compatibility
    ↓
[GenerateAgent] → Creates boilerplate code
    ↓
[JudgeAgent] → Simulates judge feedback
    ↓
[Response] → Returns to user
```

## 🔐 Security Features

- **JWT Authentication** - Secure token-based auth with refresh tokens
- **Password Hashing** - bcrypt with salt rounds
- **CORS Configuration** - Whitelist specific origins
- **Rate Limiting** - Redis-backed rate limiter
- **Input Validation** - Pydantic models for all endpoints
- **HTTPS Ready** - Production deployment uses HTTPS

## 📦 Deployment

### Production Checklist

- [ ] Generate secure JWT secret: `openssl rand -hex 32`
- [ ] Set `ENVIRONMENT=production`
- [ ] Use production database URLs
- [ ] Enable HTTPS/SSL
- [ ] Configure proper CORS origins
- [ ] Set up monitoring and logging
- [ ] Configure automated backups
- [ ] Set up CI/CD pipeline

### Docker Deployment

```bash
# Build images
docker-compose -f docker/docker-compose.yml build

# Run containers
docker-compose -f docker/docker-compose.yml up -d

# View logs
docker-compose -f docker/docker-compose.yml logs -f

# Stop services
docker-compose -f docker/docker-compose.yml down
```

### Kubernetes Deployment

```bash
# Create namespace
kubectl create namespace hackquest

# Apply configs
kubectl apply -f k8s/ -n hackquest

# Check status
kubectl get pods -n hackquest
```

## 🐛 Troubleshooting

### Common Issues

**MongoDB Connection Failed**
```bash
# Check if MongoDB is running
mongo --version

# Start MongoDB
mongod

# Or use Docker
docker run -d -p 27017:27017 mongo:latest
```

**Redis Connection Failed**
```bash
# Check Redis
redis-cli ping

# Start Redis
redis-server

# Or use Docker
docker run -d -p 6379:6379 redis:latest
```

**Pinecone Connection Error**
- Verify API key in `.env`
- Check API key has no extra spaces
- Verify environment and index name match Pinecone dashboard

**CORS Errors**
- Verify frontend URL in `CORS_ORIGINS`
- Check backend is serving proper CORS headers
- Try `CORS_ORIGINS=*` for testing (not production!)

## 📞 Support

- **Issues:** GitHub Issues
- **Documentation:** [Full Docs](./docs/)
- **Community:** Discord Server

## 📄 License

MIT License - see [LICENSE](LICENSE) file

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

---

**Made with ⚡ by the HackQuest Team**
