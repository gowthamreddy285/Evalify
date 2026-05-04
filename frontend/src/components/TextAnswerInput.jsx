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
          className="w-full h-full min-h-[200px] bg-[#1A1A24] border border-[#2A2A3A] rounded-[14px] p-5 text-[#F0F0FF] text-sm resize-none focus:border-[#6C63FF] focus:outline-none transition-colors placeholder:text-[#8B8BA0]/60 disabled:opacity-50"
          id="answer-textarea"
        />
        <div className="absolute bottom-3 right-4 text-xs text-[#8B8BA0] font-mono">
          {wordCount} {wordCount === 1 ? 'word' : 'words'}
        </div>
      </div>

      <motion.button
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleSubmit}
        disabled={!text.trim() || disabled}
        className="w-full py-3.5 bg-[#6C63FF] hover:bg-[#7B73FF] disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded-[11px] btn-shine cursor-pointer transition-colors"
        id="submit-answer-btn"
      >
        Submit Answer →
      </motion.button>
    </div>
  );
}
