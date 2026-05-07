import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function FeedbackAccordion({ results, questions }) {
  const [openIndex, setOpenIndex] = useState(null);

  const toggle = (i) => setOpenIndex(openIndex === i ? null : i);

  if (!results?.length) {
    return (
      <div className="text-center py-16 bg-[#0A0A0A] border border-dashed border-white/5 rounded-3xl">
        <p className="text-[#707070] font-black uppercase tracking-widest text-xs">Awaiting data registry...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {results.map((r, i) => {
        const q = questions?.[i];
        const isOpen = openIndex === i;

        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-[#0A0A0A] border border-white/5 rounded-[32px] overflow-hidden noise-overlay shadow-2xl"
          >
            {/* Row header */}
            <button
              onClick={() => toggle(i)}
              className="w-full flex items-center gap-8 p-8 text-left cursor-pointer hover:bg-white/[0.02] transition-all"
            >
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-[#D4121B] uppercase tracking-[0.3em] mb-2">Protocol Q{i+1}</span>
                <span className="text-lg font-black text-[#F5F5F5] uppercase tracking-tighter leading-none">
                  {q?.question?.substring(0, 80)}...
                </span>
              </div>
              <div className="ml-auto flex items-center gap-6">
                <div className="text-right">
                   <p className="text-[10px] font-black text-[#707070] uppercase tracking-widest mb-1">Score</p>
                   <p className="text-xl font-black text-[#F5F5F5]">{Math.round(r?.scores?.final || 0)}%</p>
                </div>
                <motion.svg
                  animate={{ rotate: isOpen ? 180 : 0 }}
                  className="w-6 h-6 text-[#707070]"
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </motion.svg>
              </div>
            </button>

            {/* Expanded content */}
            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden border-t border-white/5"
                >
                  <div className="p-10 space-y-12">
                    {/* Full Question */}
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.4em] text-[#D4121B] mb-4 font-black">The Challenge</p>
                      <h3 className="text-2xl font-black text-[#F5F5F5] leading-tight uppercase tracking-tight italic">
                        "{q?.question}"
                      </h3>
                    </div>

                    {/* Candidate Answer */}
                    <div className="bg-[#030303] p-8 rounded-[24px] border border-white/5">
                      <p className="text-[10px] uppercase tracking-[0.3em] text-[#707070] mb-6 font-black">Your Response</p>
                      <p className="text-lg text-[#F5F5F5]/80 font-medium leading-relaxed italic">
                        "{r.candidate_answer || 'No response captured.'}"
                      </p>
                    </div>

                    {/* AI Feedback */}
                    <div className="grid md:grid-cols-2 gap-10 pt-4">
                      <div className="space-y-8">
                        <div>
                          <p className="text-[10px] uppercase tracking-[0.3em] text-[#D4121B] mb-4 font-black">AI Evaluation</p>
                          <p className="text-[#F5F5F5] text-sm leading-relaxed font-bold">
                            {r.feedback?.overall_summary}
                          </p>
                        </div>
                        
                        {r.feedback?.strengths?.length > 0 && (
                          <div>
                            <p className="text-[10px] uppercase tracking-[0.3em] text-[#707070] mb-4 font-black">Core Strengths</p>
                            <ul className="space-y-3">
                              {r.feedback.strengths.map((s, idx) => (
                                <li key={idx} className="text-xs text-[#F5F5F5] font-medium flex gap-3">
                                  <span className="text-[#D4121B] font-black">→</span> {s}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>

                      <div className="bg-[#D4121B]/5 border border-[#D4121B]/10 rounded-[32px] p-8">
                        <p className="text-[10px] uppercase tracking-[0.3em] text-[#D4121B] mb-6 font-black">Optimization Tips</p>
                        <ul className="space-y-6">
                          {r.feedback?.improvement_tips?.map((tip, idx) => (
                            <li key={idx} className="flex gap-4">
                              <div className="w-6 h-6 rounded-lg bg-[#D4121B]/20 flex-shrink-0 flex items-center justify-center text-[10px] text-[#D4121B] font-black">
                                {idx + 1}
                              </div>
                              <p className="text-xs text-[#F5F5F5] font-bold leading-relaxed">{tip}</p>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </div>
  );
}
