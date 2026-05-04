import json
import os
from groq import Groq

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
if not GROQ_API_KEY:
    raise ValueError("GROQ_API_KEY environment variable is not set.")


# ─────────────────────────────────────────────────────────────────
# COMBINE SCORES
# ─────────────────────────────────────────────────────────────────
def combine_scores(semantic_result: dict, nlp_result: dict, delivery_score: float = None) -> dict:
    """
    Final Score:

    Text answer only:
        Correctness   × 0.60
      + Communication × 0.40

    Audio answer:
        Correctness   × 0.50
      + Communication × 0.30
      + Delivery      × 0.20
    """
    correctness   = semantic_result["correctness_score"]
    communication = nlp_result["overall_score"]

    if delivery_score is not None:
        final_score = (
            correctness   * 0.50 +
            communication * 0.30 +
            delivery_score * 0.20
        )
        weights_used = {"correctness": "50%", "communication": "30%", "delivery": "20%"}
    else:
        final_score = (
            correctness   * 0.60 +
            communication * 0.40
        )
        weights_used = {"correctness": "60%", "communication": "40%", "delivery": "N/A"}

    return {
        "final_score": round(final_score, 2),
        "breakdown": {
            "correctness_score":   correctness,
            "communication_score": communication,
            "delivery_score":      delivery_score or 0,
            "relevance":           semantic_result.get("score_breakdown", {}).get("ai_judge_score", correctness),
            "technical":           semantic_result.get("score_breakdown", {}).get("similarity_score", correctness),
            "communication":       communication,
        },
        "weights_used": weights_used
    }


# ─────────────────────────────────────────────────────────────────
# GENERATE FINAL FEEDBACK
# ─────────────────────────────────────────────────────────────────
def generate_final_feedback(
    question: str,
    candidate_answer: str,
    semantic_result: dict,
    nlp_result: dict,
    delivery_score: float = None
) -> dict:
    client = Groq(api_key=GROQ_API_KEY)

    # Pull score breakdown from semantic result
    score_breakdown = semantic_result.get("score_breakdown", {})

    prompt = f"""
You are an expert technical interviewer giving final comprehensive feedback.

Question: {question}

Candidate Answer: {candidate_answer}

Reference (Ideal) Answer:
{semantic_result.get("reference_answer", "")}

Score Breakdown:
- AI Judge Score:       {score_breakdown.get("ai_judge_score", "N/A")}/100
- AI Judge Reason:      {score_breakdown.get("ai_judge_reason", "N/A")}
- Similarity Score:     {score_breakdown.get("similarity_score", "N/A")}/100
- Keyword Coverage:     {score_breakdown.get("keyword_coverage_score", "N/A")}/100
- Final Correctness:    {semantic_result.get("correctness_score", "N/A")}/100
- Grammar Score:        {nlp_result.get("grammar_score", "N/A")}/100  ({nlp_result.get("grammar_errors", 0)} errors)
- Clarity Score:        {nlp_result.get("clarity_score", "N/A")}/100
- Professionalism:      {nlp_result.get("professionalism_score", "N/A")}/100
- Length Score:         {nlp_result.get("length_score", "N/A")}/100
- Communication Score:  {nlp_result.get("overall_score", "N/A")}/100
- Delivery Score:       {delivery_score if delivery_score is not None else "N/A (text answer)"}/100

Based on all of the above, return ONLY valid JSON:
{{
  "strengths": ["specific strength 1", "specific strength 2"],
  "weaknesses": ["specific weakness 1", "specific weakness 2"],
  "improvement_tips": ["actionable tip 1", "actionable tip 2"],
  "overall_summary": "2-3 sentence honest and constructive assessment"
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
        return {"overall_summary": text}


# ─────────────────────────────────────────────────────────────────
# MAIN FUNCTION
# ─────────────────────────────────────────────────────────────────
def evaluate_full_answer(
    question: str,
    answer: str,
    semantic_result: dict,
    nlp_result: dict,
    delivery_result: dict = None
) -> dict:
    """
    MAIN FUNCTION — orchestrates all scores into a final result.

    Args:
        question        : the interview question asked
        answer          : candidate's answer (text)
        semantic_result : output from evaluate_answer_correctness()
        nlp_result      : output from evaluate_communication_quality()
        delivery_result : output from evaluate_audio() — optional

    Returns full evaluation dict with scores and feedback.
    """
    delivery_score = None
    if delivery_result:
        delivery_score = delivery_result.get("delivery_score")

    scores  = combine_scores(semantic_result, nlp_result, delivery_score)
    feedback = generate_final_feedback(
        question, answer, semantic_result, nlp_result, delivery_score
    )

    return {
        "scores":   scores,
        "feedback": feedback,
        "nlp_analysis": nlp_result,
        "reference_answer": semantic_result.get("reference_answer", "N/A")
    }

