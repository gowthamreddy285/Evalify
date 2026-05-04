import pdfplumber
import json
from groq import Groq


def extract_text_from_pdf(pdf_path: str) -> str:
    """
    Opens the PDF and extracts all raw text page by page.
    pdfplumber handles all PDF formatting complexity.
    """
    full_text = ""
    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages:
            text = page.extract_text()
            if text:
                full_text += text + "\n"
    return full_text.strip()


def parse_resume_with_groq(raw_text: str) -> dict:
    """
    Sends raw resume text to Groq API (Llama 3).
    Works for ANY resume format — not just one specific format.
    """
    import os
    client = Groq(api_key=os.getenv("GROQ_API_KEY"))

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
                "description": "what the project does"
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
    
    If a section does not exist in the resume, return an empty list [] for it.
    Return ONLY the JSON, no extra text, no markdown, no explanation.
    
    Resume:
    {raw_text}
    """

    response = client.chat.completions.create(
        model="llama3-8b-8192",
        messages=[
            {"role": "user", "content": prompt}
        ],
        temperature=0
    )

    response_text = response.choices[0].message.content.strip()

    # Sometimes LLM wraps in ```json ``` — clean that
    response_text = response_text.replace("```json", "").replace("```", "").strip()

    parsed = json.loads(response_text)
    return parsed


def parse_resume(pdf_path: str) -> dict:
    """
    MAIN FUNCTION — call this from other modules.
    Step 1: Extract raw text from PDF using pdfplumber
    Step 2: Send to Groq API for intelligent structured extraction
    Returns clean structured dict that works for ANY resume format.
    """
    raw_text = extract_text_from_pdf(pdf_path)
    parsed_data = parse_resume_with_groq(raw_text)
    parsed_data["raw_text"] = raw_text
    return parsed_data