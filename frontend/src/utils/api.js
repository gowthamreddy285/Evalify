import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:8000',
  timeout: 60000,
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
// GENERATE QUESTIONS
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
