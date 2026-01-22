import React from 'react';
import { motion } from 'framer-motion';

interface ProgressRingProps {
  value: number;
  max: number;
  color: string;
  size?: number;
}

export const ProgressRing: React.FC<ProgressRingProps> = ({
  value,
  max,
  color,
  size = 120
}) => {
  const percentage = Math.min((value / max) * 100, 100);
  const radius = (size / 2) - 8;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#E5E5E5"
          strokeWidth="8"
        />

        {/* Progress ring with animation */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </svg>

      {/* Center value */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-semibold text-text-primary">
          {Math.round(value)}
        </span>
        <span className="text-xs text-text-secondary">Recovery</span>
      </div>
    </div>
  );
};
