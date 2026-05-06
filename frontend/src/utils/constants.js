// ═══════════════════════════════════════════
// COLORS
// ═══════════════════════════════════════════
export const COLORS = {
  bg: '#000000',
  surface: '#0A0A0A',
  border: '#1A1A1A',
  primary: '#B4121B',
  secondary: '#E61A23',
  warning: '#FF4444',
  text: '#F5F5F5',
  muted: '#707070',
};

// ═══════════════════════════════════════════
// SKILL BADGE COLORS (Red-focused palette)
// ═══════════════════════════════════════════
export const SKILL_COLORS = [
  { bg: 'rgba(180, 18, 27, 0.15)', text: '#F5F5F5', border: 'rgba(180, 18, 27, 0.3)' },
  { bg: 'rgba(30, 30, 30, 0.8)', text: '#B4121B', border: 'rgba(180, 18, 27, 0.4)' },
  { bg: 'rgba(180, 18, 27, 0.08)', text: '#B4121B', border: 'rgba(180, 18, 27, 0.2)' },
  { bg: '#B4121B', text: '#FFFFFF', border: '#B4121B' },
  { bg: 'rgba(230, 26, 35, 0.15)', text: '#E61A23', border: 'rgba(230, 26, 35, 0.3)' },
  { bg: 'rgba(0, 0, 0, 0.8)', text: '#F5F5F5', border: '#1A1A1A' },
];

// ═══════════════════════════════════════════
// DIFFICULTY CONFIG
// ═══════════════════════════════════════════
export const DIFFICULTIES = [
  {
    key: 'easy',
    label: 'Easy',
    questions: 5,
    description: 'Warm-up questions covering fundamental concepts. Great for freshers.',
    color: '#7A0C12',
    intensity: 1,
  },
  {
    key: 'medium',
    label: 'Medium',
    questions: 8,
    description: 'Balanced mix of conceptual and applied questions for solid preparation.',
    color: '#B4121B',
    intensity: 2,
  },
  {
    key: 'hard',
    label: 'Hard',
    questions: 10,
    description: 'Deep-dive technical questions that test real-world problem solving.',
    color: '#D4121B',
    intensity: 3,
  },
  {
    key: 'extreme',
    label: 'Extreme',
    questions: 12,
    description: 'Senior-level grilling. System design, edge cases, and curveballs.',
    color: '#FF3B3B',
    intensity: 4,
  },
];

// ═══════════════════════════════════════════
// QUESTION TYPE COLORS
// ═══════════════════════════════════════════
export const QUESTION_TYPE_COLORS = {
  Technical: { bg: 'rgba(180, 18, 27, 0.15)', text: '#B4121B' },
  Project: { bg: 'rgba(30, 30, 30, 0.6)', text: '#F5F5F5' },
  Behavioral: { bg: 'rgba(180, 18, 27, 0.05)', text: '#B4121B' },
  Role: { bg: 'rgba(255, 255, 255, 0.05)', text: '#FFFFFF' },
};

// ═══════════════════════════════════════════
// SCORE HELPERS
// ═══════════════════════════════════════════
export function getScoreColor(score) {
  if (score >= 85) return '#FF3B3B'; // Vibrant Red
  if (score >= 70) return '#D4121B'; // Signature Red
  if (score >= 40) return '#B4121B'; // Deep Red
  return '#7A0C12'; // Dark Crimson
}

export function getScoreLabel(score) {
  if (score >= 85) return 'Elite Performance';
  if (score >= 70) return 'Strong Response';
  if (score >= 55) return 'Baseline Performance';
  if (score >= 40) return 'Incomplete Logic';
  return 'Critical Failure';
}

// ═══════════════════════════════════════════
// EXPERIENCE LEVEL COLORS
// ═══════════════════════════════════════════
export const EXP_LEVEL_COLORS = {
  Fresher: { bg: 'rgba(112, 112, 112, 0.15)', text: '#707070' },
  Junior: { bg: 'rgba(180, 18, 27, 0.1)', text: '#B4121B' },
  Mid: { bg: 'rgba(180, 18, 27, 0.2)', text: '#B4121B' },
  Senior: { bg: 'rgba(180, 18, 27, 0.3)', text: '#E61A23' },
};

