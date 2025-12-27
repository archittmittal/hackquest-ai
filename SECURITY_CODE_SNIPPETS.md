# Security Code Snippets - Copy & Paste Examples

## Quick Reference for Common Patterns

---

## Pattern 1: Protect an API Endpoint with Authentication

### Scenario: User wants to access their own data

```python
from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session
from app.core.db import get_db
from app.core.security import AuthDependencies
from app.models.database import User

router = APIRouter()

@router.get("/my-profile")
async def get_my_profile(
    request: Request,
    db: Session = Depends(get_db)
):
    """Get authenticated user's profile."""
    # This validates the Authorization header and extracts user_id
    user_id = await AuthDependencies.get_current_user_from_header(request)
    
    # Now we know user_id is valid and trusted
    user = db.query(User).filter(User.id == user_id).first()
    return {"id": user.id, "email": user.email}
```

**Request**:
```bash
TOKEN="eyJhbGc..."
curl -H "Authorization: Bearer $TOKEN" http://localhost:8000/my-profile
```

**Response**:
```json
{
  "id": "123",
  "email": "user@example.com"
}
```

---

## Pattern 2: Add Rate Limiting to an Endpoint

### Scenario: Protect API from abuse

```python
from fastapi import APIRouter, Request
from app.core.security import get_limiter
from app.core.config import settings

router = APIRouter()
limiter = get_limiter()

# Option 1: Use predefined limits
@router.post("/api-call")
@limiter.limiter.limit(settings.RATE_LIMIT_API)  # 100/minute
async def api_call(request: Request):
    return {"status": "ok"}

# Option 2: Custom limit per endpoint
@router.post("/expensive-operation")
@limiter.limiter.limit("5/minute")  # Stricter for expensive ops
async def expensive_operation(request: Request):
    return {"status": "processing"}

# Option 3: Very strict for sensitive operations
@router.post("/delete-account")
@limiter.limiter.limit("1/hour")  # Only 1 per hour
async def delete_account(request: Request, user_id: str = Depends(...)):
    return {"status": "account deleted"}
```

**Behavior**:
```bash
# First 5 requests succeed
curl http://localhost:8000/expensive-operation  # 200 OK

# 6th request gets rate limited
curl http://localhost:8000/expensive-operation
# HTTP 429 Too Many Requests
# {
#   "error": "Too Many Requests",
#   "detail": "Rate limit exceeded.",
#   "retry_after": "47"
# }
```

---

## Pattern 3: Log Security Events for Audit Trail

### Scenario: Track suspicious activity

```python
from app.core.security import log_security_event
import logging

logger = logging.getLogger(__name__)

# When user registers
log_security_event(
    "user_registered",
    {
        "user_id": "123",
        "email": "test@example.com",
        "ip_address": request.client.host,
    }
)

# When login fails
log_security_event(
    "login_failed",
    {
        "email": "test@example.com",
        "reason": "invalid_password",
        "ip_address": request.client.host,
        "user_agent": request.headers.get("user-agent"),
    },
    severity="WARNING"
)

# When suspicious activity detected
log_security_event(
    "suspicious_activity",
    {
        "user_id": "123",
        "activity": "multiple_failed_logins",
        "count": 15,
        "ip_address": "192.168.1.100",
    },
    severity="CRITICAL"
)

# View logs
# In application output:
# [INFO] user_registered: {"user_id": "123", "email": "test@example.com", ...}
# [WARNING] login_failed: {"email": "test@example.com", "reason": "invalid_password", ...}
# [CRITICAL] suspicious_activity: {"user_id": "123", "activity": "multiple_failed_logins", ...}
```

---

## Pattern 4: Validate Bearer Token Manually

### Scenario: Advanced authentication logic

```python
from fastapi import Request, HTTPException, status
from app.core.security import TokenValidator

async def validate_bearer_token(request: Request) -> str:
    """Extract and validate bearer token."""
    auth_header = request.headers.get("Authorization")
    
    if not auth_header:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing Authorization header"
        )
    
    # Ensure it's Bearer format
    parts = auth_header.split()
    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Authorization header format"
        )
    
    token = parts[1]
    
    # TokenValidator handles all validation
    payload = TokenValidator.validate_access_token(token)
    
    return payload.get("sub")  # user_id

# Usage:
@router.get("/protected")
async def protected_endpoint(
    request: Request,
    db: Session = Depends(get_db)
):
    user_id = await validate_bearer_token(request)
    user = db.query(User).filter(User.id == user_id).first()
    return {"user": user}
```

---

## Pattern 5: Configure CORS for Different Environments

### Scenario: Deploy to multiple environments

```python
# .env.development
ENVIRONMENT=development

# .env.staging
ENVIRONMENT=staging
CORS_ORIGINS_PROD=https://staging.app.example.com

# .env.production
ENVIRONMENT=production
CORS_ORIGINS_PROD=https://app.example.com,https://www.app.example.com,https://admin.app.example.com

# App automatically configures CORS based on environment
from app.core.security import CORSConfig

origins = CORSConfig.get_allowed_origins()
# Development: ['http://localhost:3000', 'http://localhost:5173', ...]
# Production: ['https://app.example.com', 'https://www.app.example.com', ...]
```

---

## Pattern 6: Create Secure JWT Tokens

### Scenario: Generate tokens with proper configuration

```python
from datetime import datetime, timedelta
import jwt
from app.core.config import settings

def create_access_token(user_id: str) -> str:
    """Create short-lived access token."""
    expire = datetime.utcnow() + timedelta(hours=24)
    payload = {
        "sub": user_id,
        "exp": expire,
        "iat": datetime.utcnow(),
        "type": "access"  # Important: token type
    }
    
    token = jwt.encode(
        payload,
        settings.secret_key,
        algorithm=settings.JWT_ALGORITHM
    )
    return token

def create_refresh_token(user_id: str) -> str:
    """Create long-lived refresh token."""
    expire = datetime.utcnow() + timedelta(days=7)
    payload = {
        "sub": user_id,
        "exp": expire,
        "iat": datetime.utcnow(),
        "type": "refresh"  # Important: different type
    }
    
    token = jwt.encode(
        payload,
        settings.secret_key,
        algorithm=settings.JWT_ALGORITHM
    )
    return token

# Usage:
@router.post("/login")
async def login(email: str, password: str):
    # Verify credentials
    user = authenticate_user(email, password)
    
    # Create tokens with different types
    access_token = create_access_token(user.id)
    refresh_token = create_refresh_token(user.id)
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }
```

---

## Pattern 7: Implement Admin-Only Routes

### Scenario: Restrict access to admin users

```python
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.models.database import User

async def get_admin_user(
    request: Request,
    db: Session = Depends(get_db)
) -> User:
    """Verify user is admin."""
    from app.core.security import AuthDependencies
    
    # First validate authentication
    user_id = await AuthDependencies.get_current_user_from_header(request)
    
    # Then check admin status
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    
    if not user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    
    return user

# Usage:
@router.get("/admin/users")
async def get_all_users(admin: User = Depends(get_admin_user)):
    """Only admins can see all users."""
    all_users = db.query(User).all()
    return all_users

@router.delete("/admin/users/{user_id}")
async def delete_user(
    user_id: str,
    admin: User = Depends(get_admin_user)
):
    """Only admins can delete users."""
    user = db.query(User).filter(User.id == user_id).first()
    db.delete(user)
    db.commit()
    return {"deleted": user_id}
```

---

## Pattern 8: Handle Rate Limiting Gracefully

### Scenario: Frontend responds to rate limiting

```typescript
// Frontend (TypeScript)
async function makeApiCall(url: string, options: any) {
  const response = await fetch(url, options);
  
  if (response.status === 429) {
    // Rate limited - wait before retrying
    const retryAfter = response.headers.get("Retry-After") || "60";
    const waitSeconds = parseInt(retryAfter);
    
    console.warn(`Rate limited. Retrying in ${waitSeconds}s...`);
    
    // Show user message
    showNotification(
      `Too many requests. Please wait ${waitSeconds} seconds.`,
      "warning"
    );
    
    // Retry after delay
    await sleep(waitSeconds * 1000);
    return makeApiCall(url, options);
  }
  
  return response;
}

// Exponential backoff for robust retries
async function makeApiCallWithBackoff(
  url: string,
  options: any,
  maxRetries = 3
) {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, options);
      
      if (response.status === 429) {
        if (attempt < maxRetries) {
          const delay = Math.pow(2, attempt - 1) * 1000;
          await sleep(delay);
          continue;
        }
      }
      
      return response;
    } catch (error) {
      lastError = error;
      const delay = Math.pow(2, attempt - 1) * 1000;
      if (attempt < maxRetries) {
        await sleep(delay);
      }
    }
  }
  
  throw lastError;
}
```

---

## Pattern 9: Setup Environment Variables Safely

### Scenario: Securely load secrets in production

```bash
#!/bin/bash
# deploy.sh - Production deployment script

set -e

# Load environment variables
if [ -f .env.production ]; then
    export $(cat .env.production | grep -v '^#' | xargs)
fi

# Validate critical settings
if [ "$ENVIRONMENT" != "production" ]; then
    echo "ERROR: Not in production mode"
    exit 1
fi

if [ "$SECRET_KEY" == "change-this-in-production" ]; then
    echo "ERROR: SECRET_KEY not changed"
    exit 1
fi

if [ -z "$CORS_ORIGINS_PROD" ]; then
    echo "ERROR: CORS_ORIGINS_PROD not set"
    exit 1
fi

# Verify no wildcards in CORS
if echo "$CORS_ORIGINS_PROD" | grep -q "\*"; then
    echo "ERROR: Wildcard (*) not allowed in CORS_ORIGINS_PROD"
    exit 1
fi

echo "Security checks passed. Starting application..."

# Start with strict security
python -m uvicorn app.main:app \
    --host 0.0.0.0 \
    --port 8000 \
    --workers 4 \
    --access-log \
    --log-level info
```

---

## Pattern 10: Monitor for Suspicious Activity

### Scenario: Alert on security events

```python
import logging
from collections import defaultdict
from datetime import datetime, timedelta

class SecurityMonitor:
    """Monitor for suspicious patterns."""
    
    def __init__(self):
        self.failed_logins = defaultdict(list)  # email -> [timestamps]
        self.rate_limit_hits = defaultdict(list)  # ip -> [timestamps]
    
    def record_failed_login(self, email: str):
        """Track failed login attempts."""
        now = datetime.utcnow()
        self.failed_logins[email].append(now)
        
        # Remove old entries (older than 5 minutes)
        cutoff = now - timedelta(minutes=5)
        self.failed_logins[email] = [
            ts for ts in self.failed_logins[email] if ts > cutoff
        ]
        
        # Alert if too many failures
        if len(self.failed_logins[email]) >= 5:
            log_security_event(
                "brute_force_detected",
                {
                    "email": email,
                    "failed_attempts": len(self.failed_logins[email]),
                    "time_window": "5 minutes"
                },
                severity="CRITICAL"
            )
            # Could also lock account, notify admin, etc.
    
    def record_rate_limit_hit(self, ip_address: str):
        """Track rate limit violations."""
        now = datetime.utcnow()
        self.rate_limit_hits[ip_address].append(now)
        
        # Remove old entries
        cutoff = now - timedelta(minutes=10)
        self.rate_limit_hits[ip_address] = [
            ts for ts in self.rate_limit_hits[ip_address] if ts > cutoff
        ]
        
        # Alert if repeated violations
        if len(self.rate_limit_hits[ip_address]) >= 10:
            log_security_event(
                "repeated_rate_limit_violations",
                {
                    "ip_address": ip_address,
                    "violations": len(self.rate_limit_hits[ip_address]),
                    "time_window": "10 minutes"
                },
                severity="WARNING"
            )
            # Could block IP, require CAPTCHA, etc.

# Usage:
monitor = SecurityMonitor()

@router.post("/login")
async def login(req: LoginRequest):
    user = db.query(User).filter(User.email == req.email).first()
    
    if not user or not verify_password(req.password, user.password_hash):
        monitor.record_failed_login(req.email)  # NEW: Track failure
        raise HTTPException(401)
    
    return token
```

---

## Best Practices Summary

✅ **DO**:
- Use Bearer tokens in Authorization headers
- Validate token type (access vs refresh)
- Rate limit authentication endpoints stricter
- Log all security events
- Use environment variables for secrets
- Whitelist specific CORS origins
- Validate requests on every single endpoint
- Keep tokens short-lived (24h max for access)
- Store refresh tokens server-side
- Monitor logs for suspicious patterns

❌ **DON'T**:
- Put tokens in URL query parameters
- Accept wildcard CORS origins with credentials
- Hardcode secrets
- Use same token for all purposes
- Log sensitive data (tokens, passwords)
- Accept unlimited requests
- Trust client-side validation
- Keep access tokens for more than 24 hours
- Use HTTP (not HTTPS) in production
- Ignore security logs

---

## Testing All Security Features

```bash
#!/bin/bash
# test-security.sh

echo "Testing Rate Limiting..."
for i in {1..15}; do
  curl -s -X POST http://localhost:8000/api/auth/login \
    -d '{"email":"test@example.com","password":"wrong"}' \
    | grep -q "429" && echo "✓ Rate limited on attempt $i" && break
done

echo "Testing Authentication..."
curl -s http://localhost:8000/api/auth/me | grep -q "401" && echo "✓ Authentication enforced"

echo "Testing CORS..."
curl -s -H "Origin: https://evil.example.com" http://localhost:8000/api/health \
  | grep -q "Access-Control-Allow-Origin" && echo "✗ CORS not restricted" || echo "✓ CORS restricted"

echo "All tests completed!"
```

---

Save this file for quick reference when implementing security features!
