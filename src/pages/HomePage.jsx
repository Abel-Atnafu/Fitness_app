import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Plus, Flame, TrendingDown, Droplets } from 'lucide-react'
import ProgressRing from '../components/ProgressRing'
import MacroBars from '../components/MacroBars'
import MealCard from '../components/MealCard'
import { getMeals, getDailyLog, deleteMeal, todayStr } from '../lib/db'

const TARGET = 1850
const WATER_GOAL = 8 // glasses

const mealTypes = [
  { type: 'breakfast', emoji: '🌅', label: 'Breakfast' },
  { type: 'lunch', emoji: '☀️', label: 'Lunch' },
  { type: 'dinner', emoji: '🌙', label: 'Dinner' },
  { type: 'snack', emoji: '🍿', label: 'Snack' },
]

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return { en: 'Good morning', am: 'እንደምን አደሩ' }
  if (h < 17) return { en: 'Good afternoon', am: 'እንደምን ዋሉ' }
  return { en: 'Good evening', am: 'እንደምን አመሹ' }
}

function getWaterKey() {
  return `water_${todayStr()}`
}

export default function HomePage() {
  const navigate = useNavigate()
  const [meals, setMeals] = useState([])
  const [log, setLog] = useState({ total_calories: 0, total_protein: 0, total_carbs: 0, total_fat: 0 })
  const [loading, setLoading] = useState(true)
  const [water, setWater] = useState(() => {
    const saved = localStorage.getItem(getWaterKey())
    return saved ? parseInt(saved) : 0
  })

  const today = todayStr()
  const greeting = getGreeting()

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

  const addWater = () => {
    if (water >= WATER_GOAL) return
    const next = water + 1
    setWater(next)
    localStorage.setItem(getWaterKey(), String(next))
  }

  const removeWater = () => {
    if (water <= 0) return
    const next = water - 1
    setWater(next)
    localStorage.setItem(getWaterKey(), String(next))
  }

  // Status message
  const pct = log.total_calories / TARGET
  let statusMsg = 'Start logging your meals!'
  let statusColor = 'text-[#888]'
  if (log.total_calories > 0 && pct <= 0.85) {
    statusMsg = "You're on track — keep it going!"
    statusColor = 'text-[#22c55e]'
  } else if (pct > 0.85 && pct <= 1) {
    statusMsg = 'Almost at your limit, be mindful'
    statusColor = 'text-[#f59e0b]'
  } else if (pct > 1) {
    statusMsg = 'Over your target today'
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
      {/* Header with greeting */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-[10px] text-[#555] font-medium uppercase tracking-widest mb-0.5">
            {greeting.am}
          </p>
          <h1 className="text-2xl font-bold tracking-tight">CutCal 🇪🇹</h1>
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

      {/* Water tracker */}
      <div className="p-4 rounded-2xl bg-[#141414] border border-[#1e1e1e] mb-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Droplets size={15} className="text-[#3b82f6]" />
            <span className="text-xs font-semibold text-[#ccc]">Water</span>
            <span className="text-xs text-[#555]">{water}/{WATER_GOAL} glasses</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={removeWater}
              disabled={water === 0}
              className="w-6 h-6 rounded-full bg-[#1a1a1a] border border-[#2a2a2a] text-[#666] hover:text-[#ccc] disabled:opacity-30 text-sm font-bold flex items-center justify-center transition-colors"
            >
              −
            </button>
            <button
              onClick={addWater}
              disabled={water >= WATER_GOAL}
              className="w-6 h-6 rounded-full bg-[#1a1a1a] border border-[#2a2a2a] text-[#666] hover:text-[#3b82f6] disabled:opacity-30 text-sm font-bold flex items-center justify-center transition-colors"
            >
              +
            </button>
          </div>
        </div>
        <div className="flex gap-1.5">
          {Array.from({ length: WATER_GOAL }).map((_, i) => (
            <motion.button
              key={i}
              whileTap={{ scale: 0.85 }}
              onClick={() => {
                const next = i < water ? i : i + 1
                setWater(next)
                localStorage.setItem(getWaterKey(), String(next))
              }}
              className="flex-1"
            >
              <div className={`h-6 rounded-lg transition-all ${
                i < water
                  ? 'bg-[#3b82f6]'
                  : 'bg-[#1a1a1a] border border-[#2a2a2a]'
              }`} />
            </motion.button>
          ))}
        </div>
        {water >= WATER_GOAL && (
          <p className="text-[10px] text-[#3b82f6] text-center mt-2 font-medium">
            Daily water goal reached! 💧
          </p>
        )}
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
