import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { getScoreColor, getScoreLabel } from '../utils/constants';

export default function ScoreCircle({ score, size = 180, strokeWidth = 10 }) {
  const color = getScoreColor(score);
  const label = getScoreLabel(score);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // Animated number
  const [displayNum, setDisplayNum] = useState(0);
  const frameRef = useRef(null);

  useEffect(() => {
    const start = performance.now();
    const duration = 1500;
    function tick(now) {
      const p = Math.min((now - start) / duration, 1);
      const eased = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
      setDisplayNum(Math.round(score * eased));
      if (p < 1) frameRef.current = requestAnimationFrame(tick);
    }
    frameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameRef.current);
  }, [score]);

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90 drop-shadow-[0_0_15px_rgba(212,18,27,0.2)]">
          {/* Track */}
          <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="white" strokeOpacity={0.05} strokeWidth={strokeWidth} />
          {/* Progress */}
          <motion.circle
            cx={size/2} cy={size/2} r={radius}
            fill="none" stroke={color} strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: circumference * (1 - score / 100) }}
            transition={{ duration: 1.5, ease: "circOut" }}
          />
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-6xl font-black tracking-tighter" style={{ color }}>{displayNum}</span>
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#D4121B]/60 -mt-1">/100</span>
        </div>
      </div>
      <p className="mt-8 text-[10px] font-black uppercase tracking-[0.4em]" style={{ color }}>{label}</p>
    </div>
  );
}
