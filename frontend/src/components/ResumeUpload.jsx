import { useCallback, useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { parseResume, saveResume } from '../utils/api';
import { useInterview } from '../context/InterviewContext';
import { useAuth } from '../context/AuthContext';
import SkillBadge from './SkillBadge';
import { SkeletonCard } from './Skeleton';

export default function ResumeUpload({ onComplete }) {
  const { dispatch, addToast } = useInterview();
  const { user, refreshUser } = useAuth();
  const [file, setFile] = useState(null);
  const [parsing, setParsing] = useState(false);
  const [parsed, setParsed] = useState(null);
  const [error, setError] = useState(null);
  const [showSaved, setShowSaved] = useState(!!user?.resume_data);

  useEffect(() => {
    if (user?.resume_data && !parsed) {
      setShowSaved(true);
    }
  }, [user]);

  const onDrop = useCallback((accepted, rejected) => {
    if (rejected.length > 0) {
      addToast('Only PDF files under 5MB are accepted', 'error');
      return;
    }
    if (accepted.length > 0) {
      setFile(accepted[0]);
      setParsed(null);
      setError(null);
      setShowSaved(false);
    }
  }, [addToast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxSize: 5 * 1024 * 1024,
    multiple: false,
  });

  const handleUseSaved = () => {
    if (user?.resume_data) {
      setParsed(user.resume_data);
      dispatch({ type: 'SET_RESUME_DATA', payload: user.resume_data });
      setShowSaved(false);
      addToast('Resumed with saved profile', 'success');
    }
  };

  const handleParse = async () => {
    if (!file) return;
    setParsing(true);
    setError(null);
    try {
      const data = await parseResume(file);
      setParsed(data);
      dispatch({ type: 'SET_RESUME_DATA', payload: data });
      
      // Auto-save to user profile
      try {
        await saveResume(data);
        refreshUser(); // Update context with new resume data
      } catch (saveErr) {
        console.error("Auto-save failed", saveErr);
      }

      addToast('Resume parsed and saved to profile!', 'success');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to parse resume.');
      addToast('Resume parsing failed', 'error');
    } finally {
      setParsing(false);
    }
  };

  const removeFile = () => {
    setFile(null);
    setParsed(null);
    setError(null);
    setShowSaved(!!user?.resume_data);
    dispatch({ type: 'SET_RESUME_DATA', payload: null });
  };

  const fmtSize = (b) => b < 1024 ? `${b} B` : b < 1048576 ? `${(b/1024).toFixed(1)} KB` : `${(b/1048576).toFixed(1)} MB`;

  if (parsing) {
    return <motion.div initial={{opacity:0}} animate={{opacity:1}} className="max-w-2xl mx-auto"><SkeletonCard /></motion.div>;
  }

  if (parsed) {
    return (
      <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} className="max-w-2xl mx-auto bg-[#0A0A0A] rounded-[24px] border border-white/5 p-8 border-l-[4px] border-l-[#D4121B] noise-overlay shadow-xl">
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-black text-[#F5F5F5] tracking-tighter uppercase">{parsed.name || 'Candidate Profile'}</h3>
            <button onClick={removeFile} className="text-[10px] font-black uppercase tracking-widest text-[#707070] hover:text-[#D4121B] transition-colors cursor-pointer">Remove</button>
          </div>
          {parsed.skills?.length > 0 && (
            <div className="mb-8">
              <p className="text-[10px] uppercase tracking-[0.2em] text-[#707070] mb-4 font-black">Identified Skills</p>
              <div className="flex flex-wrap gap-2.5">{parsed.skills.map((s,i) => <SkillBadge key={i} skill={s} index={i} />)}</div>
            </div>
          )}
          {parsed.projects?.length > 0 && (
            <div className="mb-8">
              <p className="text-[10px] uppercase tracking-[0.2em] text-[#707070] mb-4 font-black">Project Portfolio</p>
              <div className="space-y-3">{parsed.projects.map((p,i) => (
                <div key={i} className="bg-[#030303] rounded-[18px] border border-white/5 p-4 relative group hover:border-[#D4121B]/30 transition-colors">
                  <div className="absolute top-4 left-0 w-[2px] h-4 bg-[#D4121B]/50 group-hover:bg-[#D4121B] transition-all" />
                  <p className="text-sm font-black text-[#F5F5F5] uppercase tracking-tight ml-2">{typeof p === 'string' ? p : p.title || p.name}</p>
                  {p.description && <p className="text-xs text-[#707070] mt-2 ml-2 leading-relaxed font-medium line-clamp-2">{p.description}</p>}
                </div>
              ))}</div>
            </div>
          )}
          {parsed.education?.length > 0 && (
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-[#707070] mb-4 font-black">Academic Background</p>
              <div className="space-y-4 ml-2">
                {(Array.isArray(parsed.education) ? parsed.education : [parsed.education]).map((edu, i) => (
                  <div key={i} className="text-sm text-[#F5F5F5] font-medium">
                    <span className="font-black uppercase tracking-tight">{typeof edu === 'string' ? edu : edu.degree}</span>
                    {edu.institution && <span className="text-[#707070]"> — {edu.institution}</span>}
                    {edu.year && <span className="text-[#707070] text-[10px] font-black uppercase tracking-widest block mt-1">{edu.year}</span>}
                  </div>
                ))}
              </div>
            </div>
          )}
          <button onClick={() => onComplete?.()} className="mt-10 w-full py-4 bg-[#D4121B] hover:bg-[#FF3B3B] text-white font-black uppercase tracking-[0.2em] text-xs rounded-xl btn-shine cursor-pointer shadow-xl shadow-[#D4121B]/20 transition-all">Continue Engagement →</button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <AnimatePresence>
        {showSaved && user?.resume_data && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-8 p-8 bg-[#D4121B]/5 border border-[#D4121B]/10 rounded-[24px] overflow-hidden"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-[#D4121B] animate-pulse" />
                <p className="text-[10px] font-black text-[#D4121B] uppercase tracking-[0.3em]">Vault Profile Detected</p>
              </div>
              <button 
                onClick={() => setShowSaved(false)}
                className="text-[10px] font-black text-[#707070] hover:text-[#F5F5F5] uppercase tracking-widest transition-colors"
              >
                Ignore
              </button>
            </div>
            <h3 className="text-xl font-black text-[#F5F5F5] uppercase tracking-tight mb-2">{user.resume_data.name}</h3>
            <p className="text-xs text-[#707070] font-medium mb-6 line-clamp-1">
              Skills: {user.resume_data.skills?.join(', ')}
            </p>
            <button 
              onClick={handleUseSaved}
              className="w-full py-3 bg-[#D4121B] hover:bg-[#FF3B3B] text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-[#D4121B]/20"
            >
              Continue with Saved Profile
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div {...getRootProps()} id="resume-dropzone" className={`border-2 border-dashed rounded-[24px] p-16 text-center cursor-pointer transition-all duration-500 ${isDragActive ? 'border-[#D4121B] bg-[#D4121B]/5 shadow-[0_0_30px_rgba(212,18,27,0.1)]' : file ? 'border-[#D4121B]/40 bg-[#D4121B]/5' : 'border-white/5 bg-[#0A0A0A] hover:border-[#D4121B]/30'}`}>
        <input {...getInputProps()} />
        <div className={`mx-auto w-20 h-20 rounded-2xl flex items-center justify-center mb-8 transition-all ${isDragActive ? 'bg-[#D4121B]/20 scale-110' : 'bg-white/5'}`}>
          <svg className={`w-10 h-10 transition-colors ${isDragActive ? 'text-[#D4121B]' : 'text-[#707070]'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" /></svg>
        </div>
        {isDragActive ? <p className="text-[#D4121B] font-black text-xl uppercase tracking-tighter">Release to upload</p> : file ? (
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-[#D4121B] animate-pulse shadow-[0_0_8px_#D4121B]" />
              <span className="text-[#F5F5F5] font-black uppercase tracking-tight text-lg">{file.name}</span>
            </div>
            <span className="text-[#707070] text-[10px] font-black uppercase tracking-[0.2em]">({fmtSize(file.size)})</span>
            <button onClick={(e) => {e.stopPropagation(); removeFile();}} className="mt-2 text-[#707070] hover:text-[#D4121B] text-[10px] font-black uppercase tracking-widest underline decoration-2 underline-offset-4 cursor-pointer">Remove File</button>
          </div>
        ) : (<><p className="text-[#F5F5F5] font-black text-xl mb-2 uppercase tracking-tighter">Ingest Your Credentials</p><p className="text-[#707070] text-[10px] font-black uppercase tracking-[0.2em]">PDF FORMAT • MAXIMUM 5.0 MB</p></>)}
      </div>
      {file && <button onClick={handleParse} className="mt-8 w-full py-5 bg-[#D4121B] hover:bg-[#FF3B3B] text-white font-black uppercase tracking-[0.2em] text-xs rounded-xl btn-shine cursor-pointer shadow-xl shadow-[#D4121B]/20 transition-all" id="parse-resume-btn">Analyze Credentials</button>}
      {error && (
        <div className="mt-6 p-6 rounded-[24px] bg-[#D4121B]/5 border border-[#D4121B]/10 text-center">
          <p className="text-[#D4121B] text-xs font-black uppercase tracking-widest mb-4">{error}</p>
          <button onClick={handleParse} className="text-[10px] font-black uppercase tracking-widest text-[#D4121B] hover:text-[#FF3B3B] underline decoration-2 underline-offset-4 cursor-pointer">Re-attempt Analysis</button>
        </div>
      )}
    </div>
  );
}
