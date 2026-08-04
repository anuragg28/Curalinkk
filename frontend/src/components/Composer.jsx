export function Composer({ label, placeholder, value, onChange, onSend, loading, status }) {
  const isDisabled = !value.trim() || loading

  return (
    <footer className="border-t border-[var(--border)] bg-[var(--bg-base)] px-[48px] py-[20px] shrink-0">
      <div className="flex flex-col mx-auto max-w-[800px]">
        {status && <div className="mb-2 text-[12px] text-[var(--text-muted)] animate-pulse">{status}</div>}
        <div className="flex items-end bg-[var(--bg-elevated)] border border-[var(--border)] rounded-[14px] p-[12px] px-[16px] transition-colors focus-within:border-[var(--accent)]">
          <textarea
            rows={1}
            placeholder={placeholder || 'Ask a follow-up question...'}
            value={value}
            onChange={(e) => {
              onChange(e.target.value)
              e.target.style.height = 'auto'
              e.target.style.height = `${Math.min(e.target.scrollHeight, 160)}px`
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                if (!isDisabled) onSend()
              }
            }}
            className="flex-1 bg-transparent border-none outline-none resize-none min-h-[24px] max-h-[160px] text-[14px] text-[var(--text-primary)] leading-[1.6] placeholder:text-[var(--text-muted)]"
          />
          <button
            type="button"
            onClick={onSend}
            disabled={isDisabled}
            className={`shrink-0 ml-[12px] w-[36px] h-[36px] rounded-full flex items-center justify-center transition-all ${
              isDisabled 
                ? 'bg-[var(--border)] text-[var(--text-muted)] cursor-not-allowed' 
                : 'bg-[var(--accent)] text-[#0A0A0F] hover:bg-[var(--accent-hover)] active:scale-95 cursor-pointer'
            }`}
          >
            {loading ? (
              <span className="flex gap-[3px]">
                <span className="w-1 h-1 rounded-full bg-[#0A0A0F] animate-pulse"></span>
                <span className="w-1 h-1 rounded-full bg-[#0A0A0F] animate-pulse delay-75"></span>
                <span className="w-1 h-1 rounded-full bg-[#0A0A0F] animate-pulse delay-150"></span>
              </span>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="19" x2="12" y2="5"></line>
                <polyline points="5 12 12 5 19 12"></polyline>
              </svg>
            )}
          </button>
        </div>
        <div className="mt-2 text-center text-[11px] text-[var(--text-muted)]">
          {label}
        </div>
      </div>
    </footer>
  )
}
