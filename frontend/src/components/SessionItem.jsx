export function SessionItem({ label, active = false }) {
  return (
    <button
      type="button"
      className={`session-item${active ? ' is-active' : ''}`}
      aria-pressed={active}
    >
      {label}
    </button>
  )
}
