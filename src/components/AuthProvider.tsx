// src/components/AuthProvider.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import type { Session } from '@supabase/auth-js'

type AuthContextType = {
  session: Session | null
  setSession: (session: Session | null) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem('session')
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        // Optional: validate shape
        if (parsed?.access_token) setSession(parsed)
      } catch {
        localStorage.removeItem('session')
      }
    }
  }, [])

  useEffect(() => {
    if (session) {
      localStorage.setItem('session', JSON.stringify(session))
    } else {
      localStorage.removeItem('session')
    }
  }, [session])

  return (
    <AuthContext.Provider value={{ session, setSession }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
