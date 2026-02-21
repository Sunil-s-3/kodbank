import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

export default function ProtectedRoute({ children }) {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    api
      .get('/user/balance')
      .then(() => {
        setAuthorized(true);
      })
      .catch(() => {
        navigate('/login', { replace: true });
      })
      .finally(() => {
        setChecking(false);
      });
  }, [navigate]);

  if (checking) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return authorized ? children : null;
}
