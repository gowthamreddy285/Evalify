from pymongo import AsyncMongoClient
from beanie import init_beanie
import os

MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
DB_NAME = os.getenv("MONGODB_DB_NAME", "evalify")

client = AsyncMongoClient(MONGODB_URI)
db = client[DB_NAME]


async def init_db():
    """Initialize Beanie ODM with all document models. Call once at app startup."""
    from models import User, InterviewSession, Question, Answer

    await init_beanie(
        database=db,
        document_models=[User, InterviewSession, Question, Answer],
    )
