import re
import spacy
import language_tool_python

# Load models once at startup
nlp = spacy.load("en_core_web_sm")
tool = language_tool_python.LanguageTool('en-US')

# Whole-word regex — prevents "like" matching "likely", "likewise" etc.
FILLER_PATTERNS = [
    re.compile(rf"\b{word}\b", re.IGNORECASE)
    for word in ["um", "uh", "like", "basically", "you know"]
]


# ─────────────────────────────────────────────────────────────────
# GRAMMAR  (weight: 0.35)
# ─────────────────────────────────────────────────────────────────
def grammar_score(text):
    matches = tool.check(text)
    errors = len(matches)
    score = max(0, 100 - errors * 5)
    return score, errors


# ─────────────────────────────────────────────────────────────────
# CLARITY  (weight: 0.30)
# ─────────────────────────────────────────────────────────────────
def clarity_score(text):
    doc = nlp(text)
    sentences = list(doc.sents)

    if not sentences:
        return 0

    lengths = [len(sent.text.split()) for sent in sentences]
    avg_length = sum(lengths) / len(lengths)

    if 12 <= avg_length <= 20:   return 100
    elif 8 <= avg_length < 12:   return 70
    elif 20 < avg_length <= 25:  return 70
    else:                         return 40


# ─────────────────────────────────────────────────────────────────
# PROFESSIONALISM  (weight: 0.20)
# ─────────────────────────────────────────────────────────────────
def professionalism_score(text):
    penalty = sum(len(p.findall(text)) for p in FILLER_PATTERNS)
    return max(0, 100 - penalty * 10)


# ─────────────────────────────────────────────────────────────────
# LENGTH  (weight: 0.15)
# ─────────────────────────────────────────────────────────────────
def length_score(text):
    words = len(text.split())
    if 80 <= words <= 200:   return 100
    elif 40 <= words < 80:   return 70
    else:                     return 40


# ─────────────────────────────────────────────────────────────────
# MAIN FUNCTION
# ─────────────────────────────────────────────────────────────────
def evaluate_communication_quality(text: str, question: str = None) -> dict:
    """
    Communication Score:
        Grammar         × 0.35   (LanguageTool)
      + Clarity         × 0.30   (spaCy sentence length)
      + Professionalism × 0.20   (filler word detection)
      + Length          × 0.15   (word count)

    Total weights = 1.0
    """
    g_score, errors = grammar_score(text)
    c_score = clarity_score(text)
    p_score = professionalism_score(text)
    l_score = length_score(text)

    overall = round(
        g_score * 0.35 +
        c_score * 0.30 +
        p_score * 0.20 +
        l_score * 0.15,
        2
    )

    return {
        "overall_score": overall,
        "grammar_score": g_score,
        "clarity_score": c_score,
        "professionalism_score": p_score,
        "length_score": l_score,
        "grammar_errors": errors,
        "weights": {
            "grammar": "35%",
            "clarity": "30%",
            "professionalism": "20%",
            "length": "15%"
        }
    }
