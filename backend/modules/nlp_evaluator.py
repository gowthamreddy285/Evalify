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

    # 1. Average Sentence Length (Optimal: 12-20 words)
    lengths = [len(sent.text.split()) for sent in sentences]
    avg_length = sum(lengths) / len(lengths)
    
    length_score = 0
    if 12 <= avg_length <= 20:   length_score = 100
    elif 8 <= avg_length < 12:   length_score = 70
    elif 20 < avg_length <= 25:  length_score = 70
    else:                         length_score = 40

    # 2. Sentence Length Variance (Monotonous length is less engaging)
    # If all sentences are the same length, variance is 0.
    if len(lengths) > 1:
        variance = sum((l - avg_length) ** 2 for l in lengths) / len(lengths)
        variance_score = min(100, variance * 5) # Heuristic: more variance is better up to a point
    else:
        variance_score = 50

    # 3. Word Complexity (Average word length)
    words = [token.text for token in doc if not token.is_punct and not token.is_space]
    if words:
        avg_word_len = sum(len(w) for w in words) / len(words)
        # Technical answers usually have longer words, but very long is hard to read.
        if 4 <= avg_word_len <= 6: word_score = 100
        else: word_score = 70
    else:
        word_score = 0

    return round(length_score * 0.5 + variance_score * 0.2 + word_score * 0.3, 2)


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


def is_parrot(text: str, question: str) -> bool:
    if not question: return False
    q = re.sub(r'[^\w\s]', '', question.lower()).strip()
    a = re.sub(r'[^\w\s]', '', text.lower()).strip()
    return a == q or a in q or q in a


def is_answer_refusal(text: str) -> bool:
    clean = text.strip().lower()
    refusals = {"i don't know", "dont know", "no idea", "not sure", "skip", "none", "nothing", "na", "n/a", ".", "?", "idk"}
    return clean in refusals or len(clean) < 6

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
    # STRICTURE: Refusals or Parrotting gets zero communication score
    if is_answer_refusal(text) or (question and is_parrot(text, question)):
        return {
            "overall_score": 0.0,
            "grammar_score": 0.0,
            "clarity_score": 0.0,
            "professionalism_score": 0.0,
            "length_score": 0.0,
            "grammar_errors": 0,
            "weights": {"grammar": "35%", "clarity": "30%", "professionalism": "20%", "length": "15%"}
        }

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

