import { motion } from 'framer-motion'

const macros = [
  { key: 'protein', label: 'Protein', color: '#3b82f6', target: 140 },
  { key: 'carbs', label: 'Carbs', color: '#f59e0b', target: 185 },
  { key: 'fat', label: 'Fat', color: '#a855f7', target: 62 },
]

export default function MacroBars({ protein = 0, carbs = 0, fat = 0 }) {
  const values = { protein, carbs, fat }

  return (
    <div className="flex gap-3">
      {macros.map(({ key, label, color, target }) => {
        const val = values[key]
        const pct = Math.min(val / target, 1)
        return (
          <div key={key} className="flex-1">
            <div className="flex justify-between items-baseline mb-1.5">
              <span className="text-[11px] text-[#888] font-medium">{label}</span>
              <span className="text-xs font-semibold tabular-nums" style={{ color }}>
                {Math.round(val)}g
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-[#1a1a1a] overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: color }}
                initial={{ width: 0 }}
                animate={{ width: `${pct * 100}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}
