import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

async def debug_init():
    load_dotenv()
    print("Surgical Inspection of Motor Objects...")
    
    uri = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
    client = AsyncIOMotorClient(uri)
    db_name = os.getenv("MONGODB_DB_NAME", "evalify")
    db = client[db_name]
    
    print(f"Type of db: {type(db)}")
    try:
        c = db.client
        print(f"Type of db.client: {type(c)}")
        print(f"Attributes of db.client: {[a for a in dir(c) if 'metadata' in a.lower()]}")
    except Exception as e:
        print(f"FAILED to access db.client: {e}")

    try:
        from beanie import init_beanie
        from models import User, InterviewSession, Question, Answer
        
        # Monkey patch the CLASS to make it callable just in case
        from motor.core import AgnosticDatabase
        AgnosticDatabase.__call__ = lambda self, *args, **kwargs: self
        print("Monkey patched AgnosticDatabase.__call__")

        await init_beanie(
            database=db,
            document_models=[User, InterviewSession, Question, Answer],
        )
        print("init_beanie() COMPLETED SUCCESSFULLY")
    except Exception as e:
        print(f"ERROR: init_beanie() failed with: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(debug_init())
