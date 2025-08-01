// src/components/ProtectedRoute.tsx
import React from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from './AuthProvider'

export const ProtectedRoute: React.FC => {
  const { session } = useAuth()
  const location = useLocation()

  if (session === undefined {
    return (
      <div className="p-4 text-center text-muted">
        <span className="animate-pulse">Checking session...</span>
      </div>
    )
  }

  if (session === null) {
    const redirectTo = encodeURIComponent(location.pathname + location.search)
    return <Navigate to={`/auth?redirectTo=${redirectTo}`} replace />
  }

  return <Outlet context={{ session }} />
}

