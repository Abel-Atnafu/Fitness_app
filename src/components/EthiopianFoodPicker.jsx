import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ChevronUp } from 'lucide-react'

const ETHIOPIAN_FOODS = [
  { name: 'Injera', emoji: '🫓', cal: 190, protein: 6, carbs: 37, fat: 1, note: '1 piece · ~150g' },
  { name: 'Doro Wat', emoji: '🍗', cal: 320, protein: 28, carbs: 12, fat: 18, note: '1 serving' },
  { name: 'Shiro', emoji: '🫘', cal: 280, protein: 14, carbs: 35, fat: 8, note: '1 serving' },
  { name: 'Tibs', emoji: '🥩', cal: 260, protein: 24, carbs: 5, fat: 16, note: '1 serving' },
  { name: 'Kitfo', emoji: '🥩', cal: 335, protein: 22, carbs: 2, fat: 27, note: '1 serving' },
  { name: 'Misir Wat', emoji: '🍲', cal: 220, protein: 14, carbs: 36, fat: 3, note: '1 serving' },
  { name: 'Gomen', emoji: '🥬', cal: 90, protein: 4, carbs: 12, fat: 4, note: '1 serving' },
  { name: 'Beyaynetu', emoji: '🍽️', cal: 750, protein: 28, carbs: 110, fat: 18, note: 'Fasting platter' },
  { name: 'Ful', emoji: '🫘', cal: 187, protein: 13, carbs: 32, fat: 1, note: '1 cup' },
  { name: 'Firfir', emoji: '🍛', cal: 320, protein: 10, carbs: 55, fat: 7, note: '1 serving' },
  { name: 'Ayib', emoji: '🧀', cal: 130, protein: 11, carbs: 3, fat: 9, note: '100g' },
  { name: 'Kategna', emoji: '🫓', cal: 160, protein: 4, carbs: 30, fat: 3, note: '1 piece' },
  { name: 'Chechebsa', emoji: '🥞', cal: 350, protein: 8, carbs: 48, fat: 14, note: '1 serving' },
  { name: 'Tegabino', emoji: '🍲', cal: 240, protein: 12, carbs: 32, fat: 7, note: '1 serving' },
  { name: 'Kinche', emoji: '🌾', cal: 210, protein: 8, carbs: 40, fat: 3, note: '1 cup cooked' },
  { name: 'Tella', emoji: '🍺', cal: 70, protein: 1, carbs: 14, fat: 0, note: '1 cup (250ml)' },
]

export default function EthiopianFoodPicker({ onSelect }) {
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState(null)

  const handlePick = (food) => {
    setSelected(food.name)
    onSelect({
      food_name: food.name,
      calories: String(food.cal),
      protein: String(food.protein),
      carbs: String(food.carbs),
      fat: String(food.fat),
    })
  }

  return (
    <div className="mb-5">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 rounded-2xl bg-[#141414] border border-[#1e1e1e] hover:border-[#22c55e]/30 transition-all"
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">🇪🇹</span>
          <div className="text-left">
            <p className="text-sm font-medium text-[#e0e0e0]">Ethiopian Foods</p>
            <p className="text-[10px] text-[#555]">
              {selected ? `Selected: ${selected}` : 'Tap to browse common foods'}
            </p>
          </div>
        </div>
        {open ? (
          <ChevronUp size={16} className="text-[#555]" />
        ) : (
          <ChevronDown size={16} className="text-[#555]" />
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-2 gap-2 pt-2">
              {ETHIOPIAN_FOODS.map((food) => (
                <motion.button
                  key={food.name}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => handlePick(food)}
                  className={`flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all ${
                    selected === food.name
                      ? 'bg-[#22c55e]/10 border-[#22c55e]/40'
                      : 'bg-[#0d0d0d] border-[#1e1e1e] hover:border-[#2a2a2a]'
                  }`}
                >
                  <span className="text-2xl">{food.emoji}</span>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-[#e0e0e0] truncate">{food.name}</p>
                    <p className="text-[10px] text-[#555] truncate">{food.note}</p>
                    <p className={`text-[10px] font-medium mt-0.5 tabular-nums ${
                      selected === food.name ? 'text-[#22c55e]' : 'text-[#666]'
                    }`}>
                      {food.cal} cal · {food.protein}P · {food.carbs}C · {food.fat}F
                    </p>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
