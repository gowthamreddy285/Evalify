import json
from groq import Groq
import os
GROQ_API_KEY = os.getenv("GROQ_API_KEY")


DIFFICULTY_CONFIG = {
    "easy": {
        "description": "Basic definition and concept level questions. Ask what, who, when.",
        "count": 5
    },
    "medium": {
        "description": "Application level questions. Ask how they used it in projects.",
        "count": 7
    },
    "hard": {
        "description": "Scenario based questions. Ask how they would solve real problems.",
        "count": 8
    },
    "extreme": {
        "description": "System design and architecture level questions. Deep expert knowledge required.",
        "count": 10
    }
}


def generate_questions(resume_data: dict, jd_data: dict, difficulty: str = "medium") -> list:
    """
    MAIN FUNCTION — generates personalized interview questions.
    
    Takes:
    - resume_data  → output from parse_resume()
    - jd_data      → output from analyze_jd()
    - difficulty   → easy / medium / hard / extreme
    
    Returns a list of questions with type and topic.
    """
    client = Groq(api_key=GROQ_API_KEY)

    # Get difficulty settings
    diff_config = DIFFICULTY_CONFIG.get(difficulty, DIFFICULTY_CONFIG["medium"])

    # Build context from resume
    skills = ", ".join(resume_data.get("skills", []))
    projects = resume_data.get("projects", [])
    projects_text = "\n".join([
        f"- {p['title']}: {p['description']}"
        for p in projects
    ])
    experience = resume_data.get("experience", [])
    experience_text = "\n".join([
        f"- {e['role']} at {e['company']}" 
        for e in experience
    ]) if experience else "No work experience"

    # Build context from JD
    job_role = jd_data.get("job_role", "Software Developer")
    required_skills = ", ".join(jd_data.get("required_skills", []))
    responsibilities = ", ".join(jd_data.get("responsibilities", []))

    prompt = f"""
You are an expert technical interviewer conducting a {difficulty.upper()} level interview.

Candidate Profile:
- Skills: {skills}
- Projects:
{projects_text}
- Experience: {experience_text}

Job Role: {job_role}
Required Skills: {required_skills}
Responsibilities: {responsibilities}

Difficulty Level: {difficulty.upper()}
Instructions: {diff_config['description']}

Generate exactly {diff_config['count']} interview questions for this candidate.
Mix of question types:
- Technical questions based on their skills
- Project-specific questions referencing their actual projects
- Role-specific questions based on the job requirements
- HR/behavioral questions (1-2 only)

Return ONLY a valid JSON array like this:
[
    {{
        "question": "the interview question here",
        "type": "technical" or "project" or "behavioral" or "role",
        "topic": "the skill or topic this question tests"
    }}
]

Return ONLY the JSON array. No extra text, no markdown, no explanation.
"""

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.7
    )

    response_text = response.choices[0].message.content.strip()
    response_text = response_text.replace("```json", "").replace("```", "").strip()
    questions = json.loads(response_text)
    return questions