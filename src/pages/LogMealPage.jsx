import { useState, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Camera, Upload, Loader2, Check, AlertCircle, ChevronDown, X, Sparkles } from 'lucide-react'
import { analyzeFood } from '../lib/anthropic'
import { addMeal, todayStr } from '../lib/db'
import EthiopianFoodPicker from '../components/EthiopianFoodPicker'

const mealTypes = [
  { value: 'breakfast', label: 'Breakfast', emoji: '🌅' },
  { value: 'lunch', label: 'Lunch', emoji: '☀️' },
  { value: 'dinner', label: 'Dinner', emoji: '🌙' },
  { value: 'snack', label: 'Snack', emoji: '🍿' },
]

export default function LogMealPage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const fileRef = useRef(null)
  const cameraRef = useRef(null)

  const [mealType, setMealType] = useState(params.get('type') || 'lunch')
  const [imagePreview, setImagePreview] = useState(null)
  const [imageBase64, setImageBase64] = useState(null)
  const [mediaType, setMediaType] = useState('image/jpeg')
  const [analyzing, setAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState(null)
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)

  // Form fields (auto-filled by AI, editable)
  const [form, setForm] = useState({
    food_name: '',
    calories: '',
    protein: '',
    carbs: '',
    fat: '',
  })

  const handleImage = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setError(null)
    setAnalysis(null)

    // Preview
    const url = URL.createObjectURL(file)
    setImagePreview(url)
    setMediaType(file.type || 'image/jpeg')

    // Convert to base64
    const reader = new FileReader()
    reader.onload = async () => {
      const b64 = reader.result.split(',')[1]
      setImageBase64(b64)

      // Auto-analyze
      setAnalyzing(true)
      try {
        const result = await analyzeFood(b64, file.type || 'image/jpeg')
        setAnalysis(result)
        setForm({
          food_name: result.food_name || '',
          calories: String(result.calories || ''),
          protein: String(result.protein_g || ''),
          carbs: String(result.carbs_g || ''),
          fat: String(result.fat_g || ''),
        })
      } catch (err) {
        setError(err.message)
      } finally {
        setAnalyzing(false)
      }
    }
    reader.readAsDataURL(file)
  }

  const handleSave = async () => {
    if (!form.food_name || !form.calories) return
    setSaving(true)
    try {
      await addMeal({
        date: todayStr(),
        meal_type: mealType,
        food_name: form.food_name,
        calories: parseInt(form.calories) || 0,
        protein: parseFloat(form.protein) || 0,
        carbs: parseFloat(form.carbs) || 0,
        fat: parseFloat(form.fat) || 0,
        photo_url: imagePreview || null,
      })
      navigate('/')
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const clearImage = () => {
    setImagePreview(null)
    setImageBase64(null)
    setAnalysis(null)
    setError(null)
    setForm({ food_name: '', calories: '', protein: '', carbs: '', fat: '' })
  }

  const updateField = (key, value) => setForm(prev => ({ ...prev, [key]: value }))

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="px-4 pt-4 pb-6"
    >
      {/* Header */}
      <h1 className="text-xl font-bold tracking-tight mb-5">Log Meal</h1>

      {/* Meal type selector */}
      <div className="flex gap-2 mb-5 overflow-x-auto no-scrollbar">
        {mealTypes.map(({ value, label, emoji }) => (
          <button
            key={value}
            onClick={() => setMealType(value)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              mealType === value
                ? 'bg-[#22c55e] text-black'
                : 'bg-[#141414] border border-[#1e1e1e] text-[#888] hover:text-[#ccc]'
            }`}
          >
            <span>{emoji}</span>
            {label}
          </button>
        ))}
      </div>

      {/* Ethiopian food picker */}
      <EthiopianFoodPicker onSelect={(food) => {
        setForm(food)
        setAnalysis(null)
        setError(null)
      }} />

      {/* Image area */}
      {!imagePreview ? (
        <div className="mb-5">
          <div className="grid grid-cols-2 gap-3">
            {/* Camera button */}
            <button
              onClick={() => cameraRef.current?.click()}
              className="flex flex-col items-center justify-center gap-2 h-36 rounded-2xl bg-[#141414] border-2 border-dashed border-[#222] hover:border-[#22c55e]/40 active:scale-[0.98] transition-all"
            >
              <div className="w-12 h-12 rounded-xl bg-[#22c55e]/10 flex items-center justify-center">
                <Camera size={22} className="text-[#22c55e]" />
              </div>
              <span className="text-xs font-medium text-[#888]">Take Photo</span>
            </button>
            <input
              ref={cameraRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleImage}
              className="hidden"
            />

            {/* Upload button */}
            <button
              onClick={() => fileRef.current?.click()}
              className="flex flex-col items-center justify-center gap-2 h-36 rounded-2xl bg-[#141414] border-2 border-dashed border-[#222] hover:border-[#22c55e]/40 active:scale-[0.98] transition-all"
            >
              <div className="w-12 h-12 rounded-xl bg-[#22c55e]/10 flex items-center justify-center">
                <Upload size={22} className="text-[#22c55e]" />
              </div>
              <span className="text-xs font-medium text-[#888]">Upload</span>
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={handleImage}
              className="hidden"
            />
          </div>

          {/* Or manual entry */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-[#222]" />
            <span className="text-xs text-[#555]">or enter manually</span>
            <div className="flex-1 h-px bg-[#222]" />
          </div>
        </div>
      ) : (
        /* Image preview */
        <div className="relative mb-5">
          <img
            src={imagePreview}
            alt="Food"
            className="w-full h-48 object-cover rounded-2xl border border-[#1e1e1e]"
          />
          <button
            onClick={clearImage}
            className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 backdrop-blur-sm text-white hover:bg-black/80 transition"
          >
            <X size={16} />
          </button>

          {/* Analyzing overlay */}
          <AnimatePresence>
            {analyzing && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 rounded-2xl bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center gap-2"
              >
                <Sparkles size={24} className="text-[#22c55e] animate-pulse" />
                <p className="text-sm font-medium text-white">Analyzing food...</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-start gap-2 p-3 mb-4 rounded-xl bg-red-500/10 border border-red-500/20"
          >
            <AlertCircle size={16} className="text-red-400 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-red-300">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI confidence badge */}
      {analysis?.confidence && (
        <div className="flex items-center gap-2 mb-4">
          <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
            analysis.confidence === 'high'
              ? 'bg-[#22c55e]/10 text-[#22c55e]'
              : analysis.confidence === 'medium'
              ? 'bg-yellow-500/10 text-yellow-400'
              : 'bg-red-500/10 text-red-400'
          }`}>
            <Sparkles size={11} />
            {analysis.confidence} confidence
          </div>
          {analysis.notes && (
            <span className="text-xs text-[#666] truncate">{analysis.notes}</span>
          )}
        </div>
      )}

      {/* Form */}
      <div className="space-y-3">
        {/* Food name */}
        <div>
          <label className="block text-xs font-medium text-[#666] mb-1.5">Food Name</label>
          <input
            type="text"
            placeholder="e.g. Grilled chicken salad"
            value={form.food_name}
            onChange={e => updateField('food_name', e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-[#141414] border border-[#1e1e1e] text-sm text-[#f0f0f0] placeholder-[#444] focus:outline-none focus:border-[#22c55e]/50 transition-colors"
          />
        </div>

        {/* Calories */}
        <div>
          <label className="block text-xs font-medium text-[#666] mb-1.5">Calories</label>
          <input
            type="number"
            placeholder="0"
            value={form.calories}
            onChange={e => updateField('calories', e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-[#141414] border border-[#1e1e1e] text-sm text-[#f0f0f0] placeholder-[#444] focus:outline-none focus:border-[#22c55e]/50 transition-colors"
          />
        </div>

        {/* Macros row */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { key: 'protein', label: 'Protein (g)', color: '#3b82f6' },
            { key: 'carbs', label: 'Carbs (g)', color: '#f59e0b' },
            { key: 'fat', label: 'Fat (g)', color: '#a855f7' },
          ].map(({ key, label, color }) => (
            <div key={key}>
              <label className="block text-[10px] font-medium mb-1.5" style={{ color }}>{label}</label>
              <input
                type="number"
                placeholder="0"
                value={form[key]}
                onChange={e => updateField(key, e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-[#141414] border border-[#1e1e1e] text-sm text-[#f0f0f0] placeholder-[#444] focus:outline-none focus:border-[#22c55e]/50 transition-colors"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Save button */}
      <motion.button
        onClick={handleSave}
        disabled={!form.food_name || !form.calories || saving}
        whileTap={{ scale: 0.97 }}
        className={`w-full mt-6 py-3.5 rounded-2xl text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
          form.food_name && form.calories
            ? 'bg-[#22c55e] text-black hover:bg-[#16a34a] active:bg-[#15803d]'
            : 'bg-[#1a1a1a] text-[#444] cursor-not-allowed'
        }`}
      >
        {saving ? (
          <Loader2 size={18} className="animate-spin" />
        ) : (
          <>
            <Check size={18} />
            Save Meal
          </>
        )}
      </motion.button>
    </motion.div>
  )
}
