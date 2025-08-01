// src/components/ProtectedRoute.tsx
import React from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from './AuthProvider'
import { useIsAdmin } from '../hooks/useIsAdmin'

interface ProtectedRouteProps {
  requireAdmin?: boolean
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ requireAdmin = false }) => {
  const { session } = useAuth()
  const location = useLocation()
  const { isAdmin, loading: adminLoading } = useIsAdmin()

  if (session === undefined || (requireAdmin && adminLoading)) {
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

  if (requireAdmin && !isAdmin) {
    return (
      <div className="p-6 text-center text-destructive font-semibold">
        🚫 Access Denied – Admins only.
      </div>
    )
  }

  return <Outlet context={{ session }} />
}

