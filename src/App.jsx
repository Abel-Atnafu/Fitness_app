import { Routes, Route, useLocation, useNavigate } from 'react-router-dom'
import { Home, Camera, Clock } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import HomePage from './pages/HomePage'
import LogMealPage from './pages/LogMealPage'
import HistoryPage from './pages/HistoryPage'

const navItems = [
  { path: '/', icon: Home, label: 'Home' },
  { path: '/log', icon: Camera, label: 'Log Meal' },
  { path: '/history', icon: Clock, label: 'History' },
]

export default function App() {
  const location = useLocation()
  const navigate = useNavigate()

  return (
    <div className="flex flex-col h-full max-w-lg mx-auto">
      {/* Page content */}
      <main className="flex-1 overflow-y-auto pb-20">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<HomePage />} />
            <Route path="/log" element={<LogMealPage />} />
            <Route path="/history" element={<HistoryPage />} />
          </Routes>
        </AnimatePresence>
      </main>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-50">
        <div className="max-w-lg mx-auto bg-[#111111]/90 backdrop-blur-xl border-t border-[#222]">
          <div className="flex items-center justify-around h-16 px-4">
            {navItems.map(({ path, icon: Icon, label }) => {
              const active = location.pathname === path
              return (
                <button
                  key={path}
                  onClick={() => navigate(path)}
                  className={`flex flex-col items-center gap-0.5 px-5 py-1.5 rounded-xl transition-all duration-200 ${
                    active
                      ? 'text-[#22c55e]'
                      : 'text-[#555] active:text-[#888]'
                  }`}
                >
                  <Icon size={active ? 22 : 20} strokeWidth={active ? 2.2 : 1.8} />
                  <span className="text-[10px] font-medium tracking-wide">{label}</span>
                  {active && (
                    <motion.div
                      layoutId="nav-dot"
                      className="w-1 h-1 rounded-full bg-[#22c55e] mt-0.5"
                    />
                  )}
                </button>
              )
            })}
          </div>
        </div>
        {/* Safe area spacer for iPhones */}
        <div className="h-[env(safe-area-inset-bottom)] bg-[#111111]/90" />
      </nav>
    </div>
  )
}
