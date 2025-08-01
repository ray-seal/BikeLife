// src/pages/AuthPage.tsx
import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { useAuth } from '../components/AuthProvider'

export default function AuthPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState<'magic' | 'signin' | 'signup'>('magic')

  const navigate = useNavigate()
  const { setSession } = useAuth()
  const [searchParams] = useSearchParams()
  const redirectTo = searchParams.get('redirectTo') || '/account'

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?redirectTo=${encodeURIComponent(redirectTo)}`,
      },
    })

    if (error) alert(error.message)
    else alert('Check your email for the magic link!')

    setLoading(false)
  }

  const handleEmailPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const authFn =
      mode === 'signup'
        ? supabase.auth.signUp({ email, password })
        : supabase.auth.signInWithPassword({ email, password })

    const { data, error } = await authFn

    if (error) {
      alert(error.message)
    } else if (data.session) {
      setSession(data.session)
      navigate(redirectTo, { replace: true })
    }

    setLoading(false)
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-background text-foreground">
      <div className="w-full max-w-md space-y-6 p-6 rounded-xl border border-muted bg-muted/20 shadow-lg">
        <h2 className="text-2xl font-bold text-center">Welcome</h2>

        {/* MODE SWITCH */}
        <div className="flex justify-center gap-2">
          {['magic', 'signin', 'signup'].map((m) => (
            <button
              key={m}
              className={`px-3 py-1 rounded-full text-sm ${
                mode === m
                  ? 'bg-primary text-white'
                  : 'bg-muted hover:bg-muted/60'
              }`}
              onClick={() => setMode(m as typeof mode)}
            >
              {m === 'magic' ? 'Magic Link' : m === 'signin' ? 'Sign In' : 'Sign Up'}
            </button>
          ))}
        </div>

        {/* FORM */}
        <form
          onSubmit={mode === 'magic' ? handleMagicLink : handleEmailPassword}
          className="space-y-4"
        >
          <input
            className="w-full p-2 rounded border border-muted bg-background"
            type="email"
            placeholder="Your email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          {mode !== 'magic' && (
            <input
              className="w-full p-2 rounded border border-muted bg-background"
              type="password"
              placeholder="Your password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 rounded bg-primary text-white hover:bg-primary/90 disabled:opacity-50"
          >
            {loading
              ? 'Loading...'
              : mode === 'magic'
              ? 'Send Magic Link'
              : mode === 'signin'
              ? 'Sign In'
              : 'Sign Up'}
          </button>
        </form>
      </div>
    </div>
  )
}
