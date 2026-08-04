import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'

export function PublicRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return null
  }

  if (user) {
    return <Navigate to="/app" replace />
  }

  return children
}
