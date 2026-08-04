import { useState, useRef, useEffect } from 'react'

/* ─── Citation hover card ─── */
function CitationCard({ source, num, badgeRef }) {
  if (!source) return null
  const { title, authors, year, source: platform, url } = source
  return (
    <div
      className="citation-card"
      role="tooltip"
    >
      {/* header */}
      <div className="citation-card-header">
        <span className="citation-card-num">[{num}]</span>
        <span
          className="citation-card-platform"
          data-platform={platform?.toLowerCase()}
        >
          {platform}
        </span>
        {year && <span className="citation-card-year">{year}</span>}
      </div>

      {/* title */}
      <p className="citation-card-title">{title || `Reference ${num}`}</p>

      {/* authors */}
      {authors?.length > 0 && (
        <p className="citation-card-authors">
          {Array.isArray(authors) ? authors.slice(0, 3).join(', ') : authors}
          {Array.isArray(authors) && authors.length > 3 ? ' et al.' : ''}
        </p>
      )}

      {/* link */}
      {url ? (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="citation-card-link"
          onClick={(e) => e.stopPropagation()}
        >
          Open paper
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
            <path d="M1 9L9 1M9 1H3M9 1V7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </a>
      ) : (
        <span className="citation-card-nourl">No URL available</span>
      )}
    </div>
  )
}

/* ─── Citation badge with hover card ─── */
function CitationBadge({ num, source }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const timerRef = useRef(null)

  function show() {
    clearTimeout(timerRef.current)
    setOpen(true)
  }
  function hide() {
    timerRef.current = setTimeout(() => setOpen(false), 120)
  }

  // Close on outside click
  useEffect(() => {
    if (!open) return
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const hasUrl = Boolean(source?.url)

  return (
    <span ref={ref} className="citation-wrapper" onMouseEnter={show} onMouseLeave={hide}>
      <span
        className="citation-badge"
        data-has-url={hasUrl}
        onClick={() => hasUrl && window.open(source.url, '_blank', 'noopener,noreferrer')}
      >
        [{num}]
        {hasUrl && (
          <svg width="7" height="7" viewBox="0 0 10 10" fill="none" aria-hidden="true">
            <path d="M1 9L9 1M9 1H3M9 1V7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </span>
      {open && <CitationCard source={source} num={num} badgeRef={ref} />}
    </span>
  )
}

/* ─── Main component ─── */
export function AnswerBubble({ answer, sources = [] }) {
  if (!answer) return null

  const renderTextWithCitations = (text) => {
    const parts = text.split(/(\[\d+\])/g)
    return parts.map((part, i) => {
      if (/^\[\d+\]$/.test(part)) {
        const num = parseInt(part.replace(/[^\d]/g, ''), 10)
        const source = sources[num - 1]
        return <CitationBadge key={i} num={num} source={source} />
      }
      return <span key={i}>{part.replace(/\*\*(.*?)\*\*/g, '$1')}</span>
    })
  }

  const lines = answer.split('\n').map((l) => l.trim()).filter(Boolean)
  let currentSection = ''

  return (
    <div className="flex flex-col gap-3">
      {lines.map((line, idx) => {
        // Section Header (e.g. 1. **Title**)
        if (/^\d+\.\s+\*\*(.*?)\*\*$/.test(line)) {
          const title = line.replace(/^\d+\.\s+\*\*(.*?)\*\*$/, '$1')
          currentSection = title.toLowerCase()
          return (
            <div key={idx} className="mt-4 mb-1">
              <h4 className="text-[10px] font-bold tracking-[0.1em] text-[var(--text-muted)] uppercase mb-3">
                {title}
              </h4>
              <h3 className="text-[15px] font-semibold text-[var(--text-primary)]">
                {line.replace(/\*\*/g, '')}
              </h3>
            </div>
          )
        }

        // Bullet cards (e.g. - **Title**: body)
        if (line.startsWith('- **')) {
          const match = line.match(/-\s+\*\*(.*?)\*\*:\s*(.*)?/)
          if (match) {
            const [_, cardTitle, maybeCardBody] = match
            const cardBody = maybeCardBody || ''
            const isClinicalTrial = currentSection.includes('trial') || cardTitle.toLowerCase().includes('trial')
            return (
              <div
                key={idx}
                className={`bg-[var(--bg-elevated)] border border-[var(--border)] rounded-[10px] p-[16px] mb-1 ${
                  isClinicalTrial ? 'border-l-[3px] border-l-[#4D8EFF]' : 'border-l-[3px] border-l-[#00C896]'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h5 className="text-[13px] font-semibold text-[var(--text-primary)]">{cardTitle}</h5>
                  {isClinicalTrial && cardBody.toLowerCase().includes('recruiting') && (
                    <span className="px-2 py-0.5 rounded-full bg-[#00C89618] text-[#00C896] border border-[#00C89640] text-[11px] font-semibold">
                      RECRUITING
                    </span>
                  )}
                  {isClinicalTrial && !cardBody.toLowerCase().includes('recruiting') && (
                    <span className="px-2 py-0.5 rounded-full bg-[#8B8BA018] text-[#8B8BA0] border border-[#8B8BA040] text-[11px] font-semibold uppercase">
                      TRIAL
                    </span>
                  )}
                </div>
                <div className="text-[13px] text-[var(--text-secondary)] leading-[1.7]">
                  {renderTextWithCitations(cardBody)}
                </div>
              </div>
            )
          }
        }

        // Standard bullet
        if (line.startsWith('- ')) {
          return (
            <div key={idx} className="flex gap-3 text-[14px] leading-[1.8] text-[var(--text-secondary)] pl-2">
              <span className="text-[var(--text-muted)]">•</span>
              <span>{renderTextWithCitations(line.substring(2))}</span>
            </div>
          )
        }

        // Regular paragraph
        return (
          <div key={idx} className="text-[14px] leading-[1.8] text-[var(--text-secondary)]">
            {renderTextWithCitations(line)}
          </div>
        )
      })}
    </div>
  )
}

