-- ============================================
-- CutCal Database Setup
-- Run this in Supabase SQL Editor
-- ============================================

-- Meals table
CREATE TABLE IF NOT EXISTS meals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL,
  meal_type TEXT NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
  food_name TEXT NOT NULL,
  calories INTEGER NOT NULL DEFAULT 0,
  protein REAL NOT NULL DEFAULT 0,
  carbs REAL NOT NULL DEFAULT 0,
  fat REAL NOT NULL DEFAULT 0,
  photo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Daily logs table (aggregated totals per day)
CREATE TABLE IF NOT EXISTS daily_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL UNIQUE,
  total_calories INTEGER NOT NULL DEFAULT 0,
  total_protein REAL NOT NULL DEFAULT 0,
  total_carbs REAL NOT NULL DEFAULT 0,
  total_fat REAL NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_meals_date ON meals(date);
CREATE INDEX IF NOT EXISTS idx_meals_date_type ON meals(date, meal_type);
CREATE INDEX IF NOT EXISTS idx_daily_logs_date ON daily_logs(date DESC);

-- Enable Row Level Security (open for now — no auth)
ALTER TABLE meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_logs ENABLE ROW LEVEL SECURITY;

-- Allow all operations (since there's no auth yet)
CREATE POLICY "Allow all on meals" ON meals FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on daily_logs" ON daily_logs FOR ALL USING (true) WITH CHECK (true);
