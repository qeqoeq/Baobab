import { BrowserRouter, Routes, Route, Outlet, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import Login from './pages/Login'
import Constellation from './pages/Constellation'
import Onboarding from './pages/Onboarding'
import Relations from './pages/Relations'
import Evaluate from './pages/Evaluate'
import ContactProfile from './pages/ContactProfile'
import Profile from './pages/Profile'
import ProtectedRoute from './components/ProtectedRoute'
import BottomNav from './components/layout/BottomNav'
import ToastHost from './components/ui/ToastHost'

function ProtectedLayout() {
  const location = useLocation()
  const hideBottomNav =
    location.pathname === '/onboarding' ||
    location.pathname.startsWith('/evaluate/')

  return (
    <div className="min-h-screen pb-20">
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
        >
          <Outlet />
        </motion.div>
      </AnimatePresence>
      {!hideBottomNav && <BottomNav />}
      <ToastHost />
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          element={
            <ProtectedRoute>
              <ProtectedLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<Constellation />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/relations" element={<Relations />} />
          <Route path="/evaluate/:contactId" element={<Evaluate />} />
          <Route path="/contact/:contactId" element={<ContactProfile />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
