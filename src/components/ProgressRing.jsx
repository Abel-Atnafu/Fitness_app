import { motion } from 'framer-motion'

const TARGET = 1850

export default function ProgressRing({ calories = 0 }) {
  const pct = Math.min(calories / TARGET, 1.3)
  const remaining = Math.max(TARGET - calories, 0)
  const over = calories > TARGET

  // SVG circle math
  const size = 200
  const stroke = 12
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - pct * circumference

  const color = over ? '#ef4444' : '#22c55e'
  const bgColor = over ? '#3f1111' : '#0d2818'

  return (
    <div className="relative flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={bgColor}
          strokeWidth={stroke}
          strokeLinecap="round"
        />
        {/* Progress arc */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: Math.max(offset, 0) }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </svg>
      {/* Center text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          className="text-4xl font-bold tabular-nums"
          style={{ color }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          {calories.toLocaleString()}
        </motion.span>
        <span className="text-xs text-[#888] mt-1">of {TARGET.toLocaleString()} cal</span>
        <span className={`text-sm font-medium mt-1 ${over ? 'text-red-400' : 'text-[#22c55e]'}`}>
          {over ? `${(calories - TARGET).toLocaleString()} over` : `${remaining.toLocaleString()} left`}
        </span>
      </div>
    </div>
  )
}
