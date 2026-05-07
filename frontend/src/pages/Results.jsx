import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useInterview } from '../context/InterviewContext';
import ScoreCircle from '../components/ScoreCircle';
import ProgressBar from '../components/ProgressBar';
import FeedbackAccordion from '../components/FeedbackAccordion';
import LoadingOverlay from '../components/LoadingOverlay';
import { getScoreColor } from '../utils/constants';
import { useCountUp } from '../hooks/useCountUp';
import { evaluateText, evaluateAudio, saveAnswer, completeSession } from '../utils/api';

export default function Results() {
  const navigate = useNavigate();
  const { state, dispatch, addToast } = useInterview();
  const { results, questions, answers, sessionId } = state;
  const [evaluating, setEvaluating] = useState(false);
  const [completedIndices, setCompletedIndices] = useState([]);
  const initialized = useRef(false);

  useEffect(() => {
    if (!answers.length || !questions.length) {
      navigate('/interview/setup');
      return;
    }

    if (results.length === 0 && !evaluating && !initialized.current) {
      initialized.current = true;
      runEvaluations();
    }
  }, [answers, questions, results, evaluating, navigate]);

  const runEvaluations = async () => {
    setEvaluating(true);
    setCompletedIndices([]);
    
    try {
      // Process questions one by one instead of all at once
      // This is more reliable and doesn't overwhelm the backend
      const allResults = [];
      
      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        const a = answers[i];
        
        let res;
        try {
          if (!a || a.content === '[Skipped]') {
            res = {
              scores: { final_score: 0, breakdown: { relevance: 0, technical: 0, communication: 0 } },
              feedback: { overall_summary: 'Question was skipped.', strengths: [], weaknesses: ['Question not answered.'], improvement_tips: ['Always try to provide at least a brief answer.'] },
              reference_answer: 'Not available for skipped question.',
              candidate_answer: '[Skipped]'
            };
          } else if (a.type === 'audio' && a.audioBlob) {
            res = await evaluateAudio({ question: q.question, audioBlob: a.audioBlob });
            res.candidate_answer = a.content;
          } else {
            res = await evaluateText({ question: q.question, answer: a.content });
            res.candidate_answer = a.content;
          }

          // Save individual answer to MongoDB if session exists
          if (sessionId) {
            try {
              await saveAnswer({
                session_id: sessionId,
                question_id: q.id || '',
                candidate_answer: res.candidate_answer || '',
                reference_answer: res.reference_answer || '',
                scores: {
                  correctness: res.scores?.breakdown?.relevance || 0,
                  ai_judge: res.scores?.breakdown?.technical || 0,
                  similarity: res.scores?.breakdown?.similarity || 0,
                  keyword_coverage: res.scores?.breakdown?.keyword_coverage || 0,
                  communication: res.scores?.breakdown?.communication || 0,
                  grammar: res.nlp_analysis?.grammar_score || 0,
                  clarity: res.nlp_analysis?.clarity_score || 0,
                  professionalism: res.nlp_analysis?.professionalism_score || 0,
                  length: res.nlp_analysis?.length_score || 0,
                  final: res.scores?.final_score || 0,
                },
                feedback: {
                  strengths: res.feedback?.strengths || [],
                  weaknesses: res.feedback?.weaknesses || [],
                  improvement_tips: res.feedback?.improvement_tips || [],
                  overall_summary: res.feedback?.overall_summary || '',
                },
              });
            } catch (saveErr) {
              console.error(`Failed to save answer ${i + 1}:`, saveErr);
            }
          }
          
          allResults.push(res);
          dispatch({ type: 'ADD_RESULT', payload: res });
          setCompletedIndices(prev => [...prev, i]);
        } catch (itemErr) {
          console.error(`Evaluation failed for question ${i + 1}:`, itemErr);
          // Add a placeholder result so the app doesn't break
          const errorRes = {
            scores: { final_score: 0, breakdown: { relevance: 0, technical: 0, communication: 0 } },
            feedback: { overall_summary: 'Evaluation failed for this question.', strengths: [], weaknesses: ['System error during evaluation.'], improvement_tips: ['Try again later.'] },
            reference_answer: 'Error during evaluation.',
            candidate_answer: a?.content || ''
          };
          allResults.push(errorRes);
          dispatch({ type: 'ADD_RESULT', payload: errorRes });
          setCompletedIndices(prev => [...prev, i]);
        }
      }

      // 3. Complete the session
      const validResults = allResults.filter(r => r != null);
      if (validResults.length > 0) {
        const avgFinal = Math.round(validResults.reduce((s, r) => s + (r?.scores?.final_score || 0), 0) / validResults.length);
        if (sessionId) {
          try {
            await completeSession(sessionId, avgFinal);
          } catch (err) {
            console.error('Failed to complete session:', err);
          }
        }
        addToast('Evaluation complete & saved!', 'success');
      }
    } catch (err) {
      console.error(err);
      addToast('An error occurred during report generation.', 'error');
    } finally {
      setEvaluating(false);
    }
  };

  if (evaluating) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-[#030303]">
        <motion.div initial={{opacity:0,scale:0.95}} animate={{opacity:1,scale:1}} className="max-w-md w-full bg-[#0A0A0A] border border-white/5 rounded-[24px] p-10 text-center relative overflow-hidden noise-overlay shadow-2xl">
          <div className="relative z-10">
            <div className="w-24 h-24 mx-auto mb-10 relative">
               <div className="absolute inset-0 rounded-full border-4 border-[#D4121B]/10"></div>
               <motion.div 
                 animate={{ rotate: 360 }} 
                 transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                 className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#D4121B]"
               />
               <div className="absolute inset-0 flex items-center justify-center font-bold text-[#F5F5F5] text-xl font-mono">
                 {Math.round(((completedIndices.length) / questions.length) * 100)}%
               </div>
            </div>
            <h2 className="text-2xl font-black text-[#F5F5F5] mb-4 tracking-[-0.03em] uppercase">Generating Report</h2>
            <p className="text-[#707070] text-sm mb-8 leading-relaxed font-medium">Analyzing your responses, technical depth, and communication skills with precision...</p>
            <div className="space-y-4">
              {questions.map((q, i) => (
                <div key={i} className="flex items-center gap-4 bg-[#030303] p-3 rounded-xl border border-white/5">
                  <div className={`w-2 h-2 rounded-full ${completedIndices.includes(i) ? 'bg-[#D4121B]' : 'bg-[#FF3B3B] animate-pulse shadow-[0_0_8px_rgba(255,59,59,0.5)]'}`} />
                  <p className={`text-[10px] text-left truncate flex-1 font-bold uppercase tracking-widest ${completedIndices.includes(i) ? 'text-[#F5F5F5]' : 'text-[#707070]'}`}>{q.question}</p>
                  {completedIndices.includes(i) && (
                    <div className="bg-[#D4121B]/10 p-1 rounded-full">
                      <svg className="w-3 h-3 text-[#D4121B]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" /></svg>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  if (!results.length) return null;

  // Calculate averages
  const avgFinal = Math.round(results.reduce((s, r) => s + (r?.scores?.final_score || 0), 0) / results.length);

  // Aggregate breakdown scores
  const breakdownKeys = new Set();
  results.forEach(r => {
    const breakdown = r?.scores?.breakdown || {};
    Object.keys(breakdown).forEach(k => {
      if (k.toLowerCase() !== 'delivery') breakdownKeys.add(k);
    });
  });
  const avgBreakdown = {};
  breakdownKeys.forEach(key => {
    const vals = results.map(r => r?.scores?.breakdown?.[key]).filter(v => v != null);
    avgBreakdown[key] = vals.length ? Math.round(vals.reduce((a,b) => a+b, 0) / vals.length) : 0;
  });

  // Aggregate feedback
  const allStrengths = [], allWeaknesses = [], allTips = [];
  results.forEach(r => {
    if (r?.feedback?.strengths) allStrengths.push(...r.feedback.strengths);
    if (r?.feedback?.weaknesses) allWeaknesses.push(...r.feedback.weaknesses);
    if (r?.feedback?.improvement_tips) allTips.push(...r.feedback.improvement_tips);
  });
  const uniqueStrengths = [...new Set(allStrengths)].slice(0, 5);
  const uniqueWeaknesses = [...new Set(allWeaknesses)].slice(0, 5);
  const uniqueTips = [...new Set(allTips)].slice(0, 5);

  return (
    <div className="min-h-screen py-16 px-6 bg-[#030303]">
      <div className="max-w-6xl mx-auto">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-20 no-print"
        >
          <div className="inline-block px-4 py-1.5 rounded-full bg-[#D4121B]/10 border border-[#D4121B]/20 mb-6">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#D4121B]">Simulation Complete</span>
          </div>
          <h1 className="text-5xl font-black mb-12 tracking-[-0.04em] uppercase">Your Assessment.</h1>
          <div className="scale-125 mb-8">
            <ScoreCircle score={avgFinal} />
          </div>
        </motion.div>

        {/* Score Breakdown */}
        {Object.keys(avgBreakdown).length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-20 no-print"
          >
            <div className="flex items-center gap-4 mb-8">
              <h2 className="text-xl font-black uppercase tracking-tight">Core Competencies</h2>
              <div className="flex-1 h-[1px] bg-white/5" />
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.entries(avgBreakdown).map(([key, val]) => (
                <ScoreBarCard key={key} label={key} score={val} />
              ))}
            </div>
          </motion.div>
        )}

        {/* Question-by-question */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-20 no-print"
        >
          <div className="flex items-center gap-4 mb-8">
            <h2 className="text-xl font-black uppercase tracking-tight">Detailed Breakdown</h2>
            <div className="flex-1 h-[1px] bg-white/5" />
          </div>
          <FeedbackAccordion results={results} questions={questions} />
        </motion.div>

        {/* Feedback Summary */}
        {(uniqueStrengths.length > 0 || uniqueWeaknesses.length > 0 || uniqueTips.length > 0) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-20 no-print"
          >
             <div className="flex items-center gap-4 mb-8">
              <h2 className="text-xl font-black uppercase tracking-tight">Strategic Insights</h2>
              <div className="flex-1 h-[1px] bg-white/5" />
            </div>

            <div className="grid sm:grid-cols-3 gap-6">
              {uniqueStrengths.length > 0 && (
                <div className="bg-[#0A0A0A] rounded-[24px] border border-white/5 p-8 noise-overlay">
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-xl bg-[#D4121B]/10 flex items-center justify-center text-lg shadow-inner shadow-[#D4121B]/5">✓</div>
                      <p className="text-xs font-black uppercase tracking-widest text-[#D4121B]">Strengths</p>
                    </div>
                    <ul className="space-y-4">{uniqueStrengths.map((s,i) => <li key={i} className="text-sm text-[#F5F5F5] leading-relaxed font-medium flex gap-3"><span className="text-[#D4121B]">•</span> {s}</li>)}</ul>
                  </div>
                </div>
              )}
              {uniqueWeaknesses.length > 0 && (
                <div className="bg-[#0A0A0A] rounded-[24px] border border-white/5 p-8 noise-overlay">
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-lg shadow-inner">✗</div>
                      <p className="text-xs font-black uppercase tracking-widest text-[#B4121B]">Gaps</p>
                    </div>
                    <ul className="space-y-4">{uniqueWeaknesses.map((w,i) => <li key={i} className="text-sm text-[#F5F5F5] leading-relaxed font-medium flex gap-3"><span className="text-[#B4121B]">•</span> {w}</li>)}</ul>
                  </div>
                </div>
              )}
              {uniqueTips.length > 0 && (
                <div className="bg-[#0A0A0A] rounded-[24px] border border-white/5 p-8 noise-overlay">
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-xl bg-[#D4121B]/5 flex items-center justify-center text-lg shadow-inner">💡</div>
                      <p className="text-xs font-black uppercase tracking-widest text-[#F5F5F5]">Growth</p>
                    </div>
                    <ul className="space-y-4">{uniqueTips.map((t,i) => <li key={i} className="text-sm text-[#F5F5F5] leading-relaxed font-medium flex gap-3"><span className="text-[#D4121B]">•</span> {t}</li>)}</ul>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
         {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex flex-wrap gap-5 justify-center"
        >
          <button onClick={() => { dispatch({type:'RESET_SESSION'}); navigate('/interview/session'); }} className="px-8 py-4 rounded-xl border border-white/10 text-[#707070] hover:text-[#F5F5F5] hover:bg-white/5 font-bold uppercase tracking-widest text-xs transition-all cursor-pointer">Re-attempt Session</button>
          <button onClick={() => { dispatch({type:'RESET_ALL'}); navigate('/interview/setup'); }} className="px-8 py-4 rounded-xl border border-white/10 text-[#707070] hover:text-[#F5F5F5] hover:bg-white/5 font-bold uppercase tracking-widest text-xs transition-all cursor-pointer">New Configuration</button>
        </motion.div>
      </div>
    </div>
  );
}

function ScoreBarCard({ label, score }) {
  const color = getScoreColor(score);
  const displayScore = useCountUp(score, 1200);

  return (
    <div className="bg-[#0A0A0A] rounded-[24px] border border-white/5 p-8 noise-overlay shadow-xl transition-all hover:border-[#D4121B]/30 group">
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <p className="text-[10px] font-black text-[#707070] uppercase tracking-widest group-hover:text-[#F5F5F5] transition-colors">{label}</p>
          <span className="font-mono text-xl font-black" style={{ color }}>{displayScore}</span>
        </div>
        <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${score}%` }}
            transition={{ duration: 1.5, ease: "circOut" }}
            className="h-full"
            style={{ backgroundColor: color }}
          />
        </div>
      </div>
    </div>
  );
}
