import { Link } from 'react-router-dom'

export function AuthFooterLink({ to, label, cta }) {
  return (
    <p className="mt-5 text-center text-[0.95rem] text-white/58">
      {label}{' '}
      <Link to={to} className="font-semibold text-emerald-300 transition hover:text-emerald-200">
        {cta}
      </Link>
    </p>
  )
}
