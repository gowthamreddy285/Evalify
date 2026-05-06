import { createContext, useContext, useReducer, useCallback, useRef } from 'react';

const InterviewContext = createContext(null);

const initialState = {
  // Setup
  resumeData: null,
  jdData: null,
  difficulty: 'medium',
  answerMode: 'type', // 'type' | 'speak'

  // Session tracking (MongoDB)
  sessionId: null,

  // Session
  questions: [],
  currentQuestionIndex: 0,
  answers: [],
  results: [],

  // UI
  toasts: [],
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_RESUME_DATA':
      return { ...state, resumeData: action.payload };
    case 'SET_JD_DATA':
      return { ...state, jdData: action.payload };
    case 'SET_DIFFICULTY':
      return { ...state, difficulty: action.payload };
    case 'SET_ANSWER_MODE':
      return { ...state, answerMode: action.payload };
    case 'SET_SESSION_ID':
      return { ...state, sessionId: action.payload };
    case 'SET_QUESTIONS':
      return { ...state, questions: action.payload, currentQuestionIndex: 0, answers: [], results: [] };
    case 'NEXT_QUESTION':
      return { ...state, currentQuestionIndex: state.currentQuestionIndex + 1 };
    case 'ADD_ANSWER':
      return { ...state, answers: [...state.answers, action.payload] };
    case 'ADD_RESULT':
      return { ...state, results: [...state.results, action.payload] };
    case 'ADD_TOAST':
      return { ...state, toasts: [...state.toasts, action.payload] };
    case 'REMOVE_TOAST':
      return { ...state, toasts: state.toasts.filter(t => t.id !== action.payload) };
    case 'RESET_SESSION':
      return { ...state, questions: [], currentQuestionIndex: 0, answers: [], results: [], sessionId: null };
    case 'RESET_ALL':
      return { ...initialState };
    default:
      return state;
  }
}

export function InterviewProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const toastIdRef = useRef(0);

  const addToast = useCallback((message, type = 'success') => {
    const id = ++toastIdRef.current;
    dispatch({ type: 'ADD_TOAST', payload: { id, message, type } });
    setTimeout(() => {
      dispatch({ type: 'REMOVE_TOAST', payload: id });
    }, 3500);
  }, []);

  return (
    <InterviewContext.Provider value={{ state, dispatch, addToast }}>
      {children}
    </InterviewContext.Provider>
  );
}

export function useInterview() {
  const ctx = useContext(InterviewContext);
  if (!ctx) throw new Error('useInterview must be used within InterviewProvider');
  return ctx;
}
