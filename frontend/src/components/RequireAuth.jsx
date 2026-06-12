import { Navigate, useLocation } from 'react-router-dom'
import { getAccessToken, getRefreshToken } from '../config/api.js'

function hasAuthSession() {
  return Boolean(getAccessToken() || getRefreshToken())
}

function RequireAuth({ children }) {
  const location = useLocation()

  if (!hasAuthSession()) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return children
}

export default RequireAuth
