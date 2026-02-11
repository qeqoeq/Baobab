import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/signup" element={<h1>Signup</h1>} />
        <Route path="/login" element={<h1>Login</h1>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
