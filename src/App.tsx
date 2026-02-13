import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing'
import Signup from './pages/Signup'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import AddContact from './pages/AddContact'
import Contacts from './pages/Contacts'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/add-contact" element={<ProtectedRoute><AddContact /></ProtectedRoute>} />
        <Route path="/contacts" element={<ProtectedRoute><Contacts /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
