import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Plus, Flame, TrendingDown } from 'lucide-react'
import ProgressRing from '../components/ProgressRing'
import MacroBars from '../components/MacroBars'
import MealCard from '../components/MealCard'
import { getMeals, getDailyLog, deleteMeal, todayStr } from '../lib/db'

const TARGET = 1850
const mealTypes = [
  { type: 'breakfast', emoji: '🌅', label: 'Breakfast' },
  { type: 'lunch', emoji: '☀️', label: 'Lunch' },
  { type: 'dinner', emoji: '🌙', label: 'Dinner' },
  { type: 'snack', emoji: '🍿', label: 'Snack' },
]

export default function HomePage() {
  const navigate = useNavigate()
  const [meals, setMeals] = useState([])
  const [log, setLog] = useState({ total_calories: 0, total_protein: 0, total_carbs: 0, total_fat: 0 })
  const [loading, setLoading] = useState(true)

  const today = todayStr()

  const loadData = useCallback(async () => {
    try {
      const [mealsData, logData] = await Promise.all([
        getMeals(today),
        getDailyLog(today),
      ])
      setMeals(mealsData)
      setLog(logData)
    } catch (err) {
      console.error('Failed to load data:', err)
    } finally {
      setLoading(false)
    }
  }, [today])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleDelete = async (id) => {
    try {
      await deleteMeal(id, today)
      loadData()
    } catch (err) {
      console.error('Delete failed:', err)
    }
  }

  // Status message
  const pct = log.total_calories / TARGET
  let statusMsg = "Start logging your meals!"
  let statusColor = 'text-[#888]'
  if (log.total_calories > 0 && pct <= 0.85) {
    statusMsg = "You're on track — keep it going!"
    statusColor = 'text-[#22c55e]'
  } else if (pct > 0.85 && pct <= 1) {
    statusMsg = "Almost at your limit, be mindful"
    statusColor = 'text-[#f59e0b]'
  } else if (pct > 1) {
    statusMsg = "Over your target today"
    statusColor = 'text-[#ef4444]'
  }

  // Group meals by type
  const grouped = mealTypes.map(mt => ({
    ...mt,
    meals: meals.filter(m => m.meal_type === mt.type),
  })).filter(g => g.meals.length > 0)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="px-4 pt-4 pb-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">CutCal</h1>
          <p className="text-xs text-[#666] mt-0.5">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#141414] border border-[#1e1e1e]">
          <TrendingDown size={13} className="text-[#22c55e]" />
          <span className="text-xs font-medium text-[#22c55e]">-0.7kg/wk</span>
        </div>
      </div>

      {/* Progress ring */}
      <div className="flex justify-center mb-4">
        <ProgressRing calories={log.total_calories} />
      </div>

      {/* Status */}
      <p className={`text-center text-sm font-medium mb-5 ${statusColor}`}>{statusMsg}</p>

      {/* Macro bars */}
      <div className="p-4 rounded-2xl bg-[#141414] border border-[#1e1e1e] mb-5">
        <MacroBars
          protein={log.total_protein}
          carbs={log.total_carbs}
          fat={log.total_fat}
        />
      </div>

      {/* Quick log buttons */}
      <div className="grid grid-cols-4 gap-2 mb-6">
        {mealTypes.map(({ type, emoji, label }) => (
          <button
            key={type}
            onClick={() => navigate(`/log?type=${type}`)}
            className="flex flex-col items-center gap-1.5 py-3 rounded-2xl bg-[#141414] border border-[#1e1e1e] hover:border-[#22c55e]/30 active:scale-95 transition-all"
          >
            <span className="text-xl">{emoji}</span>
            <span className="text-[10px] font-medium text-[#888]">{label}</span>
          </button>
        ))}
      </div>

      {/* Today's meals */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-[#ccc]">Today's Meals</h2>
        <button
          onClick={() => navigate('/log')}
          className="flex items-center gap-1 text-xs font-medium text-[#22c55e] hover:text-[#16a34a] transition-colors"
        >
          <Plus size={14} />
          Add
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 rounded-2xl shimmer" />
          ))}
        </div>
      ) : grouped.length === 0 ? (
        <div className="flex flex-col items-center py-10 text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#141414] flex items-center justify-center mb-3">
            <Flame size={28} className="text-[#333]" />
          </div>
          <p className="text-sm text-[#555]">No meals logged yet today</p>
          <p className="text-xs text-[#444] mt-1">Tap a category above to start</p>
        </div>
      ) : (
        <div className="space-y-4">
          {grouped.map(({ type, emoji, label, meals: typeMeals }) => (
            <div key={type}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm">{emoji}</span>
                <span className="text-xs font-medium text-[#666] uppercase tracking-wider">{label}</span>
                <span className="text-xs text-[#444] tabular-nums">
                  {typeMeals.reduce((s, m) => s + m.calories, 0)} cal
                </span>
              </div>
              <div className="space-y-2">
                {typeMeals.map((meal, i) => (
                  <MealCard key={meal.id} meal={meal} onDelete={handleDelete} index={i} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  )
}
