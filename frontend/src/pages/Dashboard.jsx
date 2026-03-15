import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { attendanceApi, performanceApi, financeApi, notificationApi } from '../services/api.js'

const Dashboard = () => {
  const { user } = useAuth()
  const [attendance, setAttendance] = useState(null)
  const [performance, setPerformance] = useState(null)
  const [finance, setFinance] = useState(null)
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [attRes, perfRes, finRes, notifRes] = await Promise.all([
        attendanceApi.getAttendance(),
        performanceApi.getPerformance(),
        financeApi.getFinance(),
        notificationApi.getNotifications()
      ])
      
      setAttendance(attRes.data)
      setPerformance(perfRes.data)
      setFinance(finRes.data)
      setNotifications(notifRes.data)
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading dashboard...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-2">Parent Dashboard</h1>
        <p className="text-gray-600 mb-8">Welcome! View your child's academic information below.</p>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {/* Attendance Card */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4 text-blue-600">Attendance</h3>
            {attendance ? (
              <div>
                <div className="text-3xl font-bold text-green-600">
                  {attendance.percentage || attendance.overallPercentage || 'N/A'}%
                </div>
                <p className="text-gray-600 mt-2">Overall Attendance</p>
                {attendance.presentDays !== undefined && (
                  <p className="text-sm text-gray-500 mt-1">
                    {attendance.presentDays} / {attendance.totalDays} days present
                  </p>
                )}
              </div>
            ) : (
              <p className="text-gray-500">No attendance data available</p>
            )}
          </div>

          {/* CGPA Card */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4 text-purple-600">Academic Performance</h3>
            {performance ? (
              <div>
                <div className="text-3xl font-bold text-purple-600">
                  {performance.cgpa || performance.currentCGPA || 'N/A'}
                </div>
                <p className="text-gray-600 mt-2">Current CGPA</p>
                {performance.credits && (
                  <p className="text-sm text-gray-500 mt-1">
                    {performance.credits} credits earned
                  </p>
                )}
              </div>
            ) : (
              <p className="text-gray-500">No performance data available</p>
            )}
          </div>

          {/* Fee Card */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4 text-orange-600">Fee Status</h3>
            {finance ? (
              <div>
                <div className="text-2xl font-bold text-orange-600">
                  ₹{finance.pendingAmount || finance.pendingFee || 0}
                </div>
                <p className="text-gray-600 mt-2">Pending Amount</p>
                {finance.totalAmount && (
                  <p className="text-sm text-gray-500 mt-1">
                    Total: ₹{finance.totalAmount}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-gray-500">No fee data available</p>
            )}
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">Recent Notifications</h3>
          {notifications.length > 0 ? (
            <div className="space-y-3">
              {notifications.slice(0, 5).map((notif) => (
                <div 
                  key={notif._id || notif.id} 
                  className={`p-3 rounded-lg ${notif.isRead ? 'bg-gray-50' : 'bg-blue-50 border-l-4 border-blue-500'}`}
                >
                  <p className="font-medium">{notif.title}</p>
                  <p className="text-sm text-gray-600">{notif.message}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(notif.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No notifications</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard
