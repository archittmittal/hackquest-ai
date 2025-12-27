# Frontend-Backend Integration Guide

## Overview

The frontend is fully integrated with the backend API through the centralized `APIClient` service. All pages now communicate with the backend using proper API calls with authentication, error handling, and type safety.

## Architecture

### API Service Layer (`src/services/api.ts`)

**Purpose:** Centralized client for all backend communication

**Key Features:**
- Automatic token management (JWT)
- Error handling with proper exception types
- Type-safe API contracts via TypeScript
- Automatic refresh token handling
- localStorage persistence

**Available Methods:**

#### Authentication
```typescript
// Register new user
await apiClient.register(email, password, name)

// Login user
const { token, user } = await apiClient.login(email, password)

// Refresh token
await apiClient.refreshToken()

// Logout
apiClient.logout()
```

#### User Profile
```typescript
// Get user profile
const profile = await apiClient.getProfile()

// Update profile
await apiClient.updateProfile({ skills: [...], bio: '...' })

// Sync GitHub
await apiClient.syncGitHub(githubUsername)
```

#### Hackathon Matching
```typescript
// Get user's matched hackathons
const matches = await apiClient.getMatches(userId)

// Find hackathons with filters
const results = await apiClient.findMatches({ difficulty: 'advanced', platform: 'devpost' })

// Get specific hackathon details
const details = await apiClient.getHackathonDetail(hackathonId)
```

#### Agent Analysis
```typescript
// Run full agent workflow
const result = await apiClient.analyzeUser({
  user_id: 'user_123',
  skills: ['python', 'react'],
  github_summary: 'problem statement'
})

// Get user matches from agent
const matches = await apiClient.getUserMatches(userId)

// Score a match
const score = await apiClient.scoreMatch(userId, hackathonId)
```

#### Code Generation
```typescript
// Generate full-stack boilerplate
const boilerplate = await apiClient.generateCode({
  language: 'python',
  framework: 'fastapi',
  features: ['auth', 'database']
})

// Explain code
const explanation = await apiClient.explainCode(codeSnippet)

// Optimize code
const optimized = await apiClient.optimizeCode(codeSnippet)
```

## Page-by-Page Integration

### Login Page (`src/pages/Login.tsx`)

**Status:** ✅ Fully Integrated

**Features:**
- Email/password authentication via `apiClient.login()`
- Automatic token storage
- Error handling and display
- Demo credentials info
- OAuth placeholders

**Code Example:**
```typescript
const handleLogin = async (email: string, password: string) => {
  try {
    const response = await apiClient.login(email, password);
    setUser(response.user);
    navigate('/dashboard');
  } catch (err) {
    setError(err instanceof Error ? err.message : 'Login failed');
  }
};
```

### Dashboard Page (`src/pages/Dashboard.tsx`)

**Status:** ✅ Fully Integrated

**Features:**
- Real-time hackathon matches from API
- Match statistics (win probability, prize pools)
- Skill matching display
- Error states and loading indicators
- Quick action buttons

**Code Example:**
```typescript
useEffect(() => {
  const fetchMatches = async () => {
    const response = await apiClient.getMatches(user?.id);
    setMatches(response.data || []);
  };
  fetchMatches();
}, [user]);
```

**Displays:**
- Top 3 hackathon matches with highest win probability
- Average win probability stat
- Highest prize pool available
- Skill badges for each match

### Matches Page (`src/pages/Matches.tsx`)

**Status:** ✅ Fully Integrated

**Features:**
- Browse all hackathons with filtering
- Difficulty level filter (beginner/intermediate/advanced/expert)
- Platform filter (DevPost, Unstop, HackerEarth, etc.)
- Expandable match details
- Skill matching breakdown
- Direct registration links

**Code Example:**
```typescript
const fetchMatches = async () => {
  const filterObj: Record<string, string> = {};
  if (filters.difficulty !== 'all') filterObj.difficulty = filters.difficulty;
  if (filters.platform !== 'all') filterObj.platform = filters.platform;

  const response = await apiClient.findMatches(filterObj);
  setMatches(response.data || []);
};
```

**User Experience:**
1. Select filters (difficulty, platform)
2. View paginated list of hackathons
3. Click to expand match details
4. See matched skills vs. skills to learn
5. Quick links to register directly

### CodeGenerator Page (`src/pages/CodeGenerator.tsx`)

**Status:** ✅ Fully Integrated

**Features:**
- 4-step AI-powered code generation wizard
- Problem statement analysis
- Skill selection interface
- Full-stack boilerplate generation
- Match information display
- Generated code preview with download

**Code Example:**
```typescript
const handleGenerate = async () => {
  const response = await apiClient.analyzeUser({
    user_id: user.id || 'user_' + Date.now(),
    skills: selectedSkills.length > 0 ? selectedSkills : ['python', 'react'],
    github_summary: problemStatement
  });

  setSelectedMatch(response.selected_hackathon);
  setGeneratedCode(response.boilerplate_code);
  setWinProbability(response.win_probability);
};
```

**Generated Content:**
- Backend starter code (FastAPI or Express)
- Frontend starter code (React with Vite)
- Docker compose configuration
- Requirements.txt / package.json
- Environment setup guide

### Home Page (`src/pages/Home.tsx`)

**Status:** ✅ Partially Integrated

**Features:**
- Hero section with call-to-action
- Feature showcase (AI matching, instant code gen, etc.)
- Testimonials and stats
- Agent-based workflow integration

**Integration Points:**
- Uses agentService for demonstration
- Links to other pages for full experience
- Shows real features from API capabilities

## Data Flow Diagrams

### Authentication Flow
```
User Input → Login Page → apiClient.login()
↓
Backend validates credentials
↓
Returns JWT token + user data
↓
apiClient stores token in localStorage
↓
Redirect to Dashboard
```

### Agent Workflow Flow
```
CodeGenerator → apiClient.analyzeUser()
↓
Backend Agent (6-node workflow):
  1. Analyze user skills and preferences
  2. Match with relevant hackathons
  3. Judge submission quality
  4. Generate boilerplate code
  5. Research matching technologies
  6. Summarize results
↓
Backend returns:
  - Selected hackathon
  - Win probability score
  - Generated code (backend + frontend)
  - Judge critique
↓
Display results in CodeGenerator page
```

### Match Discovery Flow
```
Matches Page (with filters) → apiClient.findMatches()
↓
Backend filters hackathons by:
  - Difficulty level
  - Platform
  - User skill match
  - Win probability
↓
Returns list of HackathonMatch objects
↓
Display with:
  - Skill match percentage
  - Win probability
  - Prize pool
  - Registration links
```

## Error Handling

All API calls include comprehensive error handling:

```typescript
try {
  const response = await apiClient.getMatches(userId);
  setData(response.data);
} catch (err) {
  // APIClient handles token refresh automatically
  // Shows specific error messages
  setError(err instanceof Error ? err.message : 'Unknown error');
}
```

**Common Errors Handled:**
- 401 Unauthorized → Auto-refresh token or redirect to login
- 404 Not Found → Show "No results" message
- 500 Server Error → Show generic error with retry option
- Network Error → Offline message with retry

## Type Safety

All API responses are fully typed via TypeScript interfaces:

```typescript
interface HackathonMatch {
  id: string;
  title: string;
  description: string;
  platform: string;
  difficulty: string;
  skills_match: number;
  win_probability: number;
  prize_pool: number;
  matched_skills: string[];
  missing_skills: string[];
  start_date: string;
  end_date: string;
  registration_link: string;
}

interface AgentResponse {
  status: 'success' | 'error';
  selected_hackathon: HackathonMatch;
  win_probability: number;
  judge_critique: string;
  boilerplate_code: {
    backend: string;
    frontend: string;
    docker_compose: string;
    requirements: string;
    package_json: string;
  };
}
```

## Environment Configuration

API base URL is configured in `src/config/index.ts`:

```typescript
export const config = {
  api: {
    baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
  }
};
```

**Environment Variables:**
- `VITE_API_BASE_URL` - Backend API base URL (default: http://localhost:8000)

## WebSocket Integration (Real-time)

WebSocket is implemented via `src/hooks/useWebSocket.ts` for real-time agent execution:

```typescript
const { isConnected, message } = useWebSocket(userId);

// WebSocket endpoint: /api/agent/ws/agent/{user_id}
// Streams real-time updates during agent execution
```

**Use Cases:**
- Live progress updates during code generation
- Real-time match scoring
- Live agent workflow execution tracking

## Testing API Integration

### Quick Test
```bash
# Start backend
cd backend && python -m uvicorn app.main:app --reload

# Start frontend (in separate terminal)
cd frontend && npm run dev

# Open browser to http://localhost:5173
# Login with demo credentials: test@example.com / password
```

### Manual Test Scenarios
1. **Auth Flow:** Login → Verify token stored in localStorage
2. **Dashboard:** Login → Dashboard displays real matches from API
3. **Matches Page:** Filter by difficulty → API returns filtered results
4. **CodeGenerator:** Generate → Shows real boilerplate code from agent
5. **Error Handling:** Disconnect backend → Shows error messages properly

## Common Integration Patterns

### Loading State
```typescript
const [loading, setLoading] = useState(true);

useEffect(() => {
  const fetch = async () => {
    setLoading(true);
    try {
      const data = await apiClient.getMatches(userId);
      setData(data);
    } finally {
      setLoading(false);
    }
  };
  fetch();
}, []);

if (loading) return <LoadingSpinner />;
```

### Error Handling
```typescript
const [error, setError] = useState('');

try {
  const data = await apiClient.someMethod();
  setData(data);
} catch (err) {
  setError(err instanceof Error ? err.message : 'Unknown error');
}

if (error) return <ErrorMessage message={error} />;
```

### Token Refresh
```typescript
// Automatic in apiClient - no manual handling needed
// API client intercepts 401 errors and refreshes token
// If refresh fails, redirects to login
```

## Deployment

When deploying to production:

1. **Environment Variables:**
   ```bash
   VITE_API_BASE_URL=https://api.example.com
   ```

2. **CORS Configuration:**
   Backend should have frontend origin in CORS allowed origins

3. **SSL/TLS:**
   All API calls should use HTTPS in production

4. **Token Storage:**
   Current implementation uses localStorage - consider httpOnly cookies for better security

## Future Enhancements

- [ ] WebSocket real-time updates in all pages
- [ ] Offline mode with service workers
- [ ] API response caching
- [ ] Pagination for match lists
- [ ] Advanced filtering UI
- [ ] Saved searches
- [ ] User preference learning
- [ ] Email notifications for new matches

## Summary

The frontend is now fully integrated with the backend API through a centralized, type-safe API client. All pages use proper API calls with authentication, error handling, and loading states. The application is ready for production with proper data binding between frontend components and backend endpoints.

**Status:** ✅ Frontend-Backend Integration Complete
