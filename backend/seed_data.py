import asyncio
from app.core.database import pinecone_index
from app.utils.vectorizer import vector_engine

async def seed_hackathons():
    print("🌱 Seeding Pinecone with sample hackathons...")
    
    samples = [
        {
            "id": "sih-ai-01",
            "title": "SIH: AI-based Crop Prediction",
            "ps": "Develop an AI model to predict crop yield based on soil and weather data using Python and IoT sensors."
        },
        {
            "id": "devpost-web3-02",
            "title": "Web3 Security Shield",
            "ps": "Build a real-time dashboard to monitor smart contract vulnerabilities using React, ethers.js, and Solidity."
        },
        {
            "id": "unstop-fintech-03",
            "title": "FinTech Payment Gateway",
            "ps": "Create a high-speed payment reconciliation engine using FastAPI, Redis, and PostgreSQL."
        }
    ]

    vectors_to_upsert = []
    for item in samples:
        # Create embedding from the problem statement
        vector = vector_engine.get_embedding(item["ps"])
        vectors_to_upsert.append({
            "id": item["id"],
            "values": vector,
            "metadata": {"title": item["title"], "problem_statement": item["ps"]}
        })

    # Push to Pinecone
    pinecone_index.upsert(vectors=vectors_to_upsert)
    print("✅ Successfully seeded 3 hackathons!")

if __name__ == "__main__":
    asyncio.run(seed_hackathons())