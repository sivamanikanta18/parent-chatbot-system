import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext.jsx'
import Navbar from './components/Navbar.jsx'
import Footer from './components/Footer.jsx'
import Home from './pages/Home.jsx'
import Login from './pages/Login.jsx'
import OTPVerification from './pages/OTPVerification.jsx'
import Dashboard from './pages/Dashboard.jsx'
import ChatbotPage from './pages/ChatbotPage.jsx'

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth()
  
  if (loading) return <div>Loading...</div>
  
  return isAuthenticated ? children : <Navigate to="/login" />
}

function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/verify-otp" element={<OTPVerification />} />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/chatbot" element={
            <ProtectedRoute>
              <ChatbotPage />
            </ProtectedRoute>
          } />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

export default App
