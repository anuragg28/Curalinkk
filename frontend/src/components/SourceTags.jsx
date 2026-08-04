export function SourceTags({ sourceCounts = {} }) {
  const sources = [
    { label: 'PubMed', count: sourceCounts.PubMed || 0, color: '#FF6B6B' },
    { label: 'OpenAlex', count: sourceCounts.OpenAlex || 0, color: '#4D8EFF' },
    { label: 'ClinicalTrials', count: sourceCounts.ClinicalTrials || 0, color: '#00C896' },
  ].filter(s => s.count > 0)

  if (sources.length === 0) return null

  return (
    <div className="flex items-center gap-2 mt-4 pt-4 border-t border-[var(--border)] overflow-x-auto whitespace-nowrap pb-2">
      <span className="text-[11px] font-semibold text-[var(--text-muted)] tracking-[0.05em] uppercase mr-1">
        Sources
      </span>
      {sources.map((source, index) => (
        <div
          key={source.label}
          className="inline-flex items-center gap-[6px] bg-[var(--bg-elevated)] border border-[var(--border)] rounded-full px-[12px] py-[5px] text-[12px] text-[var(--text-secondary)] transition-colors hover:border-[var(--accent)] animate-fade-slide-up"
          style={{ animationDelay: `${index * 50}ms` }}
        >
          <span
            className="w-[6px] h-[6px] rounded-full shrink-0"
            style={{ backgroundColor: source.color }}
          />
          <span className="font-medium text-[var(--text-primary)]">{source.label}</span>
          <span className="text-[var(--text-muted)]">{source.count} results</span>
        </div>
      ))}
    </div>
  )
}
