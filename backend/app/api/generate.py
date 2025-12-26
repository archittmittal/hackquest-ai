"""Code generation API endpoints"""
import logging
from fastapi import APIRouter, HTTPException
from app.models.schemas import GenerateCodeRequest, GenerateCodeResponse, GeneratedCode
from app.core.database import Collections
from bson.objectid import ObjectId
import zipfile
import io
from datetime import datetime

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/generate", tags=["generate"])


# Code templates
FASTAPI_TEMPLATE = '''"""FastAPI Backend Template"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import logging

app = FastAPI(title="Generated Backend", version="1.0.0")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

logger = logging.getLogger(__name__)


class ItemBase(BaseModel):
    """Item base model"""
    title: str
    description: Optional[str] = None


class ItemCreate(ItemBase):
    """Item creation model"""
    pass


class Item(ItemBase):
    """Item response model"""
    id: int
    
    class Config:
        from_attributes = True


@app.get("/")
async def root():
    """Health check endpoint"""
    return {"status": "healthy", "message": "Backend is running"}


@app.post("/api/items", response_model=Item)
async def create_item(item: ItemCreate):
    """Create new item"""
    try:
        # TODO: Add your database logic here
        return Item(id=1, **item.dict())
    except Exception as e:
        logger.error(f"Error creating item: {e}")
        raise HTTPException(status_code=500, detail="Failed to create item")


@app.get("/api/items", response_model=List[Item])
async def get_items(skip: int = 0, limit: int = 10):
    """Get items list"""
    try:
        # TODO: Add your database query here
        return []
    except Exception as e:
        logger.error(f"Error fetching items: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch items")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
'''

REACT_TEMPLATE = '''import React, { useState, useEffect } from 'react';
import './App.css';

interface Item {
  id: number;
  title: string;
  description?: string;
}

function App() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [newItem, setNewItem] = useState({ title: '', description: '' });

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/items');
      const data = await response.json();
      setItems(data);
    } catch (error) {
      console.error('Error fetching items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateItem = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItem),
      });
      const createdItem = await response.json();
      setItems([...items, createdItem]);
      setNewItem({ title: '', description: '' });
    } catch (error) {
      console.error('Error creating item:', error);
    }
  };

  return (
    <div className="App">
      <h1>Generated React App</h1>
      <div className="form">
        <input
          type="text"
          placeholder="Title"
          value={newItem.title}
          onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
        />
        <input
          type="text"
          placeholder="Description"
          value={newItem.description}
          onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
        />
        <button onClick={handleCreateItem}>Create Item</button>
      </div>
      
      {loading ? (
        <p>Loading...</p>
      ) : (
        <ul>
          {items.map((item) => (
            <li key={item.id}>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default App;
'''

DOCKER_COMPOSE_TEMPLATE = '''version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=mongodb://mongo:27017
      - REDIS_URL=redis://redis:6379
    depends_on:
      - mongo
      - redis

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      - REACT_APP_API_URL=http://localhost:8000

  mongo:
    image: mongo:latest
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db

  redis:
    image: redis:latest
    ports:
      - "6379:6379"

volumes:
  mongo_data:
'''

REQUIREMENTS_TEMPLATE = '''fastapi==0.104.1
uvicorn==0.24.0
motor==3.3.1
pydantic==2.5.0
pydantic-settings==2.1.0
python-jose==3.3.0
passlib==1.7.4
bcrypt==4.1.1
python-multipart==0.0.6
httpx==0.25.1
pinecone-client==3.0.0
langchain==0.1.0
langgraph==0.0.9
groq==0.4.1
redis==5.0.1
pymongo==4.6.0
python-dotenv==1.0.0
'''

PACKAGE_JSON_TEMPLATE = '''{
  "name": "generated-frontend",
  "version": "0.1.0",
  "private": true,
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "axios": "^1.6.0"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  },
  "eslintConfig": {
    "extends": ["react-app"]
  },
  "browserslist": {
    "production": [">0.2%", "not dead", "not op_mini all"],
    "development": ["last 1 chrome version", "last 1 firefox version", "last 1 safari version"]
  }
}
'''


@router.post("/code", response_model=GenerateCodeResponse)
async def generate_boilerplate_code(req: GenerateCodeRequest):
    """Generate boilerplate code for hackathon"""
    try:
        # Verify hackathon exists
        hackathon = await Collections.hackathons().find_one({"_id": ObjectId(req.hackathon_id)})
        if not hackathon:
            raise HTTPException(status_code=404, detail="Hackathon not found")
        
        # Generate code
        generated = GeneratedCode(
            backend_code=FASTAPI_TEMPLATE,
            frontend_code=REACT_TEMPLATE,
            docker_compose=DOCKER_COMPOSE_TEMPLATE,
            requirements_txt=REQUIREMENTS_TEMPLATE,
            package_json=PACKAGE_JSON_TEMPLATE
        )
        
        # Create submission record
        submission = {
            "_id": ObjectId(),
            "user_id": req.user_id,
            "hackathon_id": req.hackathon_id,
            "title": hackathon["title"],
            "description": req.problem_statement,
            "repository_url": "",
            "demo_url": "",
            "technologies": req.selected_skills,
            "status": "draft",
            "generated_code": generated.dict(),
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
        }
        
        await Collections.submissions().insert_one(submission)
        
        logger.info(f"Code generated for hackathon: {req.hackathon_id}")
        
        return GenerateCodeResponse(
            success=True,
            data=generated,
            download_url=f"/api/generate/download/{str(submission['_id'])}",
            message="Code generated successfully"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Code generation error: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate code")


@router.get("/download/{submission_id}")
async def download_code(submission_id: str):
    """Download generated code as ZIP"""
    try:
        submission = await Collections.submissions().find_one({"_id": ObjectId(submission_id)})
        if not submission:
            raise HTTPException(status_code=404, detail="Submission not found")
        
        # Create ZIP file
        zip_buffer = io.BytesIO()
        with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zip_file:
            code = submission.get("generated_code", {})
            
            # Add files
            zip_file.writestr("backend/main.py", code.get("backend_code", ""))
            zip_file.writestr("frontend/App.tsx", code.get("frontend_code", ""))
            zip_file.writestr("docker-compose.yml", code.get("docker_compose", ""))
            zip_file.writestr("backend/requirements.txt", code.get("requirements_txt", ""))
            zip_file.writestr("frontend/package.json", code.get("package_json", ""))
        
        zip_buffer.seek(0)
        
        return {
            "success": True,
            "data": zip_buffer.getvalue().hex(),
            "filename": f"hackathon_{submission_id}.zip"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Download error: {e}")
        raise HTTPException(status_code=500, detail="Failed to download code")

            "skills": user_data.skills,
            "github_summary": github_summary, 
            "messages": []
        }
        
        # 3. Execute the Graph
        # The agent now matches the user based on real repo data
        final_state = await app_agent.ainvoke(initial_state)
        
        # 4. Structure the final response
        return {
            "status": "success",
            "data": {
                "recommendation": final_state.get("selected_hackathon"),
                "win_probability": final_state.get("win_probability", 0),
                "critique": final_state.get("judge_critique"),
                "boilerplate": final_state.get("boilerplate_code", {}).get("content", "")
            }
        }
        
    except Exception as e:
        print(f"❌ API Error: {str(e)}")
        # Log more details for debugging during the hackathon
        raise HTTPException(
            status_code=500, 
            detail=f"Agent execution failed: {str(e)}"
        )