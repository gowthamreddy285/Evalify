import { motion } from 'framer-motion';
import { SKILL_COLORS } from '../utils/constants';

export default function SkillBadge({ skill, index = 0, size = 'sm' }) {
  const color = SKILL_COLORS[index % SKILL_COLORS.length];
  const sizeClasses = size === 'sm' ? 'px-3 py-1 text-xs' : 'px-4 py-1.5 text-sm';

  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.04, type: 'spring', stiffness: 400, damping: 25 }}
      className={`inline-flex items-center rounded-[18px] font-medium border ${sizeClasses}`}
      style={{
        backgroundColor: color.bg,
        color: color.text,
        borderColor: color.border,
      }}
    >
      {skill}
    </motion.span>
  );
}
