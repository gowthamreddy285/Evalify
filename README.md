# Evalify 🎯

**An AI-powered mock interview platform that evaluates your answers the way a real interviewer would.**

## What is Evalify?

Evalify is a full-stack mock interview platform that uses NLP and semantic analysis to evaluate candidate responses — going beyond simple keyword matching to understand the *meaning* of what you said.

You answer interview questions in a natural interface. The AI analyses your response across three dimensions and gives you actionable, specific feedback so you can improve before the real thing.

---

## How it Works

When you submit an answer, the backend:

1. **Embeds your response** using a Sentence Transformer model (`all-MiniLM-L6-v2`) to produce a semantic vector
2. **Compares it** against an ideal reference answer using cosine similarity
3. **Scores across three dimensions:**
   - **Clarity** — how well-structured and easy to follow your answer is
   - **Correctness** — semantic accuracy relative to the ideal answer
   - **Communication** — vocabulary, conciseness, and professional tone
4. **Returns detailed feedback** with a composite score and specific suggestions per dimension

---

## Demo

> _Screenshot / GIF coming soon_

---

## Project Structure

```
Evalify/
├── backend/                      # Python / FastAPI backend
│   ├── __init__.py
│   ├── audio_processor.py        # Transcribes spoken responses
│   ├── feedback_engine.py        # Synthesises scores into written feedback
│   ├── jd_analyzer.py            # Parses job descriptions for requirements
│   ├── nlp_evaluator.py          # NLP scoring logic (clarity, correctness, communication)
│   ├── question_generator.py     # Generates role-specific interview questions
│   ├── resume_parser.py          # Extracts skills and experience from resumes
│   ├── semantic.py               # Sentence Transformer embeddings + cosine similarity
│   └── requirements.txt
│
├── frontend/                     # JavaScript (React) frontend
│   ├── src/
│   │   ├── components/           # UI components
│   │   ├── pages/                # Interview, Results, Home pages
│   │   └── App.js
│   ├── public/
│   └── package.json
│
├── .env.example                  # Environment variable template
├── .gitignore
└── README.md

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | JavaScript (React), CSS |
| Backend | Python, FastAPI |
| NLP Model | Sentence Transformers (`all-MiniLM-L6-v2`) |
| Similarity | Cosine similarity via `scikit-learn` |
| API | REST (JSON) |

---

## Getting Started

### Prerequisites

- Python 3.10+
- Node.js 18+
- npm or yarn

### 1. Clone the repository

```bash
git clone https://github.com/gowthamreddy285/Evalify.git
cd Evalify
```

### 2. Set up the backend

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Copy the environment file and fill in any required values:

```bash
cp ../.env.example .env
```

Start the backend server:

```bash
uvicorn app:app --reload --port 8000
```

The API will be live at `http://localhost:8000`.

### 3. Set up the frontend

```bash
cd ../frontend
npm install
```

Start the development server:

```bash
npm start
```

The app will open at `http://localhost:3000`.

---

## API Reference

### `POST /evaluate`

Evaluates a candidate's response to an interview question.

**Request body:**
```json
{
  "question_id": "q_001",
  "response": "A REST API uses stateless HTTP requests and standard verbs like GET and POST..."
}
```

**Response:**
```json
{
  "score": 82,
  "dimensions": {
    "clarity": 85,
    "correctness": 79,
    "communication": 83
  },
  "feedback": {
    "clarity": "Well-structured answer. Consider adding a concrete example.",
    "correctness": "Core concepts covered. Missed mentioning statelessness explicitly.",
    "communication": "Professional tone. Answer could be slightly more concise."
  }
}
```

### `GET /questions`

Returns the list of available interview questions.

---

## Environment Variables

See [`.env.example`](./.env.example) for all required variables. Copy it to `.env` before running.

| Variable | Description | Default |
|---|---|---|
| `MODEL_NAME` | Sentence Transformer model to use | `all-MiniLM-L6-v2` |
| `API_PORT` | Port for the backend server | `8000` |
| `FRONTEND_URL` | Frontend origin for CORS | `http://localhost:3000` |

---

## Running Tests

```bash
# Backend tests
cd backend
pytest tests/ -v

# Frontend tests
cd frontend
npm test
```

---

## Roadmap

- [ ] Voice input support (Web Speech API)
- [ ] Session history and progress tracking
- [ ] More question categories (system design, behavioural, DSA)
- [ ] Difficulty levels per question
- [ ] Export feedback as PDF report

---


## License

[MIT](./LICENSE) — free to use, modify, and distribute with attribution.

---

*Evalify — Practice like it's real. Improve like it matters.*
