import { Link } from 'react-router-dom'

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 py-20">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Parent Verification System
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Securely access your child's academic information including attendance, 
            CGPA, fee details, and more through our AI-powered chatbot.
          </p>
          <Link
            to="/login"
            className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition"
          >
            Parent Login
          </Link>
        </div>

        <div className="mt-20 grid md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-3">Secure Access</h3>
            <p className="text-gray-600">OTP-based authentication for secure parent verification</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-3">Academic Insights</h3>
            <p className="text-gray-600">View attendance, CGPA, and performance metrics</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-3">AI Chatbot</h3>
            <p className="text-gray-600">Get instant answers about your child's academics</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home
