import json
import os
from groq import Groq

# ✅ FIX: Use environment variable, not hardcoded key
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

# Removed immediate ValueError to allow server to start.



def analyze_jd_with_groq(jd_text: str) -> dict:
    client = Groq(api_key=GROQ_API_KEY)

    prompt = f"""
You are a job description analyzer. Extract structured information from the job description below.

Return ONLY a valid JSON object with exactly these keys:
{{
    "job_role": "exact job title",
    "required_skills": ["skill1", "skill2", "skill3"],
    "experience_level": "fresher or junior or mid or senior",
    "responsibilities": ["responsibility1", "responsibility2"],
    "preferred_skills": ["skill1", "skill2"]
}}

If a section does not exist, return empty list [] for it.
Return ONLY the JSON. No extra text, no markdown, no explanation.

Job Description:
{jd_text}
"""

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}],
        temperature=0
    )

    response_text = response.choices[0].message.content.strip()
    response_text = response_text.replace("```json", "").replace("```", "").strip()
    # ✅ FIX: Specific exception
    try:
        return json.loads(response_text)
    except json.JSONDecodeError as e:
        raise ValueError(f"JD analyzer failed to parse LLM response: {e}\nRaw: {response_text}")


def analyze_job_role_only(job_role: str) -> dict:
    client = Groq(api_key=GROQ_API_KEY)

    prompt = f"""
You are a job market expert. Given a job role, return the typical expected skills and responsibilities.

Return ONLY a valid JSON object with exactly these keys:
{{
    "job_role": "{job_role}",
    "required_skills": ["skill1", "skill2", "skill3"],
    "experience_level": "fresher",
    "responsibilities": ["responsibility1", "responsibility2"],
    "preferred_skills": ["skill1", "skill2"]
}}

Return ONLY the JSON. No extra text, no markdown, no explanation.
"""

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}],
        temperature=0
    )

    response_text = response.choices[0].message.content.strip()
    response_text = response_text.replace("```json", "").replace("```", "").strip()
    try:
        return json.loads(response_text)
    except json.JSONDecodeError as e:
        raise ValueError(f"Job role analyzer failed to parse LLM response: {e}\nRaw: {response_text}")


def analyze_jd(jd_text: str = None, job_role: str = None) -> dict:
    """
    MAIN FUNCTION

    Case 1: JD text provided  → extract from full JD
    Case 2: Job role only     → generate typical skills for that role
    Case 3: Neither provided  → return safe defaults
    """
    if jd_text and jd_text.strip():
        return analyze_jd_with_groq(jd_text)

    elif job_role and job_role.strip():
        return analyze_job_role_only(job_role)

    else:
        return {
            "job_role": "Software Developer",
            "required_skills": [],
            "experience_level": "fresher",
            "responsibilities": [],
            "preferred_skills": []
        }
