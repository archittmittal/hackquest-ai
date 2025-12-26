import motor.motor_asyncio
from pinecone import Pinecone
from app.core.config import settings

# --- MongoDB Setup ---
client = motor.motor_asyncio.AsyncIOMotorClient(settings.MONGODB_URL)
db = client[settings.DATABASE_NAME]

# --- Pinecone Setup ---
# Initialize as None first so 'import' never fails
pinecone_index = None 

try:
    # Ensure there are no spaces in your API key string
    api_key = settings.PINECONE_API_KEY.strip()
    pc = Pinecone(api_key=api_key)
    
    # Connect to the index
    pinecone_index = pc.Index(settings.PINECONE_INDEX)
    print(f"✅ Pinecone connected to index: {settings.PINECONE_INDEX}")
except Exception as e:
    print(f"❌ Pinecone Connection Error: {e}")
    print("⚠️ Check your .env file for the correct PINECONE_API_KEY")