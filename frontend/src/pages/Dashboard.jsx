import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import confetti from 'canvas-confetti';

export default function Dashboard() {
  const navigate = useNavigate();
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const triggerConfetti = () => {
    const colors = ['#e94560', '#0f3460', '#a2a8d3', '#ffd93d', '#6bcb77'];
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 },
      colors,
    });
    setTimeout(() => {
      confetti({
        particleCount: 60,
        angle: 60,
        spread: 60,
        origin: { x: 0 },
        colors,
      });
      confetti({
        particleCount: 60,
        angle: 120,
        spread: 60,
        origin: { x: 1 },
        colors,
      });
    }, 150);
    setTimeout(() => {
      confetti({
        particleCount: 40,
        scalar: 1.2,
        origin: { y: 0.8 },
        colors,
      });
    }, 300);
  };

  const handleCheckBalance = async () => {
    setError('');
    setLoading(true);
    setBalance(null);
    try {
      const { data } = await api.get('/user/balance');
      setBalance(data.balance);
      triggerConfetti();
    } catch (err) {
      if (err.response?.status === 401) {
        navigate('/login', { replace: true });
      } else {
        setError(err.response?.data?.error || 'Failed to fetch balance');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-page">
      <div className="dashboard-card">
        <h1>Kodbank Dashboard</h1>
        <button
          className="check-balance-btn"
          onClick={handleCheckBalance}
          disabled={loading}
        >
          {loading ? 'Checking...' : 'Check Balance'}
        </button>
        {balance !== null && (
          <div className="balance-display">
            <p className="balance-message">Your balance is: {balance}</p>
          </div>
        )}
        {error && <p className="error">{error}</p>}
      </div>
    </div>
  );
}
