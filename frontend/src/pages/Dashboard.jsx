import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import confetti from 'canvas-confetti';

const SIDEBAR_LINKS = [
  { label: 'Dashboard', active: true },
  { label: 'Transactions' },
  { label: 'Cards' },
  { label: 'Transfers' },
  { label: 'Analytics' },
  { label: 'Profile' },
  { label: 'Settings' },
  { label: 'Logout', logout: true },
];

const MOCK_TRANSACTIONS = [
  { id: 1, name: 'Netflix', category: 'Entertainment', date: '2024-02-18', amount: '-$15.99', status: 'Completed' },
  { id: 2, name: 'Salary Credit', category: 'Income', date: '2024-02-15', amount: '+$4,200', status: 'Completed' },
  { id: 3, name: 'Amazon', category: 'Shopping', date: '2024-02-17', amount: '-$89.00', status: 'Pending' },
  { id: 4, name: 'Electric Bill', category: 'Utilities', date: '2024-02-14', amount: '-$120.00', status: 'Completed' },
  { id: 5, name: 'Grocery Store', category: 'Food', date: '2024-02-16', amount: '-$65.40', status: 'Completed' },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const username = localStorage.getItem('username') || 'User';
  const [balance, setBalance] = useState(null);
  const [balanceLoading, setBalanceLoading] = useState(false);
  const [showBalance, setShowBalance] = useState(false);
  const [error, setError] = useState('');

  const runConfetti = () => {
    const colors = ['#e94560', '#0f3460', '#a2a8d3', '#ffd93d', '#6bcb77'];
    confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 }, colors });
    setTimeout(() => {
      confetti({ particleCount: 60, angle: 60, spread: 60, origin: { x: 0 }, colors });
      confetti({ particleCount: 60, angle: 120, spread: 60, origin: { x: 1 }, colors });
    }, 150);
  };

  const fetchBalance = async () => {
    setError('');
    setBalanceLoading(true);
    try {
      const { data } = await api.get('/user/balance');
      setBalance(data.balance);
    } catch (err) {
      if (err.response?.status === 401) {
        navigate('/login', { replace: true });
      } else {
        setError(err.response?.data?.error || 'Failed to fetch balance');
      }
    } finally {
      setBalanceLoading(false);
    }
  };

  const handleViewBalance = async () => {
    await fetchBalance();
    setShowBalance(true);
    runConfetti();
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    navigate('/login', { replace: true });
  };

  return (
    <div className="premium-dashboard">
      <aside className="dashboard-sidebar">
        <div className="sidebar-brand">Kodbank</div>
        <nav className="sidebar-nav">
          {SIDEBAR_LINKS.map((item) => (
            <button
              key={item.label}
              type="button"
              className={`sidebar-link ${item.active ? 'active' : ''}`}
              onClick={item.logout ? handleLogout : undefined}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      <main className="dashboard-main">
        <header className="dashboard-header">
          <div className="dashboard-welcome">
            <h1>Welcome back, {username}</h1>
            <p>Here&apos;s what&apos;s happening with your finance today.</p>
          </div>
          <button
            type="button"
            className="neo-summon-btn"
            onClick={() => window.open("https://sunil-3-neo-finance-assistant.hf.space", "_blank")}
            aria-label="Open Neo AI Assistant"
          >
            <div className="neo-title">Summon Neo</div>
            <div className="neo-subtitle">(Assistant)</div>
          </button>
        </header>

        <section className="stat-cards">
          <div className="stat-card">
            <span className="stat-label">Total Balance</span>
            {!showBalance ? (
              <button
                type="button"
                className="view-balance-btn"
                onClick={handleViewBalance}
                disabled={balanceLoading}
              >
                {balanceLoading ? 'Loading...' : 'View Balance'}
              </button>
            ) : (
              <>
                <h2 className="balance-amount">
                  ${balance != null ? Number(balance).toLocaleString() : '—'}
                </h2>
                <span className="stat-trend stat-trend-neutral">Live</span>
                <button type="button" className="stat-refresh" onClick={fetchBalance} disabled={balanceLoading}>
                  Refresh
                </button>
              </>
            )}
          </div>
          <div className="stat-card">
            <span className="stat-label">Monthly Income</span>
            <span className="stat-value">$4,200</span>
            <span className="stat-trend stat-trend-up">+2.1%</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Monthly Expenses</span>
            <span className="stat-value">$2,840</span>
            <span className="stat-trend stat-trend-down">-1.2%</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Total Savings</span>
            <span className="stat-value">$1,360</span>
            <span className="stat-trend stat-trend-up">+5.3%</span>
          </div>
        </section>

        {error && <p className="dashboard-error">{error}</p>}

        <section className="dashboard-grid">
          <div className="analytics-card">
            <h3>Spending Analytics</h3>
            <div className="chart-placeholder">
              <div className="chart-bars">
                {[65, 40, 80, 45, 70, 55, 90].map((h, i) => (
                  <div key={i} className="chart-bar" style={{ height: `${h}%` }} />
                ))}
              </div>
              <p className="chart-legend">Mon — Sun (mock)</p>
            </div>
          </div>
          <div className="transactions-card">
            <h3>Recent Transactions</h3>
            <ul className="transactions-list">
              {MOCK_TRANSACTIONS.map((tx) => (
                <li key={tx.id} className="transaction-item">
                  <div className="tx-info">
                    <span className="tx-name">{tx.name}</span>
                    <span className="tx-category">{tx.category}</span>
                  </div>
                  <div className="tx-meta">
                    <span className="tx-date">{tx.date}</span>
                    <span className={`tx-amount ${tx.amount.startsWith('+') ? 'positive' : 'negative'}`}>{tx.amount}</span>
                    <span className={`tx-status tx-status-${tx.status.toLowerCase()}`}>{tx.status}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>
    </div>
  );
}
