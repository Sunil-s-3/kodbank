import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import confetti from 'canvas-confetti'
import ProtectedRoute from '../components/ProtectedRoute'
import axios from 'axios'

function DashboardContent() {
  const navigate = useNavigate()
  const [balance, setBalance] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showCelebration, setShowCelebration] = useState(false)

  const triggerConfetti = () => {
    confetti({
      particleCount: 150,
      spread: 100,
      origin: { y: 0.6 }
    })
    confetti({
      particleCount: 100,
      angle: 60,
      spread: 55,
      origin: { x: 0 }
    })
    confetti({
      particleCount: 100,
      angle: 120,
      spread: 55,
      origin: { x: 1 }
    })
  }

  const handleCheckBalance = async () => {
    setError('')
    setLoading(true)
    setShowCelebration(false)
    try {
      const res = await axios.get('/api/balance', { withCredentials: true })
      if (res.data.success) {
        setBalance(res.data.balance)
        setShowCelebration(true)
        triggerConfetti()
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch balance')
      setBalance(null)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await axios.post('/api/auth/logout', {}, { withCredentials: true })
    navigate('/login')
    window.location.reload()
  }

  return (
    <div className={`dashboard-page ${showCelebration ? 'celebration-bg' : ''}`}>
      <div className="dashboard-card">
        <button className="logout-btn" onClick={handleLogout}>Logout</button>
        <h1>Welcome to Kodbank</h1>
        <h2>User Dashboard</h2>
        <button
          className="check-balance-btn"
          onClick={handleCheckBalance}
          disabled={loading}
        >
          {loading ? 'Loading...' : 'Check Balance'}
        </button>
        {error && <p className="error">{error}</p>}
        {balance !== null && !error && (
          <div className="balance-display">
            <p className="balance-message">Your balance is: ₹{balance.toLocaleString()}</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default function Dashboard() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  )
}
