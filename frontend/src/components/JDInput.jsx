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
      <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} className="max-w-2xl mx-auto bg-[#1A1A24] rounded-[14px] border border-[#2A2A3A] p-6 border-l-[3px] border-l-[#00D4AA] noise-overlay">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-5">
            <span className="px-4 py-1.5 rounded-[18px] bg-[#6C63FF]/15 text-[#A59FFF] text-sm font-bold border border-[#6C63FF]/30">{result.job_role || 'Role'}</span>
            {expColor && <span className="px-3 py-1 rounded-[18px] text-xs font-semibold border" style={{backgroundColor: expColor.bg, color: expColor.text, borderColor: expColor.bg}}>{result.experience_level}</span>}
          </div>
          {result.required_skills?.length > 0 && (
            <div className="mb-5">
              <p className="text-xs uppercase tracking-wider text-[#8B8BA0] mb-2 font-semibold">Required Skills</p>
              <div className="flex flex-wrap gap-2">{result.required_skills.map((s,i) => <SkillBadge key={i} skill={s} index={i+3} />)}</div>
            </div>
          )}
          {result.responsibilities?.length > 0 && (
            <div className="mb-5">
              <p className="text-xs uppercase tracking-wider text-[#8B8BA0] mb-2 font-semibold">Responsibilities</p>
              <ul className="space-y-1.5">{result.responsibilities.map((r,i) => <li key={i} className="text-sm text-[#F0F0FF] flex gap-2"><span className="text-[#00D4AA] mt-0.5">•</span>{r}</li>)}</ul>
            </div>
          )}
          <div className="flex gap-3 mt-6">
            <button onClick={() => {setResult(null); dispatch({type:'SET_JD_DATA',payload:null});}} className="px-5 py-3 rounded-[11px] border border-[#2A2A3A] text-[#8B8BA0] hover:text-[#F0F0FF] hover:border-[#6C63FF]/50 transition-colors cursor-pointer text-sm font-medium">Change</button>
            <button onClick={() => onComplete?.()} className="flex-1 py-3 bg-[#6C63FF] hover:bg-[#7B73FF] text-white font-semibold rounded-[11px] btn-shine cursor-pointer">Continue →</button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Toggle */}
      <div className="flex bg-[#1A1A24] rounded-full p-1 mb-8 border border-[#2A2A3A] max-w-xs mx-auto">
        {[{key:'role',label:'Enter Role'},{key:'paste',label:'Paste JD'}].map(opt => (
          <button key={opt.key} onClick={() => setMode(opt.key)} className={`flex-1 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 cursor-pointer ${mode===opt.key ? 'bg-[#6C63FF] text-white shadow-[0_0_16px_rgba(108,99,255,0.3)]' : 'text-[#8B8BA0] hover:text-[#F0F0FF]'}`}>{opt.label}</button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {mode === 'paste' ? (
          <motion.div key="paste" initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-20}}>
            <textarea value={jdText} onChange={e => setJdText(e.target.value)} placeholder="Paste the full job description here... Include responsibilities, requirements, and preferred qualifications." rows={8} className="w-full bg-[#1A1A24] border border-[#2A2A3A] rounded-[14px] p-5 text-[#F0F0FF] text-sm resize-none focus:border-[#6C63FF] focus:outline-none transition-colors placeholder:text-[#8B8BA0]/60" />
          </motion.div>
        ) : (
          <motion.div key="role" initial={{opacity:0,x:-20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:20}}>
            <input value={jobRole} onChange={e => setJobRole(e.target.value)} placeholder="e.g. Backend Developer, ML Engineer, Product Manager..." className="w-full bg-[#1A1A24] border border-[#2A2A3A] rounded-[14px] px-5 py-4 text-[#F0F0FF] text-sm focus:border-[#6C63FF] focus:outline-none transition-colors placeholder:text-[#8B8BA0]/60" />
          </motion.div>
        )}
      </AnimatePresence>

      <button onClick={handleAnalyze} disabled={loading} className="mt-6 w-full py-3.5 bg-[#6C63FF] hover:bg-[#7B73FF] disabled:opacity-50 text-white font-semibold rounded-[11px] btn-shine cursor-pointer transition-colors" id="analyze-jd-btn">
        {loading ? <span className="inline-flex items-center gap-2"><svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Analyzing...</span> : 'Analyze'}
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
