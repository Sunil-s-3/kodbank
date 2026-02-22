import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: '',
    password: '',
    email: '',
    phone: '',
    role: 'Customer',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const registerOnce = () => api.post('/auth/register', form);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      let res = await registerOnce();
      if (res?.data?.success) {
        setShowSuccess(true);
        setTimeout(() => navigate('/login'), 2500);
        return;
      }
      const retryRes = await registerOnce();
      if (retryRes?.data?.success) {
        setShowSuccess(true);
        setTimeout(() => navigate('/login'), 2500);
        return;
      }
      setError(retryRes?.data?.error || 'Registration failed');
    } catch (err) {
      const status = err.response?.status;
      const hasNoBody = err.response?.data === undefined || err.response?.data === '';
      const retriable = status === 0 || status === 502 || status === 503 || hasNoBody;
      if (retriable) {
        try {
          await new Promise((r) => setTimeout(r, 2500));
          const retryRes = await registerOnce();
          if (retryRes?.data?.success) {
            setShowSuccess(true);
            setTimeout(() => navigate('/login'), 2500);
            return;
          }
          setError(retryRes?.data?.error || 'Registration failed. Try again.');
        } catch (retryErr) {
          setError(retryErr.response?.data?.error || 'Registration failed. Try again.');
        }
      } else {
        setError(err.response?.data?.error || 'Registration failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Kodbank</h1>
        <h2>Register</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={form.username}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
          />
          <input
            type="tel"
            name="phone"
            placeholder="Phone"
            value={form.phone}
            onChange={handleChange}
          />
          <select name="role" value={form.role} onChange={handleChange}>
            <option value="Customer">Customer</option>
          </select>
          {error && <p className="error">{error}</p>}
          <button type="submit" disabled={loading}>
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>
        <p className="auth-link">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>

      {showSuccess && (
        <div className="register-success-overlay" role="dialog" aria-modal="true">
          <div className="register-success-modal">
            <div className="register-success-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <p className="register-success-message">Registration Successful! Redirecting...</p>
          </div>
        </div>
      )}
    </div>
  );
}
