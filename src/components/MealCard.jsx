import { motion } from 'framer-motion'
import { Trash2 } from 'lucide-react'

const typeEmoji = {
  breakfast: '🌅',
  lunch: '☀️',
  dinner: '🌙',
  snack: '🍿',
}

export default function MealCard({ meal, onDelete, index = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="flex items-center gap-3 p-3 rounded-2xl bg-[#141414] border border-[#1e1e1e] group"
    >
      {/* Photo thumbnail or emoji */}
      {meal.photo_url ? (
        <img
          src={meal.photo_url}
          alt={meal.food_name}
          className="w-12 h-12 rounded-xl object-cover flex-shrink-0"
        />
      ) : (
        <div className="w-12 h-12 rounded-xl bg-[#1a1a1a] flex items-center justify-center flex-shrink-0 text-xl">
          {typeEmoji[meal.meal_type] || '🍽️'}
        </div>
      )}

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[#f0f0f0] truncate">{meal.food_name}</p>
        <p className="text-xs text-[#666] mt-0.5 capitalize">{meal.meal_type}</p>
      </div>

      {/* Calories */}
      <div className="text-right flex-shrink-0">
        <p className="text-sm font-semibold text-[#22c55e] tabular-nums">{meal.calories}</p>
        <p className="text-[10px] text-[#555]">cal</p>
      </div>

      {/* Delete */}
      {onDelete && (
        <button
          onClick={() => onDelete(meal.id)}
          className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-500/10 text-[#555] hover:text-red-400 transition-all ml-1"
        >
          <Trash2 size={14} />
        </button>
      )}
    </motion.div>
  )
}
