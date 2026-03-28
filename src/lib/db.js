import { supabase } from './supabase'

// Get today's date string in YYYY-MM-DD
export function todayStr() {
  return new Date().toISOString().split('T')[0]
}

// Get meals for a specific date
export async function getMeals(date) {
  const { data, error } = await supabase
    .from('meals')
    .select('*')
    .eq('date', date)
    .order('created_at', { ascending: true })
  if (error) throw error
  return data || []
}

// Add a meal
export async function addMeal(meal) {
  const { data, error } = await supabase
    .from('meals')
    .insert([meal])
    .select()
    .single()
  if (error) throw error
  await recalcDailyLog(meal.date)
  return data
}

// Delete a meal
export async function deleteMeal(id, date) {
  const { error } = await supabase.from('meals').delete().eq('id', id)
  if (error) throw error
  await recalcDailyLog(date)
}

// Recalculate daily log totals
export async function recalcDailyLog(date) {
  const meals = await getMeals(date)
  const totals = meals.reduce(
    (acc, m) => ({
      total_calories: acc.total_calories + (m.calories || 0),
      total_protein: acc.total_protein + (m.protein || 0),
      total_carbs: acc.total_carbs + (m.carbs || 0),
      total_fat: acc.total_fat + (m.fat || 0),
    }),
    { total_calories: 0, total_protein: 0, total_carbs: 0, total_fat: 0 }
  )

  const { error } = await supabase
    .from('daily_logs')
    .upsert(
      { date, ...totals },
      { onConflict: 'date' }
    )
  if (error) throw error
  return totals
}

// Get daily log for a date
export async function getDailyLog(date) {
  const { data, error } = await supabase
    .from('daily_logs')
    .select('*')
    .eq('date', date)
    .single()
  if (error && error.code !== 'PGRST116') throw error
  return data || { total_calories: 0, total_protein: 0, total_carbs: 0, total_fat: 0 }
}

// Get history (recent daily logs)
export async function getHistory(limit = 30) {
  const { data, error } = await supabase
    .from('daily_logs')
    .select('*')
    .order('date', { ascending: false })
    .limit(limit)
  if (error) throw error
  return data || []
}
