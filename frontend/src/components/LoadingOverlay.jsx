import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

const messages = [
  'Evaluating your answer...',
  'Analyzing grammar...',
  'Generating feedback...',
];

export default function LoadingOverlay({ show }) {
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    if (!show) {
      setMsgIndex(0);
      return;
    }
    const interval = setInterval(() => {
      setMsgIndex(prev => (prev + 1) % messages.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [show]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-[#0F0F13]/80 backdrop-blur-md rounded-[14px]"
        >
          {/* Spinner */}
          <div className="relative w-14 h-14 mb-6">
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-[#2A2A3A]"
            />
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#6C63FF] border-r-[#00D4AA]"
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
            />
          </div>

          {/* Cycling message */}
          <AnimatePresence mode="wait">
            <motion.p
              key={msgIndex}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
              className="text-sm text-[#8B8BA0] font-medium"
            >
              {messages[msgIndex]}
            </motion.p>
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
