import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

export const authApi = {
  verifyStudent: (data) => api.post('/auth/verify-student', data),
  sendOTP: (data) => api.post('/auth/send-otp', data),
  verifyOTP: (data) => api.post('/auth/verify-otp', data),
  login: (data) => api.post('/auth/login', data)
}

export const attendanceApi = {
  getAttendance: () => api.get('/attendance'),
  getStudentAttendance: (studentId) => api.get(`/attendance/${studentId}`)
}

export const performanceApi = {
  getPerformance: () => api.get('/performance'),
  getStudentPerformance: (studentId) => api.get(`/performance/${studentId}`)
}

export const financeApi = {
  getFinance: () => api.get('/finance'),
  getStudentFinance: (studentId) => api.get(`/finance/${studentId}`)
}

export const notificationApi = {
  getNotifications: () => api.get('/notifications'),
  markAsRead: (id) => api.patch(`/notifications/${id}/read`)
}

export const facultyApi = {
  getFaculty: () => api.get('/faculty')
}

export const chatbotApi = {
  sendMessage: (message) => api.post('/chatbot', { message })
}

export default api
