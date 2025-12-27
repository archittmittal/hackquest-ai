# Security Implementation Quick Start Guide

## Overview

This guide shows how to apply the security fixes to your API endpoints and explains the production deployment setup.

---

## 1. How to Apply Rate Limiting to Endpoints

### Syntax

```python
from fastapi import Request
from app.core.security import get_limiter

limiter = get_limiter()

@router.get("/api/endpoint")
@limiter.limiter.limit("10/minute")  # Custom limit
async def my_endpoint(request: Request):
    return {"message": "success"}
```

### Pre-defined Limits

```python
# Authentication endpoints (strict)
@router.post("/login")
@limiter.limiter.limit(settings.RATE_LIMIT_AUTH)  # 10/minute
async def login(request: Request, ...):
    ...

# Standard API endpoints
@router.get("/data")
@limiter.limiter.limit(settings.RATE_LIMIT_API)  # 100/minute
async def get_data(request: Request, ...):
    ...

# Upload endpoints (strictest)
@router.post("/upload")
@limiter.limiter.limit(settings.RATE_LIMIT_UPLOAD)  # 5/minute
async def upload(request: Request, ...):
    ...
```

### How It Works

1. **IP-based**: Each IP address gets separate limit bucket
2. **Per-minute**: Resets every 60 seconds
3. **HTTP 429**: Exceeding limit returns "Too Many Requests"
4. **Headers**: Response includes `Retry-After` for client guidance

---

## 2. How to Enforce Authentication on Protected Routes

### Method 1: Query Parameter (For Backward Compatibility)

```python
from typing import Optional
from app.core.security import AuthDependencies

@router.get("/profile")
async def get_profile(token: Optional[str] = None, db: Session = Depends(get_db)):
    """Protected route using query parameter auth."""
    user_id = await AuthDependencies.get_current_user_from_token(token)
    # user_id is now validated and trusted
    return db.query(User).filter(User.id == user_id).first()
```

**Request**:
```bash
curl "http://localhost:8000/profile?token=eyJ..."
```

### Method 2: Authorization Header (Recommended for Production)

```python
from fastapi import Request
from app.core.security import AuthDependencies

@router.get("/profile")
async def get_profile(request: Request, db: Session = Depends(get_db)):
    """Protected route using Authorization header (production-grade)."""
    user_id = await AuthDependencies.get_current_user_from_header(request)
    # user_id is validated, token not exposed in logs
    return db.query(User).filter(User.id == user_id).first()
```

**Request**:
```bash
TOKEN="eyJ..."
curl -H "Authorization: Bearer $TOKEN" http://localhost:8000/profile
```

### Method 3: Using Dependency Injection (Cleanest)

```python
from fastapi import Depends, Request

async def get_current_user(request: Request) -> str:
    """Dependency for protected routes."""
    from app.core.security import AuthDependencies
    return await AuthDependencies.get_current_user_from_header(request)

@router.get("/profile")
async def get_profile(user_id: str = Depends(get_current_user), db: Session = Depends(get_db)):
    """user_id is auto-extracted from Authorization header."""
    return db.query(User).filter(User.id == user_id).first()
```

---

## 3. CORS Configuration for Different Environments

### Development

```env
# .env.development
ENVIRONMENT=development
DEBUG=true
CORS_ORIGINS_PROD=""

# Automatically allows localhost variants
```

**Result**: Allows `http://localhost:3000`, `http://localhost:5173`, etc.

### Staging

```env
# .env.staging
ENVIRONMENT=staging
DEBUG=false
CORS_ORIGINS_PROD=https://staging.app.example.com

# Explicitly set staging domain
```

### Production

```env
# .env.production
ENVIRONMENT=production
DEBUG=false
CORS_ORIGINS_PROD=https://app.example.com,https://www.example.com

# Only explicit production domains, NO wildcards!
```

### Custom Origin Control

If you need to allow specific origins programmatically:

```python
from app.core.security import CORSConfig

# Get environment-aware origins
allowed_origins = CORSConfig.get_allowed_origins()
print(allowed_origins)
# Output: ['http://localhost:3000', 'http://localhost:5173'] (dev)
# Output: ['https://app.example.com', 'https://www.example.com'] (prod)
```

---

## 4. Environment Setup for Production

### Step 1: Create Production Env File

```bash
# Copy template and fill in values
cp .env.production.example .env.production
nano .env.production
```

### Step 2: Generate Secret Key

```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
# Output: Copy this into SECRET_KEY=
```

### Step 3: Set Required Variables

```env
ENVIRONMENT=production
SECRET_KEY=your-generated-key-here
DEBUG=false
CORS_ORIGINS_PROD=https://your-domain.com
RATE_LIMIT_DEFAULT=100/minute
RATE_LIMIT_STORAGE=redis://your-redis-host:6379
```

### Step 4: Validate Configuration

```bash
# Check that all required vars are set
python -c "from app.core.config import settings; print(settings.environment, settings.secret_key[:20])"
```

---

## 5. Security Logging & Monitoring

### View Security Logs

```python
import logging
logging.basicConfig(level=logging.INFO)

# Now you'll see:
# [INFO] user_registered: {"user_id": "123", "email": "test@example.com"}
# [INFO] user_login: {"user_id": "123"}
# [WARNING] login_failed: {"email": "test@example.com", "reason": "invalid_credentials"}
# [WARNING] Rate limit exceeded for 192.168.1.1
```

### Set Up Monitoring Alert (Example: Failed Logins)

```python
# In your monitoring system
log_lines = read_application_logs()
failed_logins = [l for l in log_lines if "login_failed" in l]

if len(failed_logins) > 10:  # Alert if >10 failures in 5 minutes
    send_security_alert("Multiple failed login attempts detected!")
```

---

## 6. Testing Security Implementation

### Test Rate Limiting

```bash
#!/bin/bash
# Run 15 login attempts, expect 429 after 10
for i in {1..15}; do
  STATUS=$(curl -s -w "%{http_code}" -X POST http://localhost:8000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"wrong"}' \
    -o /dev/null)
  echo "Request $i: HTTP $STATUS"
done
```

**Expected Output**:
```
Request 1: HTTP 401
Request 2: HTTP 401
...
Request 10: HTTP 401
Request 11: HTTP 429  ← Rate limited!
Request 12: HTTP 429
```

### Test Authentication

```bash
# Without token - should fail
curl http://localhost:8000/api/auth/me
# HTTP 401 Unauthorized

# With token - should succeed
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
curl -H "Authorization: Bearer $TOKEN" http://localhost:8000/api/auth/me
# HTTP 200 OK with user data
```

### Test CORS

```bash
# From unauthorized origin - should NOT include CORS headers
curl -H "Origin: https://evil.example.com" \
  -H "Access-Control-Request-Method: GET" \
  -i http://localhost:8000/api/data

# Should NOT have Access-Control-Allow-Origin header
# Browser will reject the response
```

---

## 7. Common Issues & Troubleshooting

### Issue: 401 Unauthorized on Protected Routes

**Problem**: Token is valid but still getting 401

**Solutions**:
```bash
# Check token format
curl -H "Authorization: Bearer $TOKEN" http://localhost:8000/api/auth/me

# Not this (missing Bearer):
curl -H "Authorization: $TOKEN" http://localhost:8000/api/auth/me

# Not this (token in query):
curl "http://localhost:8000/api/auth/me?token=$TOKEN"
```

### Issue: 429 Too Many Requests on First Request

**Problem**: Getting rate limited immediately

**Solutions**:
- Check if using Redis correctly: `redis-cli ping`
- Verify rate limit is set: `RATE_LIMIT_DEFAULT=100/minute`
- Check if IP is being blocked elsewhere (firewall, proxy)

### Issue: CORS Not Working

**Problem**: Frontend can't access API from different domain

**Solutions**:
```env
# Add your frontend domain to allowed origins
CORS_ORIGINS_PROD=https://frontend.example.com,https://app.example.com

# Verify it's being read:
python -c "from app.core.security import CORSConfig; print(CORSConfig.get_allowed_origins())"
```

### Issue: Rate Limiting Not Working

**Problem**: Can make unlimited requests

**Verify Installation**:
```bash
pip list | grep slowapi
# Should show: slowapi 0.1.9

# Check imports work
python -c "from slowapi import Limiter; print('OK')"
```

---

## 8. Monitoring Checklist

### Daily

- [ ] Review failed authentication logs
- [ ] Check rate limit events (unusual patterns?)
- [ ] Verify all CORS requests are from whitelisted origins

### Weekly

- [ ] Review security logs for suspicious activity
- [ ] Check JWT token expiration (adjust if needed)
- [ ] Verify rate limit storage (Redis) is operational

### Monthly

- [ ] Rotate SECRET_KEY (requires re-issuing all tokens)
- [ ] Review CORS whitelist (remove unused domains)
- [ ] Check rate limit thresholds (increase if legitimate traffic blocked)
- [ ] Audit all authentication attempts and failures

### Quarterly

- [ ] Security patch updates (FastAPI, JWT, etc.)
- [ ] Review this security implementation
- [ ] Update CORS origins for new services/domains
- [ ] Perform penetration testing

---

## 9. Deployment Script Example

```bash
#!/bin/bash
# deploy-production.sh

set -e

echo "=== HackQuest AI Security Hardened Deployment ==="

# 1. Validate configuration
echo "Validating configuration..."
python -c "from app.core.config import settings; \
  assert settings.environment == 'production', 'Not production mode'; \
  assert settings.secret_key != 'change-this-in-production', 'Secret key not changed'; \
  print('✓ Configuration valid')"

# 2. Install dependencies
echo "Installing dependencies..."
pip install -r requirements.txt
pip install slowapi  # Rate limiting

# 3. Run database migrations
echo "Running migrations..."
alembic upgrade head

# 4. Test security
echo "Testing security..."
curl -f http://localhost:8000/api/health || echo "⚠ Health check failed"

# 5. Start backend
echo "Starting backend..."
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4

echo "✓ Deployment complete!"
```

---

## Additional Resources

1. **View Full Security Hardening Report**: See `SECURITY_HARDENING.md`
2. **API Documentation**: `http://localhost:8000/docs`
3. **Environment Variables**: Copy `.env.production.example` to `.env.production`

---

## Need Help?

- Check application logs: `docker logs -f backend`
- Review security events: `grep "security_event" logs.txt`
- Test endpoints: `curl -v http://localhost:8000/api/health`
