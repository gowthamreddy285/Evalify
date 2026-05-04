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
              whileHover={{ y: -3, boxShadow: `0 8px 24px ${d.color}20` }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              onClick={() => dispatch({ type: 'SET_DIFFICULTY', payload: d.key })}
              className={`relative p-5 rounded-[14px] border text-left cursor-pointer transition-all duration-300 noise-overlay ${selected ? 'border-[#6C63FF] bg-[#6C63FF]/10 shadow-[0_0_24px_rgba(108,99,255,0.2)]' : 'border-[#2A2A3A] bg-[#1A1A24] hover:border-[#6C63FF]/30'}`}
            >
              <div className="relative z-10">
                {selected && (
                  <motion.div initial={{scale:0}} animate={{scale:1}} className="absolute -top-2 -right-2 w-6 h-6 bg-[#6C63FF] rounded-full flex items-center justify-center">
                    <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  </motion.div>
                )}
                <p className="text-lg font-bold mb-1" style={{ color: d.color }}>{d.label}</p>
                <p className="text-xs text-[#8B8BA0] mb-3 font-mono">{d.questions} questions</p>
                <p className="text-xs text-[#8B8BA0] leading-relaxed mb-3">{d.description}</p>
                {/* Intensity dots */}
                <div className="flex gap-1.5">
                  {[1,2,3,4].map(n => (
                    <div key={n} className="w-2.5 h-2.5 rounded-full transition-colors" style={{ backgroundColor: n <= d.intensity ? d.color : '#2A2A3A' }} />
                  ))}
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Answer mode toggle */}
      <div className="mb-10">
        <p className="text-sm text-[#8B8BA0] mb-3 text-center font-semibold uppercase tracking-wider">Answer Mode</p>
        <div className="flex bg-[#1A1A24] rounded-full p-1 border border-[#2A2A3A] max-w-xs mx-auto">
          {[{key:'type',label:'⌨️ Type',icon:'keyboard'},{key:'speak',label:'🎙️ Speak',icon:'mic'}].map(opt => (
            <button key={opt.key} onClick={() => dispatch({type:'SET_ANSWER_MODE',payload:opt.key})} className={`flex-1 py-3 rounded-full text-sm font-semibold transition-all duration-300 cursor-pointer ${state.answerMode===opt.key ? 'bg-[#6C63FF] text-white shadow-[0_0_16px_rgba(108,99,255,0.3)]' : 'text-[#8B8BA0] hover:text-[#F0F0FF]'}`}>{opt.label}</button>
          ))}
        </div>
      </div>

      {/* Start button */}
      <motion.button
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => onStart?.()}
        className="w-full py-4 rounded-[14px] font-bold text-lg text-white btn-shine cursor-pointer"
        style={{ background: 'linear-gradient(135deg, #6C63FF 0%, #00D4AA 100%)' }}
        id="start-interview-btn"
      >
        Start Interview →
      </motion.button>
    </div>
  );
}
