import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { AuthShell } from '../components/auth/AuthShell'
import { AuthCard } from '../components/auth/AuthCard'
import { AuthField } from '../components/auth/AuthField'
import { AuthFooterLink } from '../components/auth/AuthFooterLink'
import { useAuth } from '../context/useAuth'

export function SignUpPage() {
  const { signUp, setError, error } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/app'
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setSubmitting(true)
    setError('')

    try {
      await signUp(form)
      navigate(from, { replace: true })
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthShell
      eyebrow="Create Curalink Account"
      title="Sign up for the workspace"
      description="Set up your clinician or research account to start using the Curalink medical research assistant."
    >
      <AuthCard>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <AuthField
            label="Full name"
            type="text"
            value={form.name}
            onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
            placeholder="Dr. Alex Morgan"
            autoComplete="name"
            required
          />
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
            placeholder="Create a password"
            autoComplete="new-password"
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
            {submitting ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <AuthFooterLink to="/signin" label="Already have an account?" cta="Sign in" />
      </AuthCard>
    </AuthShell>
  )
}
