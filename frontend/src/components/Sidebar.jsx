import { SidebarField } from './SidebarField'

export function Sidebar({ copy, values, sessions = [], onFieldChange, onStartSession, conversationId, isOpen, onClose }) {
  const fields = Array.isArray(copy?.fields) ? copy.fields : []
  const focusOptions = Array.isArray(copy?.focusOptions) ? copy.focusOptions : []

  return (
    <>
      {/* Backdrop for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      <aside className={`
        fixed inset-y-0 left-0 z-50 w-[300px] bg-[var(--bg-surface)] border-r border-[var(--border)] 
        flex flex-col transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        md:relative md:translate-x-0 md:flex md:h-full md:shrink-0
      `}>
        <header className="px-5 py-5 border-b border-[var(--border-subtle)] shrink-0 flex items-center justify-between">
          <div>
            <h1 className="text-[1.2rem] font-semibold text-white tracking-tight flex items-center gap-1">
              <span>{String(copy?.brand || 'Cura').slice(0, 4)}</span>
              <span className="text-[var(--accent)]">{String(copy?.brand || 'link').slice(4)}</span>
            </h1>
            <p className="mt-1 text-[11px] uppercase tracking-[0.05em] font-medium text-[var(--text-muted)]">
              {copy?.tagline || 'AI Medical Research Assistant'}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="md:hidden p-2 text-[var(--text-muted)] hover:text-white transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-5 py-6 flex flex-col gap-8">
          <section className="flex flex-col gap-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">
              {copy?.sectionLabel || 'Patient context'}
            </p>

          <div className="flex flex-col gap-[14px]">
            {fields.map((field) => (
              <SidebarField
                key={field.key}
                label={field.label}
                placeholder={field.placeholder}
                value={values[field.key]}
                onChange={(event) => onFieldChange(field.key, event.target.value)}
              />
            ))}

            <div className="flex flex-col">
              <label className="text-[12px] font-medium text-[var(--text-secondary)] mb-[6px]">
                {copy?.focusLabel || 'Research focus'}
              </label>
              <div className="relative">
                <select
                  value={values.focus}
                  onChange={(event) => onFieldChange('focus', event.target.value)}
                  className="w-full appearance-none rounded-[10px] border border-[var(--border)] bg-[var(--bg-elevated)] px-[14px] py-[10px] text-[14px] text-[var(--text-primary)] outline-none transition-colors duration-150 focus:border-[var(--accent)]"
                >
                  <option value="" disabled>
                    {copy?.focusPlaceholder || 'Choose a research focus'}
                  </option>
                  {focusOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                <span className="pointer-events-none absolute right-[12px] top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            className="mt-2 w-full h-[44px] rounded-[10px] bg-[var(--accent)] text-[#0A0A0F] text-[14px] font-semibold transition-all duration-150 hover:bg-[var(--accent-hover)] active:scale-98 focus:outline-none"
            onClick={onStartSession}
          >
            {copy?.actionLabel || 'Start research session'}
          </button>
        </section>

        <section className="flex flex-col gap-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">
            {copy?.recentLabel || 'Recent sessions'}
          </p>

          <div className="flex flex-col gap-1">
            {sessions.length > 0 ? (
              sessions.map((session) => {
                const isActive = session.conversationId === conversationId
                const label = session.patient?.disease 
                  ? `${session.patient.disease}` + (session.patient.focus ? ` - ${session.patient.focus}` : '')
                  : `Session ${session.conversationId.slice(0, 4)}`

                return (
                  <button
                    key={session.conversationId}
                    className={`text-left w-full rounded-[8px] px-3 py-2 text-[13px] transition-colors duration-150 ${
                      isActive
                        ? 'bg-[var(--accent-dim)] text-[var(--accent)] border-l-2 border-[var(--accent)]'
                        : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] border-l-2 border-transparent'
                    }`}
                  >
                    <span className="line-clamp-1">{label}</span>
                  </button>
                )
              })
            ) : (
              <div className="text-[13px] text-[var(--text-muted)] px-1 py-2">
                {copy?.emptyRecentLabel || 'No saved sessions yet'}
              </div>
            )}
          </div>
        </section>
      </div>
    </aside>
    </>
  )
}
