import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { analyzeJD } from '../utils/api';
import { useInterview } from '../context/InterviewContext';
import SkillBadge from './SkillBadge';
import { SkeletonCard } from './Skeleton';
import { EXP_LEVEL_COLORS } from '../utils/constants';

export default function JDInput({ onComplete }) {
  const { dispatch, addToast } = useInterview();
  const [mode, setMode] = useState('role'); // 'paste' | 'role'
  const [jdText, setJdText] = useState('');
  const [jobRole, setJobRole] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleAnalyze = async () => {
    const payload = mode === 'paste' ? { jd_text: jdText } : { job_role: jobRole };
    if (!payload.jd_text && !payload.job_role) {
      addToast('Please enter a job description or role', 'error');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await analyzeJD(payload);
      setResult(data);
      dispatch({ type: 'SET_JD_DATA', payload: data });
      addToast('Job description analyzed!', 'success');
    } catch (err) {
      setError(err.response?.data?.detail || 'Analysis failed.');
      addToast('JD analysis failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const expColor = result?.experience_level ? (EXP_LEVEL_COLORS[result.experience_level] || EXP_LEVEL_COLORS.Junior) : null;

  if (loading) return <div className="max-w-2xl mx-auto"><SkeletonCard /></div>;

  if (result) {
    return (
      <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} className="max-w-2xl mx-auto bg-[#0A0A0A] rounded-[24px] border border-white/5 p-8 border-l-[4px] border-l-[#D4121B] noise-overlay shadow-2xl">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <span className="px-4 py-1.5 rounded-full bg-[#D4121B]/10 text-[#F5F5F5] text-[10px] font-black uppercase tracking-widest border border-[#D4121B]/20">{result.job_role || 'Role'}</span>
            {expColor && <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border" style={{backgroundColor: `${expColor.text}10`, color: expColor.text, borderColor: `${expColor.text}20`}}>{result.experience_level}</span>}
          </div>
          {result.required_skills?.length > 0 && (
            <div className="mb-6">
              <p className="text-[10px] uppercase tracking-[0.2em] text-[#707070] mb-3 font-black">Required Skills</p>
              <div className="flex flex-wrap gap-2">{result.required_skills.map((s,i) => <SkillBadge key={i} skill={s} index={i+3} />)}</div>
            </div>
          )}
          {result.responsibilities?.length > 0 && (
            <div className="mb-6">
              <p className="text-[10px] uppercase tracking-[0.2em] text-[#707070] mb-3 font-black">Responsibilities</p>
              <ul className="space-y-2.5">{result.responsibilities.map((r,i) => <li key={i} className="text-sm text-[#F5F5F5] flex gap-3 leading-relaxed font-medium"><span className="text-[#D4121B] mt-1.5 w-1.5 h-1.5 rounded-full bg-[#D4121B] shrink-0" />{r}</li>)}</ul>
            </div>
          )}
          <div className="flex gap-4 mt-8">
            <button onClick={() => {setResult(null); dispatch({type:'SET_JD_DATA',payload:null});}} className="px-6 py-4 rounded-2xl border border-white/5 text-[#707070] hover:text-[#F5F5F5] hover:border-[#D4121B]/30 transition-all cursor-pointer text-[10px] font-black uppercase tracking-widest bg-[#030303]">Change</button>
            <button onClick={() => onComplete?.()} className="flex-1 py-4 bg-[#D4121B] hover:bg-[#E61A23] text-white font-black rounded-2xl btn-shine cursor-pointer shadow-xl shadow-[#D4121B]/20 text-[10px] uppercase tracking-widest">Continue →</button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Toggle */}
      <div className="flex bg-[#0A0A0A] rounded-full p-1.5 mb-10 border border-white/5 max-w-xs mx-auto shadow-inner">
        {[{key:'role',label:'Enter Role'},{key:'paste',label:'Paste JD'}].map(opt => (
          <button key={opt.key} onClick={() => setMode(opt.key)} className={`flex-1 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-300 cursor-pointer ${mode===opt.key ? 'bg-[#D4121B] text-white shadow-lg shadow-[#D4121B]/20' : 'text-[#707070] hover:text-[#F5F5F5]'}`}>{opt.label}</button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {mode === 'paste' ? (
          <motion.div key="paste" initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-10}}>
            <textarea value={jdText} onChange={e => setJdText(e.target.value)} placeholder="Paste the full job description here... Include responsibilities, requirements, and preferred qualifications." rows={8} className="w-full bg-[#030303] border border-white/5 rounded-2xl p-6 text-[#F5F5F5] text-sm resize-none focus:border-[#D4121B]/50 focus:outline-none transition-all placeholder:text-[#707070]/50 font-medium leading-relaxed" />
          </motion.div>
        ) : (
          <motion.div key="role" initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-10}}>
            <input value={jobRole} onChange={e => setJobRole(e.target.value)} placeholder="e.g. Backend Developer, ML Engineer, Product Manager..." className="w-full bg-[#030303] border border-white/5 rounded-2xl px-6 py-5 text-[#F5F5F5] text-sm focus:border-[#D4121B]/50 focus:outline-none transition-all placeholder:text-[#707070]/50 font-medium" />
          </motion.div>
        )}
      </AnimatePresence>

      <button onClick={handleAnalyze} disabled={loading} className="mt-8 w-full py-4 bg-[#D4121B] hover:bg-[#E61A23] disabled:opacity-50 text-white font-black rounded-2xl btn-shine cursor-pointer transition-all shadow-xl shadow-[#D4121B]/10 text-[10px] uppercase tracking-widest" id="analyze-jd-btn">
        {loading ? <span className="inline-flex items-center gap-3"><svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Synthesizing Data...</span> : 'Analyze Role'}
      </button>

      {error && (
        <div className="mt-5 p-4 rounded-[14px] bg-[#FF6B6B]/10 border border-[#FF6B6B]/20 text-center">
          <p className="text-[#FF6B6B] text-sm mb-2">{error}</p>
          <button onClick={handleAnalyze} className="text-sm text-[#FF6B6B] underline cursor-pointer">Retry</button>
        </div>
      )}
    </div>
  );
}
