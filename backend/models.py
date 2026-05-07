from beanie import Document, Indexed
from pydantic import BaseModel, EmailStr, Field
from typing import Optional, Dict, Any, List
from datetime import datetime
from enum import Enum


# ───────────────────────────────────────────
# SUB-MODELS (embedded documents)
# ───────────────────────────────────────────
class Scores(BaseModel):
    correctness: float = 0
    ai_judge: float = 0
    similarity: float = 0
    keyword_coverage: float = 0
    communication: float = 0
    grammar: float = 0
    clarity: float = 0
    professionalism: float = 0
    length: float = 0
    delivery: float = 0
    final: float = 0


class Feedback(BaseModel):
    strengths: List[str] = []
    weaknesses: List[str] = []
    improvement_tips: List[str] = []
    overall_summary: str = ""


class SessionStatus(str, Enum):
    ongoing = "ongoing"
    completed = "completed"


# ───────────────────────────────────────────
# DOCUMENT MODELS (MongoDB collections)
# ───────────────────────────────────────────
class User(Document):
    name: Indexed(str, unique=True)
    email: Indexed(EmailStr, unique=True)
    hashed_password: str
    resume_data: Optional[Dict[str, Any]] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "users"


class InterviewSession(Document):
    user_id: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    status: SessionStatus = SessionStatus.ongoing

    # Setup data
    resume_data: Dict[str, Any] = {}
    jd_data: Dict[str, Any] = {}
    difficulty: str = "medium"
    answer_mode: str = "type"

    # Results (populated on completion)
    final_score: Optional[float] = None
    total_questions: int = 0

    class Settings:
        name = "sessions"


class Question(Document):
    session_id: str
    user_id: str
    question: str
    type: str = "technical"
    topic: str = ""
    order: int = 1

    class Settings:
        name = "questions"


class Answer(Document):
    session_id: str
    question_id: str
    user_id: str
    candidate_answer: str = ""
    reference_answer: str = ""
    scores: Scores = Field(default_factory=Scores)
    feedback: Feedback = Field(default_factory=Feedback)
    answered_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "answers"
