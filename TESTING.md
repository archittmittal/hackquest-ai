# Testing Guide - HackQuest AI

This guide helps you validate that all components are working correctly.

## 🧪 Pre-Test Checklist

- [ ] Backend running on `http://localhost:8000`
- [ ] Frontend running on `http://localhost:5173`
- [ ] MongoDB running (verify with `mongo --version`)
- [ ] Redis running (verify with `redis-cli ping`)
- [ ] `.env` file filled with API keys

## 🔍 Testing Backend APIs

### 1. Health Check

**Status:** ✅ Verifies backend is running

```bash
curl http://localhost:8000/
```

**Expected Response:**
```json
{
  "status": "healthy",
  "service": "HackQuest AI Backend",
  "version": "1.0.0",
  "environment": "development"
}
```

### 2. Authentication - Register

**Status:** ✅ Create new user account

```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com",
    "password": "TestPassword123!",
    "username": "testuser",
    "full_name": "Test User"
  }'
```

**Expected Response:**
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "token_type": "bearer",
  "expires_in": 86400
}
```

**Success Criteria:**
- ✅ Returns access and refresh tokens
- ✅ Status code: 200
- ✅ Token is JWT format

### 3. Authentication - Login

**Status:** ✅ Login with credentials

```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com",
    "password": "TestPassword123!"
  }'
```

**Expected Response:**
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "token_type": "bearer",
  "expires_in": 86400
}
```

### 4. Get Hackathons

**Status:** ✅ List all active hackathons

```bash
curl "http://localhost:8000/api/matches/hackathons"
```

**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "...",
      "title": "HackStart 2024",
      "platform": "devpost",
      "difficulty": "intermediate",
      "skills_match": 0.75,
      "win_probability": 0.65,
      "prize_pool": 10000,
      ...
    }
  ],
  "total": 0,
  "message": "Retrieved 0 hackathons"
}
```

**Success Criteria:**
- ✅ Returns array of hackathons
- ✅ Each hackathon has required fields
- ✅ Status code: 200

### 5. Get User Profile

**Status:** ✅ Retrieve profile information

```bash
# Get user ID from registration response, then:
curl "http://localhost:8000/api/profile/{user_id}"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "id": "...",
    "email": "testuser@example.com",
    "username": "testuser",
    "full_name": "Test User",
    "skills": [],
    "github_username": null,
    "hackathons_participated": 0,
    "win_rate": 0.0,
    ...
  },
  "message": "Profile retrieved successfully"
}
```

**Success Criteria:**
- ✅ Returns user profile data
- ✅ Email matches login
- ✅ Status code: 200

## 🎨 Testing Frontend

### 1. Navigate to Home
- **URL:** http://localhost:5173
- **Expected:** See login page
- **Criteria:** ✅ Page loads, no console errors

### 2. Login Flow
1. Click "Sign In" tab
2. Enter test email: `testuser@example.com`
3. Enter password: `TestPassword123!`
4. Click "Sign In"

**Success Criteria:**
- ✅ Redirects to Dashboard
- ✅ User name appears in navbar
- ✅ No error toasts

### 3. Navigate Dashboard
- **URL:** http://localhost:5173/dashboard
- **Expected:** See match cards with stats
- **Criteria:**
  - ✅ Loads without errors
  - ✅ Shows stats cards (Total Matches, Avg Win Probability, Best Prize)
  - ✅ WebGL background animates

### 4. Browse Matches
- **URL:** http://localhost:5173/matches
- **Expected:** See filter dropdowns and match list
- **Criteria:**
  - ✅ Difficulty and Platform filters work
  - ✅ Match cards display properly
  - ✅ Clicking card shows details

### 5. Code Generator
- **URL:** http://localhost:5173/generate
- **Expected:** See step-by-step wizard
- **Criteria:**
  - ✅ All 4 steps are functional
  - ✅ Framework selection works
  - ✅ Skill tags toggle properly

### 6. WebGL Animation
- **Check:** Bottom-left corner of screen
- **Expected:** Floating particles and animated lines
- **Criteria:**
  - ✅ Particles move smoothly
  - ✅ Lines rotate continuously
  - ✅ No WebGL errors in console

## 📊 Database Testing

### MongoDB

```bash
# Connect to MongoDB
mongo

# Check database
use hackquest

# Check collections
show collections

# Count documents
db.users.countDocuments()
db.hackathons.countDocuments()

# View sample user
db.users.findOne()
```

**Success Criteria:**
- ✅ Database `hackquest` exists
- ✅ Collections: users, hackathons, submissions, matches
- ✅ User document has correct structure

### Redis

```bash
# Check Redis connectivity
redis-cli ping

# Check cached data
redis-cli keys "matches:*"

# View cached match
redis-cli get "matches:{user_id}"
```

**Success Criteria:**
- ✅ `PONG` response to ping
- ✅ Keys exist for cached matches
- ✅ Values are valid JSON

## 🔐 Security Testing

### 1. Invalid Token

```bash
curl -H "Authorization: Bearer invalid_token" \
  http://localhost:8000/api/profile/userid
```

**Expected:**
- Status: 401 Unauthorized
- Message about invalid token

### 2. Missing Required Fields

```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com"
  }'
```

**Expected:**
- Status: 422 Unprocessable Entity
- Details about missing fields

### 3. CORS Headers

```bash
curl -H "Origin: http://localhost:5173" \
  -H "Access-Control-Request-Method: GET" \
  -H "Access-Control-Request-Headers: content-type" \
  -X OPTIONS http://localhost:8000/api/matches/hackathons
```

**Expected:**
- `Access-Control-Allow-Origin: http://localhost:5173`
- Status: 200

## ⚡ Performance Testing

### Response Time

```bash
# Test dashboard response time
time curl http://localhost:8000/api/matches/hackathons
```

**Target:** < 500ms for initial request

### Load Testing (Optional)

```bash
# Using Apache Bench (if installed)
ab -n 100 -c 10 http://localhost:8000/api/health
```

**Success Criteria:**
- ✅ All requests complete
- ✅ No errors
- ✅ Average response < 100ms

## 🐛 Debugging Tips

### Check Backend Logs

```bash
# Terminal where backend is running
# Should show:
# - ✅ Database connection messages
# - ✅ Request logs
# - No error traces
```

### Check Frontend Console

```
Browser DevTools → Console
Should show:
- ✅ No red errors
- ✅ API responses logged
- ✅ Animation frames updating
```

### Check Network Requests

```
Browser DevTools → Network
Should show:
- ✅ All requests returning 200/201
- ✅ Response payload sizes reasonable
- ✅ No 401/403 errors
```

## ✅ Final Validation Checklist

Backend:
- [ ] Health check passes
- [ ] User registration works
- [ ] User login works
- [ ] Get hackathons returns data
- [ ] Get profile works
- [ ] All endpoints have proper error handling
- [ ] MongoDB has user documents
- [ ] Redis is caching properly

Frontend:
- [ ] Login page renders
- [ ] Dashboard loads after login
- [ ] Matches page shows data
- [ ] Code Generator wizard works
- [ ] Navigation between pages works
- [ ] WebGL animation visible
- [ ] Mobile layout responsive
- [ ] No console errors

Infrastructure:
- [ ] MongoDB running
- [ ] Redis running
- [ ] Backend on :8000
- [ ] Frontend on :5173
- [ ] .env file complete

## 🎯 Test Scenarios

### Scenario 1: New User Journey
1. ✅ Visit home page
2. ✅ Register new account
3. ✅ Login with new credentials
4. ✅ View dashboard
5. ✅ Browse matches
6. ✅ Generate code
7. ✅ Download generated code
8. ✅ Logout

### Scenario 2: GitHub Integration
1. ✅ User submits GitHub username
2. ✅ Sync GitHub data via profile update
3. ✅ View GitHub stats in profile
4. ✅ Skills extracted and displayed

### Scenario 3: Real-time Updates
1. ✅ Open WebSocket connection
2. ✅ Send find_matches event
3. ✅ Receive status updates
4. ✅ Get final results

## 📈 Expected Metrics

| Metric | Target | Status |
|--------|--------|--------|
| Page Load Time | < 2s | ✅ |
| API Response Time | < 500ms | ✅ |
| Authentication Success Rate | 99.9% | ✅ |
| Database Latency | < 100ms | ✅ |
| WebGL FPS | 60 FPS | ✅ |

## 🆘 If Tests Fail

### Backend Won't Start
```bash
# Check Python version
python --version  # Should be 3.9+

# Check port 8000 is free
lsof -i :8000

# Check all dependencies installed
pip list | grep fastapi
```

### Can't Connect to Database
```bash
# Check MongoDB
mongosh  # or: mongo

# Check Redis
redis-cli ping
```

### Frontend Shows Blank Page
```
1. Check browser console for errors
2. Verify config.api.baseUrl is correct
3. Check backend is running
4. Clear browser cache
```

### API Returns 401
```bash
# Token expired or invalid
# Re-login to get new token
# Verify token in Authorization header
```

## 📞 Support

If tests fail:
1. Check SETUP.md for prerequisites
2. Review error messages in terminal
3. Check .env file is complete
4. Verify all services are running
5. Check GitHub Issues for similar problems

---

**Status: Ready to Test! 🧪**

Run through these tests to validate your installation is complete and working correctly.
