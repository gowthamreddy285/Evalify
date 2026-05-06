import json
import os
import re
from groq import Groq
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity

GROQ_API_KEY = os.getenv("GROQ_API_KEY")

# Removed immediate ValueError to allow server to start. 
# Validation will happen inside functions that require the key.


# Load once at startup
embedding_model = SentenceTransformer("all-MiniLM-L6-v2")


# ─────────────────────────────────────────────────────────────────
# STEP 1 — Generate Reference Answer
# ─────────────────────────────────────────────────────────────────
def generate_reference_answer(question: str, context: dict = None) -> str:
    client = Groq(api_key=GROQ_API_KEY)
    prompt = f"""
You are an expert technical interviewer.

Question: {question}

Generate a clear, correct, and concise ideal answer.
Cover all key concepts a strong candidate should mention.
"""
    if context:
        prompt += f"\nContext: {json.dumps(context)}"

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.3
    )
    return response.choices[0].message.content.strip()


# ─────────────────────────────────────────────────────────────────
# STEP 2 — Semantic Similarity (sentence-transformers)
# ─────────────────────────────────────────────────────────────────
def compute_similarity(text1: str, text2: str) -> float:
    emb1 = embedding_model.encode([text1])
    emb2 = embedding_model.encode([text2])
    return float(cosine_similarity(emb1, emb2)[0][0])


# ─────────────────────────────────────────────────────────────────
# STEP 3 — AI Judge Score (LLM rates answer 0-100)
# ─────────────────────────────────────────────────────────────────
def ai_judge_score(question: str, candidate_answer: str, reference_answer: str):
    client = Groq(api_key=GROQ_API_KEY)
    prompt = f"""
You are a strict technical interview evaluator.

Question: {question}

Reference (Ideal) Answer:
{reference_answer}

Candidate Answer:
{candidate_answer}

Score the candidate's answer from 0 to 100 based on:
- Technical correctness (is it factually right?)
- Completeness (does it cover key concepts?)
- Relevance (does it actually answer the question?)

Scoring guide:
- Wrong answer         → 0 to 25
- Partially correct    → 30 to 60
- Mostly correct       → 65 to 79
- Complete and correct → 80 to 100

Return ONLY valid JSON:
{{
  "score": <0-100>,
  "reason": "<one sentence explanation>"
}}
"""
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.1
    )
    text = response.choices[0].message.content.strip()
    text = text.replace("```json", "").replace("```", "").strip()

    try:
        parsed = json.loads(text)
        score = float(parsed.get("score", 50))
        reason = parsed.get("reason", "")
        return max(0.0, min(100.0, score)), reason
    except json.JSONDecodeError:
        return 50.0, "Could not parse AI judge response."


# ─────────────────────────────────────────────────────────────────
# STEP 4 — Keyword Coverage
# ─────────────────────────────────────────────────────────────────
def compute_keyword_coverage(candidate_answer: str, reference_answer: str) -> float:
    """
    Extracts key technical terms from the reference answer and
    checks how many the candidate mentioned. Ignores stop words.
    """
    stop_words = {
        "the","a","an","is","are","was","were","be","been","being",
        "have","has","had","do","does","did","will","would","could",
        "should","may","might","shall","can","to","of","in","for",
        "on","with","at","by","from","it","its","this","that","which",
        "who","what","how","and","or","but","if","as","so","than",
        "then","when","also","just","not","no","such","used","use",
        "using","allow","allows","make","makes","made","well","very"
    }

    ref_words = set(
        w.lower() for w in re.findall(r'\b[a-zA-Z]{4,}\b', reference_answer)
        if w.lower() not in stop_words
    )

    if not ref_words:
        return 100.0

    candidate_lower = candidate_answer.lower()
    matched = sum(1 for word in ref_words if word in candidate_lower)
    return round(min((matched / len(ref_words)) * 100, 100), 2)


# ─────────────────────────────────────────────────────────────────
# FEEDBACK
# ─────────────────────────────────────────────────────────────────
def generate_feedback(question, candidate_answer, reference_answer, scores):
    client = Groq(api_key=GROQ_API_KEY)
    prompt = f"""
You are an expert interviewer giving detailed, specific feedback.

Question: {question}
Candidate Answer: {candidate_answer}
Reference Answer: {reference_answer}

Scores:
- AI Judge:          {scores['ai_judge']}/100
- Similarity:        {round(scores['similarity'] * 100, 1)}/100
- Keyword Coverage:  {scores['keyword_coverage']}/100
- Final Correctness: {scores['correctness']}/100

Return ONLY valid JSON:
{{
  "strengths": ["specific strength 1", "specific strength 2"],
  "improvements": ["specific improvement 1", "specific improvement 2"],
  "missing_concepts": ["missed concept 1", "missed concept 2"],
  "overall_assessment": "2-3 sentence honest assessment"
}}
"""
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.3
    )
    text = response.choices[0].message.content.strip()
    text = text.replace("```json", "").replace("```", "").strip()

    try:
        return json.loads(text)
    except json.JSONDecodeError:
        return {"overall_assessment": text}


def is_answer_irrelevant(answer: str) -> bool:
    """
    Checks if the answer is a refusal, skip, or too short to be meaningful.
    """
    clean_ans = answer.strip().lower()
    
    # 1. Direct refusal/skip phrases
    refusals = {
        "i don't know", "dont know", "no idea", "not sure", 
        "skip", "none", "nothing", "na", "n/a", ".", "?", "irrelevant",
        "i do not know", "no clue", "pass", "idk"
    }
    if clean_ans in refusals:
        return True
    
    # 2. Too short to contain a technical concept (e.g. "ok", "yes", "the")
    if len(clean_ans) < 6:
        return True
        
    return False

# ─────────────────────────────────────────────────────────────────
# MAIN FUNCTION
# ─────────────────────────────────────────────────────────────────
def evaluate_answer_correctness(question: str, candidate_answer: str, context: dict = None) -> dict:
    """
    3-Layer Correctness Score:
        AI Judge Score      × 0.5
      + Semantic Similarity × 0.3
      + Keyword Coverage    × 0.2
    """
    # STRICTURE: If answer is a refusal or nonsense, give zero immediately
    if is_answer_irrelevant(candidate_answer):
        return {
            "correctness_score": 0.0,
            "score_breakdown": {
                "ai_judge_score": 0.0,
                "ai_judge_reason": "Candidate provided a skip, refusal, or irrelevant one-word answer.",
                "similarity_score": 0.0,
                "keyword_coverage_score": 0.0,
                "weights": "N/A"
            },
            "reference_answer": "Requires a meaningful technical response.",
            "feedback": {
                "overall_assessment": "No attempt was made to answer this question. Providing no substance results in a zero score.",
                "strengths": [],
                "improvements": ["Provide a detailed technical answer instead of skipping."],
                "missing_concepts": ["All technical concepts were missed."]
            }
        }

    reference_answer = generate_reference_answer(question, context)
    similarity_score = compute_similarity(candidate_answer, reference_answer)
    judge_score, judge_reason = ai_judge_score(question, candidate_answer, reference_answer)
    keyword_score = compute_keyword_coverage(candidate_answer, reference_answer)

    correctness_score = round(
        judge_score            * 0.5 +
        similarity_score * 100 * 0.3 +
        keyword_score          * 0.2,
        2
    )
    correctness_score = min(correctness_score, 100.0)

    scores = {
        "correctness": correctness_score,
        "ai_judge": judge_score,
        "similarity": similarity_score,
        "keyword_coverage": keyword_score
    }

    feedback = generate_feedback(question, candidate_answer, reference_answer, scores)

    return {
        "correctness_score": correctness_score,
        "score_breakdown": {
            "ai_judge_score":       judge_score,
            "ai_judge_reason":      judge_reason,
            "similarity_score":     round(similarity_score * 100, 2),
            "keyword_coverage_score": keyword_score,
            "weights": {"ai_judge": "50%", "similarity": "30%", "keyword_coverage": "20%"}
        },
        "reference_answer": reference_answer,
        "feedback": feedback
    }
