import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Calendar, ChevronRight, Flame } from 'lucide-react'
import { getHistory, getMeals } from '../lib/db'
import MealCard from '../components/MealCard'

const TARGET = 1850

export default function HistoryPage() {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(null)
  const [expandedMeals, setExpandedMeals] = useState([])

  useEffect(() => {
    ;(async () => {
      try {
        const data = await getHistory(30)
        setHistory(data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const toggleExpand = async (date) => {
    if (expanded === date) {
      setExpanded(null)
      setExpandedMeals([])
      return
    }
    setExpanded(date)
    try {
      const meals = await getMeals(date)
      setExpandedMeals(meals)
    } catch {
      setExpandedMeals([])
    }
  }

  const formatDate = (dateStr) => {
    const d = new Date(dateStr + 'T12:00:00')
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (dateStr === today.toISOString().split('T')[0]) return 'Today'
    if (dateStr === yesterday.toISOString().split('T')[0]) return 'Yesterday'
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="px-4 pt-4 pb-6"
    >
      <div className="flex items-center gap-2 mb-5">
        <Calendar size={20} className="text-[#22c55e]" />
        <h1 className="text-xl font-bold tracking-tight">History</h1>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-16 rounded-2xl shimmer" />
          ))}
        </div>
      ) : history.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#141414] flex items-center justify-center mb-3">
            <Flame size={28} className="text-[#333]" />
          </div>
          <p className="text-sm text-[#555]">No history yet</p>
          <p className="text-xs text-[#444] mt-1">Start logging meals to see your progress</p>
        </div>
      ) : (
        <div className="space-y-2">
          {history.map((day, i) => {
            const pct = Math.min(day.total_calories / TARGET, 1)
            const over = day.total_calories > TARGET
            const isExpanded = expanded === day.date

            return (
              <motion.div
                key={day.date}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
              >
                <button
                  onClick={() => toggleExpand(day.date)}
                  className="w-full p-3.5 rounded-2xl bg-[#141414] border border-[#1e1e1e] hover:border-[#282828] transition-all text-left"
                >
                  <div className="flex items-center gap-3">
                    {/* Mini progress bar */}
                    <div className="w-10 h-10 rounded-xl bg-[#0d0d0d] flex items-center justify-center flex-shrink-0 relative overflow-hidden">
                      <div
                        className="absolute bottom-0 left-0 right-0 transition-all"
                        style={{
                          height: `${pct * 100}%`,
                          backgroundColor: over ? 'rgba(239,68,68,0.2)' : 'rgba(34,197,94,0.15)',
                        }}
                      />
                      <span className="text-xs font-bold tabular-nums relative" style={{ color: over ? '#ef4444' : '#22c55e' }}>
                        {Math.round(pct * 100)}%
                      </span>
                    </div>

                    {/* Date and macros */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#e0e0e0]">{formatDate(day.date)}</p>
                      <p className="text-xs text-[#555] mt-0.5">
                        P {Math.round(day.total_protein)}g · C {Math.round(day.total_carbs)}g · F {Math.round(day.total_fat)}g
                      </p>
                    </div>

                    {/* Calories */}
                    <div className="text-right flex-shrink-0 flex items-center gap-2">
                      <div>
                        <p className="text-sm font-semibold tabular-nums" style={{ color: over ? '#ef4444' : '#22c55e' }}>
                          {day.total_calories.toLocaleString()}
                        </p>
                        <p className="text-[10px] text-[#555]">cal</p>
                      </div>
                      <ChevronRight
                        size={14}
                        className={`text-[#444] transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                      />
                    </div>
                  </div>
                </button>

                {/* Expanded meals */}
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-1 ml-4 space-y-1.5 pb-1"
                  >
                    {expandedMeals.length === 0 ? (
                      <p className="text-xs text-[#555] py-2 pl-2">No meals found</p>
                    ) : (
                      expandedMeals.map((meal, j) => (
                        <MealCard key={meal.id} meal={meal} index={j} />
                      ))
                    )}
                  </motion.div>
                )}
              </motion.div>
            )
          })}
        </div>
      )}
    </motion.div>
  )
}
