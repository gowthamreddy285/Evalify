import { motion } from 'framer-motion';
import { useInterview } from '../context/InterviewContext';
import { DIFFICULTIES } from '../utils/constants';

export default function DifficultyPicker({ onStart }) {
  const { state, dispatch } = useInterview();

  return (
    <div className="max-w-3xl mx-auto">
      {/* Difficulty cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-10">
        {DIFFICULTIES.map((d, i) => {
          const selected = state.difficulty === d.key;
          return (
            <motion.button
              key={d.key}
              whileHover={{ y: -5, boxShadow: `0 12px 32px ${d.color}20` }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              onClick={() => dispatch({ type: 'SET_DIFFICULTY', payload: d.key })}
              className={`relative p-6 rounded-[24px] border text-left cursor-pointer transition-all duration-300 noise-overlay ${selected ? 'border-[#D4121B] bg-[#D4121B]/5 shadow-[0_0_32px_rgba(212,18,27,0.15)]' : 'border-white/5 bg-[#0A0A0A] hover:border-white/20'}`}
            >
              <div className="relative z-10">
                {selected && (
                  <motion.div initial={{scale:0}} animate={{scale:1}} className="absolute -top-2 -right-2 w-7 h-7 bg-[#D4121B] rounded-full flex items-center justify-center shadow-lg shadow-[#D4121B]/30">
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  </motion.div>
                )}
                <p className="text-xl font-black mb-1 uppercase tracking-tighter" style={{ color: d.color }}>{d.label}</p>

                <p className="text-xs text-[#707070] leading-relaxed mb-6 font-medium">{d.description}</p>
                {/* Intensity dots */}
                <div className="flex gap-2">
                  {[1,2,3,4].map(n => (
                    <div key={n} className="w-2.5 h-2.5 rounded-full transition-all" style={{ backgroundColor: n <= d.intensity ? d.color : '#1A1A1A', boxShadow: n <= d.intensity ? `0 0 8px ${d.color}60` : 'none' }} />
                  ))}
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Answer mode toggle */}
      <div className="mb-12">
        <p className="text-[10px] text-[#707070] mb-4 text-center font-black uppercase tracking-[0.3em]">Answer Mode</p>
        <div className="flex bg-[#0A0A0A] rounded-full p-1.5 border border-white/5 max-w-xs mx-auto shadow-inner">
          {[{key:'type',label:'Type',icon:'keyboard'},{key:'speak',label:'Speak',icon:'mic'}].map(opt => (
            <button key={opt.key} onClick={() => dispatch({type:'SET_ANSWER_MODE',payload:opt.key})} className={`flex-1 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-300 cursor-pointer ${state.answerMode===opt.key ? 'bg-[#D4121B] text-white shadow-lg shadow-[#D4121B]/20' : 'text-[#707070] hover:text-[#F5F5F5]'}`}>{opt.label}</button>
          ))}
        </div>
      </div>

      {/* Start button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => onStart?.()}
        className="w-full py-5 rounded-[24px] font-black text-xs uppercase tracking-[0.3em] text-white btn-shine cursor-pointer shadow-2xl shadow-[#D4121B]/20"
        style={{ background: 'linear-gradient(135deg, #D4121B 0%, #030303 100%)' }}
        id="start-interview-btn"
      >
        Start Interview →
      </motion.button>
    </div>
  );
}
