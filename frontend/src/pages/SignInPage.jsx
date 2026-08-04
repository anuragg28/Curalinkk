import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { AuthShell } from '../components/auth/AuthShell'
import { AuthCard } from '../components/auth/AuthCard'
import { AuthField } from '../components/auth/AuthField'
import { AuthFooterLink } from '../components/auth/AuthFooterLink'
import { useAuth } from '../context/useAuth'

export function SignInPage() {
  const { signIn, setError, error } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/app'
  const [form, setForm] = useState({ email: '', password: '' })
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setSubmitting(true)
    setError('')

    try {
      await signIn(form)
      navigate(from, { replace: true })
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthShell
      eyebrow="Curalink Access"
      title="Sign in to continue"
      description="Pick up your research sessions, manage patient context, and continue with your Curalink workspace."
    >
      <AuthCard>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <AuthField
            label="Email"
            type="email"
            value={form.email}
            onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
            placeholder="you@company.com"
            autoComplete="email"
            required
          />
          <AuthField
            label="Password"
            type="password"
            value={form.password}
            onChange={(event) =>
              setForm((current) => ({ ...current, password: event.target.value }))
            }
            placeholder="Enter your password"
            autoComplete="current-password"
            required
          />

          {error ? (
            <div className="rounded-[18px] border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">
              {error}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={submitting}
            className="mt-2 min-h-[64px] rounded-[18px] border border-emerald-300/18 bg-emerald-400/12 text-[1.04rem] font-semibold text-emerald-100 transition hover:bg-emerald-400/16 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <AuthFooterLink to="/signup" label="New to Curalink?" cta="Create an account" />
      </AuthCard>
    </AuthShell>
  )
}
