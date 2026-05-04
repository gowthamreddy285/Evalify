import { motion } from 'framer-motion';

export default function ProgressBar({ value, max = 100, height = 'h-1', className = '', color, showLabel = false }) {
  const pct = Math.min((value / max) * 100, 100);

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex justify-between mb-1.5">
          <span className="text-xs text-[#8B8BA0]">{Math.round(pct)}%</span>
        </div>
      )}
      <div className={`w-full ${height} bg-[#2A2A3A] rounded-full overflow-hidden`}>
        <motion.div
          className={`${height} rounded-full`}
          style={{
            background: color || 'linear-gradient(135deg, #6C63FF 0%, #00D4AA 100%)',
          }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
        />
      </div>
    </div>
  );
}
