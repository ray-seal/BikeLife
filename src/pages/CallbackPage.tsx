// src/pages/CallbackPage.tsx
import React, { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { useAuth } from '../components/AuthProvider'

const CallbackPage: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { setSession } = useAuth()

  useEffect(() => {
    const handleCallback = async () => {
      const { data, error } = await supabase.auth.getSession()

      if (error || !data.session) {
        console.error('Session fetch error:', error)
        return navigate('/auth', { replace: true })
      }

      setSession(data.session)

      // Optional: Get redirect path from query or state
      const redirectTo = new URLSearchParams(location.search).get('redirectTo') || '/'
      navigate(redirectTo, { replace: true })
    }

    handleCallback()
  }, [navigate, location.search, setSession])

  return (
    <div className="p-4 text-center text-muted">
      <span className="animate-pulse">Finishing authentication...</span>
    </div>
  )
}

export default CallbackPage
