import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

const Navbar = () => {
  const { isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <nav className="bg-blue-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="text-xl font-bold">Parent Portal</Link>
          <div className="flex space-x-4">
            <Link to="/" className="hover:text-blue-200">Home</Link>
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="hover:text-blue-200">Dashboard</Link>
                <Link to="/chatbot" className="hover:text-blue-200">Chatbot</Link>
                <button onClick={handleLogout} className="hover:text-blue-200">Logout</button>
              </>
            ) : (
              <Link to="/login" className="hover:text-blue-200">Login</Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
