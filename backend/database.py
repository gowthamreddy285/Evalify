from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
import os
import motor.core

# HACK: Beanie 2.1.0 / Motor 3.x Compatibility
# In Python 3.13 + Motor 3.x, Beanie 2.1.0 hits a "MotorDatabase object is not callable" error.
# This monkey patch allows the database object to be callable, satisfying Beanie's internal logic.
if not hasattr(motor.core.AgnosticDatabase, "__call__") or motor.core.AgnosticDatabase.__call__ == object.__call__:
    motor.core.AgnosticDatabase.__call__ = lambda self, *args, **kwargs: self

# Also add append_metadata to AgnosticClient if missing
if not hasattr(motor.core.AgnosticClient, 'append_metadata'):
    motor.core.AgnosticClient.append_metadata = lambda self, x: None

async def init_db():
    """Initialize Beanie ODM with all document models. Call once at app startup."""
    from models import User, InterviewSession, Question, Answer
    
    uri = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
    db_name = os.getenv("MONGODB_DB_NAME", "evalify")
    
    print(f"Connecting to MongoDB: {uri} (DB: {db_name})")
    
    client = AsyncIOMotorClient(uri)
    
    # Add dummy append_metadata to client if missing (required by Beanie 2.1.0)
    if not hasattr(client, 'append_metadata'):
        client.append_metadata = lambda x: None
        
    database = client[db_name]
    
    await init_beanie(
        database=database,
        document_models=[User, InterviewSession, Question, Answer],
    )
    print(f"Beanie initialized successfully (DB: {db_name})")
