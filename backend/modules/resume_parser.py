import pdfplumber
import json
import os
from groq import Groq

# ✅ FIX: Use environment variable
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

# Removed immediate ValueError to allow server to start without the key.
# Validation will happen inside functions that require the key.



def extract_text_from_pdf(pdf_path: str) -> str:
    full_text = ""
    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages:
            text = page.extract_text()
            if text:
                full_text += text + "\n"
    return full_text.strip()


def parse_resume_with_groq(raw_text: str) -> dict:
    client = Groq(api_key=GROQ_API_KEY)

    prompt = f"""
You are a resume parser. Extract structured information from the resume below.

Return ONLY a valid JSON object with exactly these keys:
{{
    "name": "candidate full name",
    "summary": "brief professional summary",
    "skills": ["skill1", "skill2", "skill3"],
    "projects": [
        {{
            "title": "project name",
            "description": "what the project does and the tech stack used"
        }}
    ],
    "experience": [
        {{
            "role": "job title",
            "company": "company name",
            "duration": "time period"
        }}
    ],
    "education": [
        {{
            "degree": "degree name",
            "institution": "university/school name",
            "year": "year or duration"
        }}
    ],
    "certifications": ["cert1", "cert2"]
}}

If a section does not exist, return empty list [] for it.
Return ONLY the JSON. No extra text, no markdown, no explanation.

Resume:
{raw_text}
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
        raise ValueError(f"Resume parser failed to parse LLM response: {e}\nRaw: {response_text}")


def parse_resume(pdf_path: str) -> dict:
    """MAIN FUNCTION — returns structured resume data dict"""
    raw_text = extract_text_from_pdf(pdf_path)
    parsed_data = parse_resume_with_groq(raw_text)
    parsed_data["raw_text"] = raw_text
    return parsed_data
