import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const API = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000,
});

// Add a request interceptor to attach the JWT token
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('evalify_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// ═══════════════════════════════════════════
// PARSE RESUME
// ═══════════════════════════════════════════
export async function parseResume(file) {
  const formData = new FormData();
  formData.append('file', file);
  const { data } = await API.post('/parse-resume', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

// ═══════════════════════════════════════════
// ANALYZE JOB DESCRIPTION
// ═══════════════════════════════════════════
export async function analyzeJD({ jd_text = '', job_role = '' }) {
  const { data } = await API.post('/analyze-jd', { jd_text, job_role });
  return data;
}

// ═══════════════════════════════════════════
// GENERATE QUESTIONS (standalone, no session)
// ═══════════════════════════════════════════
export async function generateQuestions({ resume_data, jd_data, difficulty }) {
  const { data } = await API.post('/generate-questions', {
    resume_data,
    jd_data,
    difficulty,
  });
  return data;
}

// ═══════════════════════════════════════════
// START SESSION (creates session + generates questions)
// ═══════════════════════════════════════════
export async function startSession({ resume_data, jd_data, difficulty, answer_mode }) {
  const { data } = await API.post('/start-session', {
    resume_data,
    jd_data,
    difficulty,
    answer_mode,
  });
  return data;
}

// ═══════════════════════════════════════════
// SAVE ANSWER (individual answer with scores)
// ═══════════════════════════════════════════
export async function saveAnswer({ session_id, question_id, candidate_answer, reference_answer, scores, feedback }) {
  const { data } = await API.post('/save-answer', {
    session_id,
    question_id,
    candidate_answer,
    reference_answer,
    scores,
    feedback,
  });
  return data;
}

// ═══════════════════════════════════════════
// COMPLETE SESSION
// ═══════════════════════════════════════════
export async function completeSession(session_id, final_score) {
  const { data } = await API.post(`/complete-session/${session_id}`, {
    final_score,
  });
  return data;
}

// ═══════════════════════════════════════════
// GET SESSIONS (history)
// ═══════════════════════════════════════════
export async function getSessions() {
  const { data } = await API.get('/sessions');
  return data;
}

// ═══════════════════════════════════════════
// GET SESSION DETAIL
// ═══════════════════════════════════════════
export async function getSessionDetail(session_id) {
  const { data } = await API.get(`/sessions/${session_id}`);
  return data;
}

// ═══════════════════════════════════════════
// EVALUATE TEXT ANSWER
// ═══════════════════════════════════════════
export async function evaluateText({ question, answer }) {
  const formData = new FormData();
  formData.append('question', question);
  formData.append('answer', answer);
  const { data } = await API.post('/evaluate-text', formData);
  return data;
}

// ═══════════════════════════════════════════
// EVALUATE AUDIO ANSWER
// ═══════════════════════════════════════════
export async function evaluateAudio({ question, audioBlob }) {
  const formData = new FormData();
  formData.append('question', question);
  formData.append('file', audioBlob, 'recording.webm');
  const { data } = await API.post('/evaluate-audio', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

export async function transcribe(audioBlob) {
  const formData = new FormData();
  formData.append('file', audioBlob, 'recording.webm');
  const { data } = await API.post('/transcribe', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}
