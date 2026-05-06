import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { QUESTION_TYPE_COLORS } from '../utils/constants';

export default function QuestionCard({ question, index, total }) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const typeColor = QUESTION_TYPE_COLORS[question?.type] || QUESTION_TYPE_COLORS.Technical;

  useEffect(() => {
    // Stop speaking if question changes
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, [question]);

  const toggleSpeech = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      const utterance = new SpeechSynthesisUtterance(question?.question);
      utterance.rate = 0.95;
      utterance.pitch = 1;
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      
      setIsSpeaking(true);
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="bg-[#0A0A0A] rounded-[24px] border border-white/5 p-8 lg:p-10 h-full gradient-border noise-overlay shadow-2xl"
    >
      <div className="relative z-10 flex flex-col h-full">
        {/* Header badges */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <span className="px-4 py-1.5 rounded-full bg-[#D4121B]/10 text-[#F5F5F5] text-[10px] font-black uppercase tracking-widest border border-[#D4121B]/20">
              Q{index + 1}
            </span>
            <span
              className="px-3 py-1 rounded-[18px] text-xs font-semibold border"
              style={{ backgroundColor: typeColor.bg, color: typeColor.text, borderColor: typeColor.bg }}
            >
              {question?.type || 'Technical'}
            </span>
          </div>

          <button 
            onClick={toggleSpeech}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-lg ${isSpeaking ? 'bg-[#D4121B] text-white shadow-[#D4121B]/30' : 'bg-[#030303] border border-white/5 text-[#707070] hover:text-[#F5F5F5] hover:border-[#D4121B]/30'}`}
            title={isSpeaking ? "Stop Reading" : "Read Question"}
          >
            {isSpeaking ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><rect x="6" y="6" width="12" height="12" rx="2" /></svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>
            )}
          </button>
        </div>

        {/* Question text */}
        <p className="text-lg lg:text-xl font-semibold text-[#F0F0FF] leading-relaxed tracking-[-0.01em] flex-1">
          {question?.question || 'Loading question...'}
        </p>

        {/* Topic tag */}
        {question?.topic && (
          <div className="mt-8 pt-6 border-t border-white/5">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#707070]">
              Topic: <span className="text-[#D4121B]">{question.topic}</span>
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

