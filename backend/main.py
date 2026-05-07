from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Depends, Request
# Force reload to apply DB fix
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from pydantic import BaseModel, EmailStr
from typing import Optional, List, Dict, Any
from contextlib import asynccontextmanager
import shutil
import os
import asyncio
from dotenv import load_dotenv

load_dotenv()

from database import init_db
from auth_utils import verify_password, get_password_hash, create_access_token, SECRET_KEY, ALGORITHM
from models import User, InterviewSession, Question, Answer, SessionStatus, Scores, Feedback

from modules.resume_parser import parse_resume
from modules.jd_analyzer import analyze_jd
from modules.question_generator import generate_questions
from modules.audio_processor import evaluate_audio
from modules.semantic import evaluate_answer_correctness
from modules.nlp_evaluator import evaluate_communication_quality
from modules.feedback_engine import evaluate_full_answer


# ───────────────────────────────────────────
# APP LIFESPAN (MongoDB init on startup)
# ───────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    print("MongoDB connected & Beanie initialized")
    yield
    print("Shutting down...")


limiter = Limiter(key_func=get_remote_address)
app = FastAPI(
    title="Evalify API",
    description="AI-powered mock interview backend with MongoDB",
    version="2.0.0",
    lifespan=lifespan,
)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,http://localhost:3000").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


# ───────────────────────────────────────────
# SCHEMAS (request/response models)
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


class GoogleLoginRequest(BaseModel):
    credential: str


class AnalyzeJDRequest(BaseModel):
    jd_text: Optional[str] = ""
    job_role: Optional[str] = ""


class GenerateQuestionsRequest(BaseModel):
    resume_data: dict
    jd_data: dict
    difficulty: Optional[str] = "medium"


class StartSessionRequest(BaseModel):
    resume_data: dict
    jd_data: dict
    difficulty: Optional[str] = "medium"
    answer_mode: Optional[str] = "type"


class SaveAnswerRequest(BaseModel):
    session_id: str
    question_id: str
    candidate_answer: str
    reference_answer: Optional[str] = ""
    scores: Optional[Dict[str, Any]] = {}
    feedback: Optional[Dict[str, Any]] = {}


class CompleteSessionRequest(BaseModel):
    final_score: float


from fastapi.security import OAuth2PasswordBearer
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from auth_utils import decode_access_token

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

# ───────────────────────────────────────────
# AUTH DEPENDENCY
# ───────────────────────────────────────────
async def get_current_user(token: str = Depends(oauth2_scheme)):
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    
    email = payload.get("sub")
    if not email:
        raise HTTPException(status_code=401, detail="Invalid token payload")
        
    user = await User.find_one(User.email == email)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


# ───────────────────────────────────────────
# AUTH ENDPOINTS
# ───────────────────────────────────────────
@app.post("/signup", response_model=Token)
async def signup(user_data: UserCreate):
    # Check email
    existing_email = await User.find_one(User.email == user_data.email)
    if existing_email:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Check username (name)
    existing_name = await User.find_one(User.name == user_data.name)
    if existing_name:
        raise HTTPException(status_code=400, detail="Username already taken")

    hashed_pwd = get_password_hash(user_data.password)
    new_user = User(
        name=user_data.name,
        email=user_data.email,
        hashed_password=hashed_pwd,
    )
    await new_user.insert()

    access_token = create_access_token(data={"sub": new_user.email})
    return {"access_token": access_token, "token_type": "bearer"}


@app.post("/login", response_model=Token)
async def login(user_data: UserLogin):
    db_user = await User.find_one(User.email == user_data.email)
    if not db_user or db_user.hashed_password == "---" or not verify_password(user_data.password, db_user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect email or password")

    access_token = create_access_token(data={"sub": db_user.email})
    return {"access_token": access_token, "token_type": "bearer"}


@app.post("/google-login", response_model=Token)
async def google_login(req: GoogleLoginRequest):
    try:
        # Verify the Google token
        client_id = os.getenv("GOOGLE_CLIENT_ID")
        idinfo = id_token.verify_oauth2_token(req.credential, google_requests.Request(), client_id)
        
        email = idinfo['email']
        name = idinfo.get('name', 'Google User')
        
        user = await User.find_one(User.email == email)
        if not user:
            user = User(
                name=name,
                email=email,
                hashed_password="---", # Password-less for Google users
            )
            await user.insert()
            
        access_token = create_access_token(data={"sub": user.email})
        return {"access_token": access_token, "token_type": "bearer"}
    except Exception as e:
        print(f"Google login error: {e}")
        raise HTTPException(status_code=400, detail="Invalid Google credentials")


@app.get("/me")
async def get_me(user: User = Depends(get_current_user)):
    return {
        "id": str(user.id),
        "name": user.name,
        "email": user.email,
        "resume_data": user.resume_data,
        "created_at": user.created_at,
    }

@app.post("/save-resume")
async def save_resume(resume_data: dict, user: User = Depends(get_current_user)):
    """Saves parsed resume data to user profile for future use."""
    user.resume_data = resume_data
    await user.save()
    return {"message": "Resume data archived in profile"}

class UpdateProfileRequest(BaseModel):
    name: str

@app.post("/update-profile")
async def update_profile(req: UpdateProfileRequest, user: User = Depends(get_current_user)):
    """
    Updates basic user profile info with uniqueness check.
    """
    if len(req.name.strip()) < 2:
        raise HTTPException(status_code=400, detail="Name must be at least 2 characters")

    if req.name != user.name:
        existing = await User.find_one(User.name == req.name)
        if existing:
            raise HTTPException(status_code=400, detail="Username already taken by another operative")
    
    user.name = req.name
    await user.save()
    return {"message": "Profile updated successfully", "name": user.name}

class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str

@app.post("/change-password")
async def change_password(req: ChangePasswordRequest, user: User = Depends(get_current_user)):
    """Securely change password by verifying current one first."""
    if not verify_password(req.current_password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Current password incorrect")
    
    if len(req.new_password) < 8:
        raise HTTPException(status_code=400, detail="New password must be at least 8 characters")
    
    user.hashed_password = get_password_hash(req.new_password)
    await user.save()
    return {"message": "Password updated successfully"}

@app.delete("/delete-account")
async def delete_account(user: User = Depends(get_current_user)):
    """Permanently delete user and all associated data."""
    user_id_str = str(user.id)
    
    # 1. Delete all answers
    await Answer.find(Answer.user_id == user_id_str).delete()
    # 2. Delete all questions
    await Question.find(Question.user_id == user_id_str).delete()
    # 3. Delete all sessions
    await InterviewSession.find(InterviewSession.user_id == user_id_str).delete()
    # 4. Delete user profile
    await user.delete()
    
    return {"message": "Account terminated successfully"}




# ───────────────────────────────────────────
# SESSION MANAGEMENT (NEW)
# ───────────────────────────────────────────
@app.post("/start-session")
async def start_session(req: StartSessionRequest, user: User = Depends(get_current_user)):
    """
    Creates a new interview session, generates questions,
    saves everything to MongoDB, and returns session_id + questions.
    """
    try:
        # 1. Generate questions via LLM (wrapped in thread to avoid blocking)
        questions = await asyncio.to_thread(
            generate_questions,
            resume_data=req.resume_data,
            jd_data=req.jd_data,
            difficulty=req.difficulty,
        )

        # 2. Create session document
        session = InterviewSession(
            user_id=str(user.id),
            resume_data=req.resume_data,
            jd_data=req.jd_data,
            difficulty=req.difficulty,
            answer_mode=req.answer_mode,
            total_questions=len(questions),
            status=SessionStatus.ongoing,
        )
        await session.insert()

        # 3. Save each question to DB
        saved_questions = []
        for i, q in enumerate(questions):
            q_text = q.get("question", q) if isinstance(q, dict) else str(q)
            q_type = q.get("type", "technical") if isinstance(q, dict) else "technical"
            q_topic = q.get("topic", "") if isinstance(q, dict) else ""

            question_doc = Question(
                session_id=str(session.id),
                user_id=str(user.id),
                question=q_text,
                type=q_type,
                topic=q_topic,
                order=i + 1,
            )
            await question_doc.insert()
            saved_questions.append({
                "id": str(question_doc.id),
                "question": q_text,
                "type": q_type,
                "topic": q_topic,
                "order": i + 1,
            })

        return {
            "session_id": str(session.id),
            "questions": saved_questions,
            "total_questions": len(saved_questions),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/save-answer")
async def save_answer(req: SaveAnswerRequest, user: User = Depends(get_current_user)):
    """
    Saves a single evaluated answer to the answers collection.
    Called from the Results page after each answer is evaluated.
    """
    # Map scores dict to Scores model
    scores_obj = Scores(
        correctness=req.scores.get("correctness", 0),
        ai_judge=req.scores.get("ai_judge", 0),
        similarity=req.scores.get("similarity", 0),
        keyword_coverage=req.scores.get("keyword_coverage", 0),
        communication=req.scores.get("communication", 0),
        grammar=req.scores.get("grammar", 0),
        clarity=req.scores.get("clarity", 0),
        professionalism=req.scores.get("professionalism", 0),
        length=req.scores.get("length", 0),
        delivery=req.scores.get("delivery", 0),
        final=req.scores.get("final", req.scores.get("final_score", 0)),
    )

    # Map feedback dict to Feedback model
    feedback_obj = Feedback(
        strengths=req.feedback.get("strengths", []),
        weaknesses=req.feedback.get("weaknesses", []),
        improvement_tips=req.feedback.get("improvement_tips", []),
        overall_summary=req.feedback.get("overall_summary", ""),
    )

    answer = Answer(
        session_id=req.session_id,
        question_id=req.question_id,
        user_id=str(user.id),
        candidate_answer=req.candidate_answer,
        reference_answer=req.reference_answer,
        scores=scores_obj,
        feedback=feedback_obj,
    )
    await answer.insert()

    return {"message": "Answer saved", "answer_id": str(answer.id)}


@app.post("/complete-session/{session_id}")
async def complete_session(session_id: str, req: CompleteSessionRequest, user: User = Depends(get_current_user)):
    """
    Marks a session as completed and stores the final score.
    """
    session = await InterviewSession.get(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    session.status = SessionStatus.completed
    session.final_score = req.final_score
    await session.save()

    return {"message": "Session completed", "final_score": req.final_score}


@app.get("/sessions")
async def get_sessions(user: User = Depends(get_current_user)):
    """
    Returns all sessions for the current user.
    """
    sessions = await InterviewSession.find(
        InterviewSession.user_id == str(user.id)
    ).sort(-InterviewSession.created_at).to_list()

    result = []
    for s in sessions:
        # Fallback for job role if jd_data is missing
        job_role = s.jd_data.get("job_role") if s.jd_data else None
        if not job_role:
            job_role = "General Interview"

        result.append({
            "id": str(s.id),
            "created_at": s.created_at,
            "status": s.status,
            "difficulty": s.difficulty,
            "job_role": job_role,
            "final_score": s.final_score,
            "overall_score": s.final_score or 0,
            "total_questions": s.total_questions,
            "answer_mode": s.answer_mode,
        })
    return result


@app.get("/sessions/{session_id}")
async def get_session_detail(session_id: str, user: User = Depends(get_current_user)):
    """
    Returns full session details including questions and answers.
    """
    session = await InterviewSession.get(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    questions = await Question.find(
        Question.session_id == session_id
    ).sort(Question.order).to_list()

    answers = await Answer.find(
        Answer.session_id == session_id
    ).to_list()

    # Map answers by question_id for easy lookup
    answers_map = {a.question_id: a for a in answers}

    questions_with_answers = []
    for q in questions:
        q_id = str(q.id)
        ans = answers_map.get(q_id)
        questions_with_answers.append({
            "id": q_id,
            "question": q.question,
            "type": q.type,
            "topic": q.topic,
            "order": q.order,
            "answer": {
                "candidate_answer": ans.candidate_answer if ans else "",
                "reference_answer": ans.reference_answer if ans else "",
                "scores": ans.scores.model_dump() if ans else {},
                "feedback": ans.feedback.model_dump() if ans else {},
                "answered_at": ans.answered_at if ans else None,
            } if ans else None,
        })

    return {
        "id": str(session.id),
        "created_at": session.created_at,
        "status": session.status,
        "resume_data": session.resume_data,
        "jd_data": session.jd_data,
        "difficulty": session.difficulty,
        "answer_mode": session.answer_mode,
        "final_score": session.final_score,
        "total_questions": session.total_questions,
        "questions": questions_with_answers,
    }


# ───────────────────────────────────────────
# BACKWARD COMPAT: /history & /save-result
# ───────────────────────────────────────────
@app.get("/history")
async def get_history(user: User = Depends(get_current_user)):
    """Backward-compatible history endpoint — wraps /sessions."""
    sessions = await InterviewSession.find(
        InterviewSession.user_id == str(user.id)
    ).sort(-InterviewSession.created_at).to_list()

    return [
        {
            "id": str(s.id),
            "job_role": s.jd_data.get("job_role", "General Interview"),
            "difficulty": s.difficulty,
            "overall_score": s.final_score or 0,
            "created_at": s.created_at,
            "status": s.status,
        }
        for s in sessions
    ]


# ───────────────────────────────────────────
# 1. PARSE RESUME
# ───────────────────────────────────────────
@app.post("/parse-resume")
async def parse_resume_endpoint(file: UploadFile = File(...)):
    """
    Accepts a PDF resume, extracts text, and returns
    structured data (name, skills, projects, experience, education).
    """
    file_path = os.path.join(UPLOAD_DIR, file.filename)
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        result = await asyncio.to_thread(parse_resume, file_path)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
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
        result = await asyncio.to_thread(analyze_jd, jd_text=req.jd_text, job_role=req.job_role)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ───────────────────────────────────────────
# 3. GENERATE QUESTIONS (standalone, no session)
# ───────────────────────────────────────────
@app.post("/generate-questions")
async def generate_questions_endpoint(req: GenerateQuestionsRequest):
    """
    Uses resume + JD data + difficulty to generate
    personalized interview questions via LLM.
    Standalone — use /start-session for full DB integration.
    """
    try:
        questions = await asyncio.to_thread(
            generate_questions,
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
@limiter.limit("100/hour")
async def evaluate_text_endpoint(
    request: Request,
    question: str = Form(...),
    answer: str = Form(...),
):
    """
    Evaluates a typed answer against the question using
    3-layer scoring (AI judge + semantic + keyword) + NLP communication quality.
    """
    if len(answer) > 2000:
        raise HTTPException(status_code=400, detail="Answer is too long. Please keep it under 2000 characters.")

    try:
        semantic_res = await asyncio.to_thread(evaluate_answer_correctness, question, answer)
        nlp_res = await asyncio.to_thread(evaluate_communication_quality, answer, question)

        result = await asyncio.to_thread(
            evaluate_full_answer,
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

        audio_res = await asyncio.to_thread(evaluate_audio, file_path)
        text_answer = audio_res["transcription"]

        semantic_res = await asyncio.to_thread(evaluate_answer_correctness, question, text_answer)
        nlp_res = await asyncio.to_thread(evaluate_communication_quality, text_answer, question)

        result = await asyncio.to_thread(
            evaluate_full_answer,
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
        return await asyncio.to_thread(evaluate_audio, file_path)
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
    return {"status": "ok", "database": "mongodb"}