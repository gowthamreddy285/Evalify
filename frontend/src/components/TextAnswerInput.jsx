import { useState } from 'react';
import { motion } from 'framer-motion';

export default function TextAnswerInput({ onSubmit, disabled }) {
  const [text, setText] = useState('');

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;

  const handleSubmit = () => {
    if (!text.trim() || disabled) return;
    onSubmit(text.trim());
    setText('');
  };

  return (
    <div className="flex flex-col h-full">
      <div className="relative flex-1 mb-4">
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Type your answer here... Take your time."
          disabled={disabled}
          rows={8}
          className="w-full h-full min-h-[250px] bg-[#030303] border border-white/5 rounded-2xl p-6 text-[#F5F5F5] text-sm resize-none focus:border-[#D4121B]/50 focus:outline-none transition-all placeholder:text-[#707070]/40 disabled:opacity-50 font-medium leading-relaxed"
          id="answer-textarea"
        />
        <div className="absolute bottom-4 right-6 text-[10px] text-[#707070] font-black uppercase tracking-widest bg-[#0A0A0A] px-2 py-1 rounded border border-white/5">
          {wordCount} {wordCount === 1 ? 'word' : 'words'}
        </div>
      </div>

      <motion.button
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleSubmit}
        disabled={!text.trim() || disabled}
        className="w-full py-4 bg-[#D4121B] hover:bg-[#E61A23] disabled:opacity-20 disabled:cursor-not-allowed text-white font-black rounded-2xl btn-shine cursor-pointer transition-all shadow-xl shadow-[#D4121B]/20 text-[10px] uppercase tracking-widest"
        id="submit-answer-btn"
      >
        Submit Answer →
      </motion.button>
    </div>
  );
}
