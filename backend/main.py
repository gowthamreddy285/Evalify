from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from typing import Optional, List
import shutil
import os
from dotenv import load_dotenv
from sqlalchemy.orm import Session
from jose import JWTError, jwt

load_dotenv()

import models
from database import engine, get_db
from auth_utils import verify_password, get_password_hash, create_access_token, SECRET_KEY, ALGORITHM

# Create tables
models.Base.metadata.create_all(bind=engine)

from modules.resume_parser import parse_resume
from modules.jd_analyzer import analyze_jd
from modules.question_generator import generate_questions
from modules.audio_processor import evaluate_audio
from modules.semantic import evaluate_answer_correctness
from modules.nlp_evaluator import evaluate_communication_quality
from modules.feedback_engine import evaluate_full_answer

app = FastAPI(
    title="MockPrep API",
    description="AI-powered mock interview backend",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


# ───────────────────────────────────────────
# SCHEMAS
# ───────────────────────────────────────────
class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class AnalyzeJDRequest(BaseModel):
    jd_text: Optional[str] = ""
    job_role: Optional[str] = ""


class GenerateQuestionsRequest(BaseModel):
    resume_data: dict
    jd_data: dict
    difficulty: Optional[str] = "medium"

class SaveResultRequest(BaseModel):
    job_role: str
    difficulty: str
    overall_score: float
    details: dict

from fastapi.security import OAuth2PasswordBearer
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

# Auth Dependency
async def get_current_user(db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Invalid token")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    user = db.query(models.User).filter(models.User.email == email).first()
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")
    return user

# ───────────────────────────────────────────
# AUTH ENDPOINTS
# ───────────────────────────────────────────
@app.post("/signup", response_model=Token)
async def signup(user: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_pwd = get_password_hash(user.password)
    new_user = models.User(name=user.name, email=user.email, hashed_password=hashed_pwd)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    access_token = create_access_token(data={"sub": new_user.email})
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/login", response_model=Token)
async def login(user: UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if not db_user or not verify_password(user.password, db_user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect email or password")
    
    access_token = create_access_token(data={"sub": db_user.email})
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/me")
async def get_me(user: models.User = Depends(get_current_user)):
    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "created_at": user.created_at
    }

@app.post("/save-result")
async def save_interview_result(req: SaveResultRequest, db: Session = Depends(get_db), user: models.User = Depends(get_current_user)):
    new_result = models.InterviewResult(
        user_id=user.id,
        job_role=req.job_role,
        difficulty=req.difficulty,
        overall_score=req.overall_score,
        details=req.details
    )
    db.add(new_result)
    db.commit()
    return {"message": "Result saved successfully"}

@app.get("/history")
async def get_history(db: Session = Depends(get_db), user: models.User = Depends(get_current_user)):
    results = db.query(models.InterviewResult).filter(models.InterviewResult.user_id == user.id).order_by(models.InterviewResult.created_at.desc()).all()
    return results


# ───────────────────────────────────────────
# 1. PARSE RESUME
# ───────────────────────────────────────────
@app.post("/parse-resume")
async def parse_resume_endpoint(file: UploadFile = File(...)):
    """
    Accepts a PDF resume, extracts text, and returns
    structured data (name, skills, projects, experience, education).
    """
    # Save uploaded file
    file_path = os.path.join(UPLOAD_DIR, file.filename)
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        result = parse_resume(file_path)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        # Clean up uploaded file
        if os.path.exists(file_path):
            os.remove(file_path)


# ───────────────────────────────────────────
# 2. ANALYZE JOB DESCRIPTION
# ───────────────────────────────────────────
@app.post("/analyze-jd")
async def analyze_jd_endpoint(req: AnalyzeJDRequest):
    """
    Accepts either full JD text or just a job role title.
    Returns: job_role, required_skills, responsibilities, experience_level.
    """
    try:
        result = analyze_jd(jd_text=req.jd_text, job_role=req.job_role)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ───────────────────────────────────────────
# 3. GENERATE QUESTIONS
# ───────────────────────────────────────────
@app.post("/generate-questions")
async def generate_questions_endpoint(req: GenerateQuestionsRequest):
    """
    Uses resume + JD data + difficulty to generate
    personalized interview questions via LLM.
    """
    try:
        questions = generate_questions(
            resume_data=req.resume_data,
            jd_data=req.jd_data,
            difficulty=req.difficulty,
        )
        return {"questions": questions}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ───────────────────────────────────────────
# 4. EVALUATE TEXT ANSWER
# ───────────────────────────────────────────
@app.post("/evaluate-text")
async def evaluate_text_endpoint(
    question: str = Form(...),
    answer: str = Form(...),
):
    """
    Evaluates a typed answer against the question using
    3-layer scoring (AI judge + semantic + keyword) + NLP communication quality.
    """
    try:
        semantic_res = evaluate_answer_correctness(question, answer)
        nlp_res = evaluate_communication_quality(answer)

        result = evaluate_full_answer(
            question,
            answer,
            semantic_res,
            nlp_res,
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ───────────────────────────────────────────
# 5. EVALUATE AUDIO ANSWER
# ───────────────────────────────────────────
@app.post("/evaluate-audio")
async def evaluate_audio_endpoint(
    question: str = Form(...),
    file: UploadFile = File(...),
):
    """
    Transcribes an audio recording, then evaluates it
    the same way as text + adds delivery scoring.
    """
    file_path = os.path.join(UPLOAD_DIR, file.filename)
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        audio_res = evaluate_audio(file_path)
        text_answer = audio_res["transcription"]

        semantic_res = evaluate_answer_correctness(question, text_answer)
        nlp_res = evaluate_communication_quality(text_answer)

        result = evaluate_full_answer(
            question,
            text_answer,
            semantic_res,
            nlp_res,
            delivery_result=audio_res,
        )
        result["transcription"] = text_answer
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if os.path.exists(file_path):
            os.remove(file_path)

# ───────────────────────────────────────────
# 6. TRANSCRIBE ONLY
# ───────────────────────────────────────────
@app.post("/transcribe")
async def transcribe_endpoint(file: UploadFile = File(...)):
    """
    Transcribes audio to text and returns delivery metrics.
    No semantic evaluation performed.
    """
    file_path = os.path.join(UPLOAD_DIR, file.filename)
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        return evaluate_audio(file_path)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if os.path.exists(file_path):
            os.remove(file_path)


# ───────────────────────────────────────────
# HEALTH CHECK
# ───────────────────────────────────────────
@app.get("/health")
async def health():
    return {"status": "ok"}