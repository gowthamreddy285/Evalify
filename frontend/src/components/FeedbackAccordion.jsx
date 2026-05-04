import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getScoreColor } from '../utils/constants';

export default function FeedbackAccordion({ results, questions }) {
  const [openIndex, setOpenIndex] = useState(null);

  const toggle = (i) => setOpenIndex(openIndex === i ? null : i);

  if (!results?.length) {
    return (
      <div className="text-center py-12">
        <p className="text-[#8B8BA0]">No results yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {results.map((r, i) => {
        const q = questions?.[i];
        const score = r?.scores?.final_score ?? 0;
        const color = getScoreColor(score);
        const isOpen = openIndex === i;

        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-[#0A0A0A] rounded-[24px] border border-white/5 overflow-hidden noise-overlay shadow-xl"
            style={{ borderLeftWidth: 4, borderLeftColor: color }}
          >
            {/* Row header */}
            <button
              onClick={() => toggle(i)}
              className="w-full flex items-center gap-6 p-6 text-left cursor-pointer hover:bg-white/[0.02] transition-all"
            >
              <span className="text-[10px] font-black text-[#707070] uppercase tracking-widest w-8">Q{i+1}</span>
              <span className="flex-1 text-sm text-[#F5F5F5] font-bold uppercase tracking-tight truncate">
                {q?.question || `Question ${i+1}`}
              </span>
              <div className="flex items-center gap-4">
                <span className="px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-widest border"
                  style={{ backgroundColor: `${color}10`, color, borderColor: `${color}20` }}
                >
                  {score}%
                </span>
                <motion.svg
                  animate={{ rotate: isOpen ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="w-5 h-5 text-[#707070]"
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
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="px-6 pb-8 pt-2 space-y-8 border-t border-white/5">
                    {/* Full question */}
                    <div className="pt-4">
                      <p className="text-[10px] uppercase tracking-[0.2em] text-[#707070] mb-3 font-black">Question Detail</p>
                      <p className="text-lg font-black text-[#F5F5F5] leading-tight uppercase tracking-tight">{q?.question}</p>
                    </div>

                    {/* Candidate answer */}
                    {r?.candidate_answer && (
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.2em] text-[#707070] mb-4 font-black italic">Candidate Response</p>
                        <div className="bg-[#030303] p-6 rounded-[20px] border border-white/5 relative">
                          <div className="absolute top-0 left-0 w-1 h-full bg-[#D4121B] rounded-full" />
                          <p className="text-sm text-[#F5F5F5] leading-relaxed font-medium italic opacity-80">
                            "{r.candidate_answer}"
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Reference answer */}
                    {r?.reference_answer && (
                      <div className="bg-[#D4121B]/5 rounded-[24px] border border-[#D4121B]/10 p-8 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-[#D4121B]" />
                        <p className="text-[10px] uppercase tracking-[0.2em] text-[#D4121B] mb-4 font-black flex items-center gap-2">
                          <span className="w-5 h-5 rounded-lg bg-[#D4121B] text-white flex items-center justify-center text-[10px]">★</span>
                          Expert Model Baseline
                        </p>
                        <p className="text-sm text-[#F5F5F5] leading-relaxed font-medium">
                          {r.reference_answer}
                        </p>
                      </div>
                    )}

                    {/* Grammar & Communication details */}
                    {r?.nlp_analysis && (
                      <div className="bg-[#030303] border border-white/5 rounded-[24px] p-6">
                        <p className="text-[10px] uppercase tracking-[0.2em] text-[#707070] mb-6 font-black">Linguistic Analysis</p>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
                          <div className="text-center">
                            <p className="text-[10px] text-[#707070] font-black uppercase tracking-widest mb-2">Grammar</p>
                            <p className="text-2xl font-black text-[#F5F5F5]">
                              {r.nlp_analysis.grammar_score}%
                            </p>
                            <p className="text-[9px] font-black text-[#D4121B] uppercase tracking-widest mt-1">{r.nlp_analysis.grammar_errors} ERRORS</p>
                          </div>
                          <div className="text-center border-l border-white/5">
                            <p className="text-[10px] text-[#707070] font-black uppercase tracking-widest mb-2">Clarity</p>
                            <p className="text-2xl font-black text-[#F5F5F5]">{r.nlp_analysis.clarity_score}%</p>
                          </div>
                          <div className="text-center border-l border-white/5">
                            <p className="text-[10px] text-[#707070] font-black uppercase tracking-widest mb-2">Proficiency</p>
                            <p className="text-2xl font-black text-[#F5F5F5]">{r.nlp_analysis.professionalism_score}%</p>
                          </div>
                          <div className="text-center border-l border-white/5">
                            <p className="text-[10px] text-[#707070] font-black uppercase tracking-widest mb-2">Structure</p>
                            <p className="text-2xl font-black text-[#F5F5F5]">{r.nlp_analysis.length_score}%</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Feedback sections */}
                    <div className="grid md:grid-cols-3 gap-6">
                      {r?.feedback?.strengths?.length > 0 && (
                        <div className="bg-[#D4121B]/5 border border-[#D4121B]/10 rounded-[20px] p-6">
                          <div className="flex items-center gap-3 mb-5">
                            <div className="w-8 h-8 rounded-xl bg-[#D4121B]/10 flex items-center justify-center text-sm">✓</div>
                            <p className="text-[10px] font-black text-[#D4121B] uppercase tracking-widest">Strengths</p>
                          </div>
                          <ul className="space-y-4">{r.feedback.strengths.map((s,j) => <li key={j} className="text-xs text-[#F5F5F5] font-medium leading-relaxed flex gap-3"><span className="text-[#D4121B]">/</span> {s}</li>)}</ul>
                        </div>
                      )}
                      {r?.feedback?.weaknesses?.length > 0 && (
                        <div className="bg-white/5 border border-white/5 rounded-[20px] p-6">
                          <div className="flex items-center gap-3 mb-5">
                            <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-sm">✗</div>
                            <p className="text-[10px] font-black text-[#707070] uppercase tracking-widest">Gaps</p>
                          </div>
                          <ul className="space-y-4">{r.feedback.weaknesses.map((w,j) => <li key={j} className="text-xs text-[#F5F5F5] font-medium leading-relaxed flex gap-3"><span className="text-[#707070]">/</span> {w}</li>)}</ul>
                        </div>
                      )}
                      {r?.feedback?.improvement_tips?.length > 0 && (
                        <div className="bg-[#D4121B]/5 border border-[#D4121B]/10 rounded-[20px] p-6">
                          <div className="flex items-center gap-3 mb-5">
                            <div className="w-8 h-8 rounded-xl bg-[#D4121B]/5 flex items-center justify-center text-sm">💡</div>
                            <p className="text-[10px] font-black text-[#F5F5F5] uppercase tracking-widest">Growth Tips</p>
                          </div>
                          <ul className="space-y-4">{r.feedback.improvement_tips.map((t,j) => <li key={j} className="text-xs text-[#F5F5F5] font-medium leading-relaxed flex gap-3"><span className="text-[#D4121B]">/</span> {t}</li>)}</ul>
                        </div>
                      )}
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
