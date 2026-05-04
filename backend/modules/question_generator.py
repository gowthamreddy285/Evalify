import json
import os
import re
from groq import Groq

# ✅ FIX 1: Correct — pass the variable NAME to os.getenv(), not the key itself
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

# Removed immediate ValueError to allow server to start.
# Validation will happen inside functions that require the key.

def get_client():
    if not GROQ_API_KEY:
        raise ValueError("GROQ_API_KEY environment variable is not set.")
    return Groq(api_key=GROQ_API_KEY)



DIFFICULTY_CONFIG = {
    "easy": {
        "description": "Basic understanding and definitions — ask what, who, when",
        "count": 10
    },
    "medium": {
        "description": "Implementation-level understanding — ask how they used it",
        "count": 10
    },
    "hard": {
        "description": "Scenario-based problem solving — debugging, edge cases",
        "count": 11
    },
    "extreme": {
        "description": "System design, scaling, and trade-offs — architect-level",
        "count": 11
    }
}


def build_prompt(resume_data, jd_data, difficulty):
    diff_config = DIFFICULTY_CONFIG[difficulty]

    skills = ", ".join(resume_data.get("skills", [])) or "Not specified"

    projects = resume_data.get("projects", [])
    projects_text = "\n".join([
        f"- {p.get('title', '')}: {p.get('description', '')}"
        for p in projects
    ]) or "No projects provided"

    experience = resume_data.get("experience", [])
    experience_text = "\n".join([
        f"- {e.get('role', '')} at {e.get('company', '')}"
        for e in experience
    ]) if experience else "No experience"

    job_role = jd_data.get("job_role", "Software Developer")
    required_skills = ", ".join(jd_data.get("required_skills", [])) or "Not specified"
    responsibilities = ", ".join(jd_data.get("responsibilities", [])) or "Not specified"

    prompt = f"""
You are a senior technical interviewer conducting a REALISTIC {difficulty.upper()} level interview.

========================
CANDIDATE PROFILE
========================
Skills: {skills}

Projects:
{projects_text}

Experience:
{experience_text}

========================
JOB DESCRIPTION
========================
Role: {job_role}
Required Skills: {required_skills}
Responsibilities: {responsibilities}

========================
DIFFICULTY: {difficulty.upper()}
Guideline: {diff_config['description']}

========================
RULES — READ CAREFULLY
========================

Generate EXACTLY {diff_config['count']} UNIQUE questions.

QUESTION DISTRIBUTION:
- 1 Introduction question (about the candidate specifically)
- 3 Skill-based questions (based on THIS candidate's specific skills above)
- 3 Project-based questions (referencing THIS candidate's actual project titles and tech)
- 3 Role/JD-based questions (based on the specific job role and responsibilities above)
- 1 Behavioral question (NOT generic — tie it to their background)

PROJECT QUESTIONS — MANDATORY:
- Must reference the EXACT project name and specific features listed above
- Must include: 1 architecture question, 1 internal working question, 1 edge-case question
- DO NOT ask "Explain your project" or "What challenges did you face"

ANTI-GENERIC RULE — CRITICAL:
- Every question must be specific to THIS candidate
- If the question could be asked to ANY random software developer → REJECT IT
- Bad: "Where do you see yourself in 5 years?" → REJECT
- Bad: "What are your strengths and weaknesses?" → REJECT
- Bad: "Tell me about a challenge you faced" → REJECT
- Good: "In your {projects[0].get('title', 'project') if projects else 'project'}, how did you handle [specific technical aspect]?"

DIVERSITY RULE:
- Start questions differently: How, Why, What happens if, Suppose, Design, Walk me through
- No two questions start the same way

========================
OUTPUT FORMAT
========================
Return ONLY a valid JSON array. No explanation, no markdown, no extra text.

[
  {{
    "question": "the full interview question",
    "type": "intro | skill | project | role | behavioral",
    "topic": "the specific skill or concept being tested"
  }}
]
"""
    return prompt


def call_llm(prompt):
    client = get_client()
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.4
    )

    text = response.choices[0].message.content.strip()
    text = text.replace("```json", "").replace("```", "").strip()
    return text


def parse_json_safe(text):
    # ✅ FIX 3: Catch specific exception, not bare except
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        return None


def generate_questions(resume_data: dict, jd_data: dict, difficulty: str = "medium") -> list:
    """
    MAIN FUNCTION — generates personalized interview questions.

    Args:
        resume_data : output from parse_resume()
        jd_data     : output from analyze_jd()
        difficulty  : easy / medium / hard / extreme

    Returns:
        list of question dicts with keys: question, type, topic
    """
    if difficulty not in DIFFICULTY_CONFIG:
        difficulty = "medium"

    prompt = build_prompt(resume_data, jd_data, difficulty)

    for attempt in range(3):
        response_text = call_llm(prompt)
        questions = parse_json_safe(response_text)

        if questions and isinstance(questions, list) and len(questions) > 0:
            return questions

        print(f"[question_generator] Attempt {attempt + 1} failed, retrying...")

    raise ValueError("Failed to generate valid questions after 3 attempts. Check GROQ_API_KEY and resume/JD data.")


# ── Quick test ────────────────────────────────────────────────────
if __name__ == "__main__":
    resume_data = {
        "skills": ["Python", "NLP", "React", "FastAPI", "sentence-transformers"],
        "projects": [
            {
                "title": "Mock Interview Platform",
                "description": "Web-based system that generates interview questions using resume + JD, uses sentence transformers for semantic similarity scoring, evaluates grammar using spaCy and LanguageTool, provides detailed scoring and feedback. Built with Python FastAPI backend and React frontend."
            }
        ],
        "experience": []
    }

    jd_data = {
        "job_role": "Backend Developer",
        "required_skills": ["Python", "REST APIs", "Machine Learning"],
        "responsibilities": [
            "Design scalable backend systems",
            "Build and secure REST APIs",
            "Optimize backend performance"
        ]
    }

    questions = generate_questions(resume_data, jd_data, "hard")
    print(json.dumps(questions, indent=2))
