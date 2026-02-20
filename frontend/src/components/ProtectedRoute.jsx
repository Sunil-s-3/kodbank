import { useState, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import API from "../utils/api";

export default function ProtectedRoute({ children }) {
  const [loading, setLoading] = useState(true)
  const [authenticated, setAuthenticated] = useState(false)

  useEffect(() => {
    API.get("/api/auth/me")
      .then(() => setAuthenticated(true))
      .catch(() => setAuthenticated(false))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return <div className="loading">Loading...</div>
  }

  if (!authenticated) {
    return <Navigate to="/login" replace />
  }

  return children
}
