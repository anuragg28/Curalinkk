export function WorkspaceHeader({ user, onLogout, onToggleSidebar }) {
  const initials = user?.name ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'AY'

  return (
    <header className="h-[56px] bg-[var(--bg-surface)] border-b border-[var(--border)] flex items-center justify-between px-6 shrink-0 z-10 w-full relative">
      <div className="md:hidden flex items-center h-full">
        <button 
          onClick={onToggleSidebar}
          className="p-2 -ml-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
          aria-label="Toggle Sidebar"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>
      </div>
      <div className="flex-1" />
      <div className="flex items-center gap-4">
        <button 
          onClick={onLogout}
          className="text-[13px] font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
        >
          Sign out
        </button>
        <div className="flex items-center justify-center w-[32px] h-[32px] rounded-full bg-[var(--bg-elevated)] border border-[var(--border)] text-[12px] font-semibold text-[var(--text-secondary)]">
          {initials}
        </div>
      </div>
    </header>
  )
}
