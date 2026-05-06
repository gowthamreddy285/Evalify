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
  const [evalIndex, setEvalIndex] = useState(-1);
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
    const allResults = [];
    
    try {
      for (let i = 0; i < questions.length; i++) {
        setEvalIndex(i);
        const q = questions[i];
        const a = answers[i];
        
        if (!a || a.content === '[Skipped]') {
          allResults.push({
            scores: { final_score: 0, breakdown: { relevance: 0, technical: 0, communication: 0 } },
            feedback: { overall_summary: 'Question was skipped.', strengths: [], weaknesses: ['Question not answered.'], improvement_tips: ['Always try to provide at least a brief answer.'] },
            reference_answer: 'Not available for skipped question.',
            candidate_answer: '[Skipped]'
          });
          continue;
        }

        let res;
        if (a.type === 'audio' && a.audioBlob) {
          res = await evaluateAudio({ question: q.question, audioBlob: a.audioBlob });
        } else {
          res = await evaluateText({ question: q.question, answer: a.content });
        }
        
        allResults.push({ ...res, candidate_answer: a.content });
      }

      // Add all results to state
      allResults.forEach(r => dispatch({ type: 'ADD_RESULT', payload: r }));
      
      // Calculate final score
      const avgFinal = Math.round(allResults.reduce((s, r) => s + (r?.scores?.final_score || 0), 0) / allResults.length);

      // Save each answer to MongoDB
      if (sessionId) {
        for (let i = 0; i < allResults.length; i++) {
          const r = allResults[i];
          const q = questions[i];
          try {
            await saveAnswer({
              session_id: sessionId,
              question_id: q.id || '',
              candidate_answer: r.candidate_answer || '',
              reference_answer: r.reference_answer || '',
              scores: {
                correctness: r.scores?.breakdown?.relevance || 0,
                ai_judge: r.scores?.breakdown?.technical || 0,
                similarity: r.scores?.breakdown?.similarity || 0,
                keyword_coverage: r.scores?.breakdown?.keyword_coverage || 0,
                communication: r.scores?.breakdown?.communication || 0,
                grammar: r.nlp_analysis?.grammar_score || 0,
                clarity: r.nlp_analysis?.clarity_score || 0,
                professionalism: r.nlp_analysis?.professionalism_score || 0,
                length: r.nlp_analysis?.length_score || 0,
                delivery: r.scores?.breakdown?.delivery || 0,
                final: r.scores?.final_score || 0,
              },
              feedback: {
                strengths: r.feedback?.strengths || [],
                weaknesses: r.feedback?.weaknesses || [],
                improvement_tips: r.feedback?.improvement_tips || [],
                overall_summary: r.feedback?.overall_summary || '',
              },
            });
          } catch (err) {
            console.error(`Failed to save answer ${i + 1}:`, err);
          }
        }

        // Complete the session
        try {
          await completeSession(sessionId, avgFinal);
        } catch (err) {
          console.error('Failed to complete session:', err);
        }
      }

      addToast('Evaluation complete & saved!', 'success');
    } catch (err) {
      console.error(err);
      addToast('Some answers could not be evaluated.', 'error');
    } finally {
      setEvaluating(false);
      setEvalIndex(-1);
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
                 {Math.round(((evalIndex + 1) / questions.length) * 100)}%
               </div>
            </div>
            <h2 className="text-2xl font-black text-[#F5F5F5] mb-4 tracking-[-0.03em] uppercase">Generating Report</h2>
            <p className="text-[#707070] text-sm mb-8 leading-relaxed font-medium">Analyzing your responses, technical depth, and delivery quality with precision...</p>
            <div className="space-y-4">
              {questions.map((q, i) => (
                <div key={i} className="flex items-center gap-4 bg-[#030303] p-3 rounded-xl border border-white/5">
                  <div className={`w-2 h-2 rounded-full ${i < evalIndex ? 'bg-[#D4121B]' : i === evalIndex ? 'bg-[#FF3B3B] animate-pulse shadow-[0_0_8px_rgba(255,59,59,0.5)]' : 'bg-white/5'}`} />
                  <p className={`text-[10px] text-left truncate flex-1 font-bold uppercase tracking-widest ${i <= evalIndex ? 'text-[#F5F5F5]' : 'text-[#707070]'}`}>{q.question}</p>
                  {i < evalIndex && (
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
  results.forEach(r => Object.keys(r?.scores?.breakdown || {}).forEach(k => breakdownKeys.add(k)));
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
          className="flex flex-wrap gap-5 justify-center no-print"
        >
          <button onClick={() => { dispatch({type:'RESET_SESSION'}); navigate('/interview/session'); }} className="px-8 py-4 rounded-xl border border-white/10 text-[#707070] hover:text-[#F5F5F5] hover:bg-white/5 font-bold uppercase tracking-widest text-xs transition-all cursor-pointer">Re-attempt Session</button>
          <button onClick={() => { dispatch({type:'RESET_ALL'}); navigate('/interview/setup'); }} className="px-8 py-4 rounded-xl border border-white/10 text-[#707070] hover:text-[#F5F5F5] hover:bg-white/5 font-bold uppercase tracking-widest text-xs transition-all cursor-pointer">New Configuration</button>
          <button onClick={() => { window.print(); }} className="px-8 py-4 bg-[#D4121B] hover:bg-[#FF3B3B] text-white font-bold uppercase tracking-widest text-xs rounded-xl btn-shine cursor-pointer transition-all flex items-center gap-3 shadow-xl shadow-[#D4121B]/20">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
            Export Report
          </button>
        </motion.div>

        {/* PRINT ONLY REPORT CONTENT */}
        <div className="print-only pt-10 px-4">
          <div className="border-b-4 border-black pb-8 mb-12 flex justify-between items-end">
            <div>
              <h1 className="text-5xl font-black text-black tracking-tighter uppercase mb-2">Performance Report</h1>
              <p className="text-xs font-bold text-gray-400 tracking-[0.2em] uppercase">Advanced AI Evaluation Matrix</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-bold text-gray-300 uppercase mb-1">Generated</p>
              <p className="text-sm font-black text-black">{new Date().toLocaleDateString()}</p>
            </div>
          </div>

          <div className="bg-black p-12 mb-16 flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-[0.4em] font-black text-[#D4121B] mb-4">Final Assessment</p>
              <h2 className="text-5xl font-black text-white uppercase tracking-tight">Performance Index</h2>
            </div>
            <div className="text-center">
              <p className="text-[6.5rem] leading-none font-black text-[#D4121B] tracking-tighter">{avgFinal}%</p>
            </div>
          </div>

          <div className="space-y-20">
            {results.map((r, i) => (
              <div key={i} className="page-break-inside-avoid relative pl-16 border-l-2 border-gray-100">
                <div className="absolute left-[-16px] top-0 w-8 h-8 bg-black text-white flex items-center justify-center text-[12px] font-black">
                  {i+1}
                </div>
                
                <h3 className="text-2xl font-black mb-10 text-black uppercase tracking-tight leading-tight">
                  {questions[i]?.question}
                </h3>

                <div className="space-y-10">
                   <div className="relative">
                     <p className="text-[10px] uppercase tracking-widest text-gray-400 font-black mb-4 italic">Candidate Response</p>
                     <p className="text-[14px] text-gray-900 bg-gray-50 p-8 border-l-8 border-black italic leading-relaxed font-medium">
                       "{r.candidate_answer}"
                     </p>
                   </div>

                   <div className="relative">
                     <p className="text-[10px] uppercase tracking-widest text-[#D4121B] font-black mb-4 italic">Evaluation Logic</p>
                     <p className="text-[14px] text-gray-900 bg-[#D4121B]/5 p-8 border-l-8 border-[#D4121B] leading-relaxed font-medium">
                       {r.reference_answer}
                     </p>
                   </div>

                   <div className="grid grid-cols-1 gap-8">
                     <div className="grid grid-cols-3 gap-8">
                        <div className="border border-gray-100 p-6">
                          <p className="text-[10px] font-black text-[#D4121B] mb-5 uppercase tracking-widest">Strengths</p>
                          <ul className="space-y-3">{r.feedback?.strengths?.map((s,j) => <li key={j} className="text-[12px] text-gray-700 font-bold flex gap-2"><span>•</span> {s}</li>)}</ul>
                        </div>
                        <div className="border border-gray-100 p-6">
                          <p className="text-[10px] font-black text-gray-400 mb-5 uppercase tracking-widest">Gaps</p>
                          <ul className="space-y-3">{r.feedback?.weaknesses?.map((w,j) => <li key={j} className="text-[12px] text-gray-700 font-bold flex gap-2"><span>•</span> {w}</li>)}</ul>
                        </div>
                        <div className="border border-gray-100 p-6">
                          <p className="text-[10px] font-black text-gray-800 mb-5 uppercase tracking-widest">Actions</p>
                          <ul className="space-y-3">{r.feedback?.improvement_tips?.map((t,j) => <li key={j} className="text-[12px] text-gray-700 font-bold flex gap-2"><span>•</span> {t}</li>)}</ul>
                        </div>
                     </div>

                     {r.nlp_analysis && (
                       <div className="bg-black p-8 flex justify-between items-center">
                          <div className="flex gap-12">
                            <div>
                              <p className="text-[9px] font-black text-[#707070] uppercase tracking-widest mb-2">Grammar</p>
                              <p className="text-2xl font-black text-white">{r.nlp_analysis.grammar_score}%</p>
                            </div>
                            <div>
                              <p className="text-[9px] font-black text-[#707070] uppercase tracking-widest mb-2">Clarity</p>
                              <p className="text-2xl font-black text-white">{r.nlp_analysis.clarity_score}%</p>
                            </div>
                            <div>
                              <p className="text-[9px] font-black text-[#707070] uppercase tracking-widest mb-2">Prof.</p>
                              <p className="text-2xl font-black text-white">{r.nlp_analysis.professionalism_score}%</p>
                            </div>
                          </div>
                          <div className="text-right">
                             <p className="text-[9px] font-black text-[#D4121B] uppercase tracking-widest mb-2">Q-Index</p>
                             <p className="text-3xl font-black text-white">{r.scores.final_score}%</p>
                          </div>
                       </div>
                     )}
                   </div>
                </div>
              </div>
            ))}
          </div>
        </div>
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
