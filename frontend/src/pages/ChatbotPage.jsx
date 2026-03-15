import { useState, useRef, useEffect } from 'react'
import { chatbotApi } from '../services/api.js'

const ChatbotPage = () => {
  const [messages, setMessages] = useState([
    { type: 'bot', text: 'Hello! I am your academic assistant. How can I help you today?' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async (e) => {
    e.preventDefault()
    if (!input.trim() || loading) return

    const userMessage = input.trim()
    setInput('')
    setMessages(prev => [...prev, { type: 'user', text: userMessage }])
    setLoading(true)

    try {
      const response = await chatbotApi.sendMessage(userMessage)
      const botResponse = response.data.response || response.data.message || 'I apologize, I could not process your request.'
      setMessages(prev => [...prev, { type: 'bot', text: botResponse }])
    } catch (err) {
      setMessages(prev => [...prev, { 
        type: 'bot', 
        text: 'Sorry, I am having trouble connecting right now. Please try again later.' 
      }])
    } finally {
      setLoading(false)
    }
  }

  const quickQuestions = [
    'What is my child\'s attendance?',
    'Show me the CGPA',
    'Any pending fees?',
    'Recent notifications',
    'Who are the faculty members?'
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-2">Academic Chatbot</h1>
        <p className="text-gray-600 mb-6">Ask me anything about your child's academic information</p>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Messages Area */}
          <div className="h-96 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-3/4 px-4 py-2 rounded-lg ${
                    msg.type === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 px-4 py-2 rounded-lg">
                  <span className="animate-pulse">Typing...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Questions */}
          <div className="border-t px-4 py-3 bg-gray-50">
            <p className="text-sm text-gray-600 mb-2">Quick questions:</p>
            <div className="flex flex-wrap gap-2">
              {quickQuestions.map((q, i) => (
                <button
                  key={i}
                  onClick={() => setInput(q)}
                  className="text-sm bg-white border border-gray-300 px-3 py-1 rounded-full hover:bg-gray-100"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Input Area */}
          <form onSubmit={handleSend} className="border-t p-4 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ChatbotPage
