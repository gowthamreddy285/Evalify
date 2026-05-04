import { motion } from 'framer-motion';
import { useCountUp } from '../hooks/useCountUp';
import { getScoreColor } from '../utils/constants';

export default function ScoreCard({ result, onNext }) {
  const score = result?.scores?.final_score ?? 0;
  const displayScore = useCountUp(score, 1200);
  const color = getScoreColor(score);

  const breakdown = result?.scores?.breakdown || {};

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="bg-[#1A1A24] rounded-[14px] border border-[#2A2A3A] p-6 noise-overlay"
    >
      <div className="relative z-10">
        {/* Big score */}
        <div className="text-center mb-5">
          <p className="font-mono text-5xl font-bold tracking-tight" style={{ color }}>
            {displayScore}
          </p>
          <p className="text-xs text-[#8B8BA0] mt-1 uppercase tracking-wider">Final Score</p>
        </div>

        {/* Breakdown pills */}
        <div className="flex flex-wrap justify-center gap-2 mb-5">
          {Object.entries(breakdown).map(([key, val]) => (
            <span
              key={key}
              className="px-3 py-1.5 rounded-[18px] text-xs font-mono font-semibold border"
              style={{
                backgroundColor: `${getScoreColor(val)}15`,
                color: getScoreColor(val),
                borderColor: `${getScoreColor(val)}30`,
              }}
            >
              {key}: {val}
            </span>
          ))}
        </div>

        {/* Summary */}
        {result?.feedback?.overall_summary && (
          <p className="text-sm text-[#8B8BA0] text-center mb-5 leading-relaxed">
            {result.feedback.overall_summary}
          </p>
        )}

        {/* Next button */}
        {onNext && (
          <button
            onClick={onNext}
            className="w-full py-3 bg-[#6C63FF] hover:bg-[#7B73FF] text-white font-semibold rounded-[11px] btn-shine cursor-pointer transition-colors"
          >
            Next Question →
          </button>
        )}
      </div>
    </motion.div>
  );
}
