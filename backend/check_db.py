import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

load_dotenv()

async def check_db():
    uri = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
    db_name = os.getenv("MONGODB_DB_NAME", "evalify")
    
    print(f"--- Connecting to {uri} ---")
    client = AsyncIOMotorClient(uri)
    db = client[db_name]
    
    collections = await db.list_collection_names()
    print(f"Collections found: {collections}")
    
    for coll_name in collections:
        count = await db[coll_name].count_documents({})
        print(f"\nCollection: {coll_name} ({count} documents)")
        
        # Show last 3 items
        cursor = db[coll_name].find().sort("_id", -1).limit(3)
        async for doc in cursor:
            # Clean up ID for printing
            doc['_id'] = str(doc['_id'])
            print(f"  - {doc}")

if __name__ == "__main__":
    asyncio.run(check_db())
