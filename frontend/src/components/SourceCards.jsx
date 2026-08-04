function formatAuthors(authors) {
  if (!Array.isArray(authors) || authors.length === 0) {
    return 'Unknown authors'
  }

  return authors.join(', ')
}

export function SourceCards({ sources }) {
  const sourceItems = sources || []

  return (
    <section className="grid gap-3">
      <div className="flex items-center justify-between">
        <h3 className="text-[0.92rem] font-semibold uppercase tracking-[0.18em] text-white/42">
          Source cards
        </h3>
        <span className="text-[0.85rem] text-white/45">{sourceItems.length} sources</span>
      </div>

      <div className="grid gap-3">
        {sourceItems.length ? (
          sourceItems.map((source, index) => (
            <article
              key={`${source.url || source.title}-${index}`}
              className="rounded-[20px] border border-white/10 bg-white/[0.03] p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-[0.76rem] font-semibold uppercase tracking-[0.18em] text-white/38">
                    {source.source}
                  </p>
                  <h4 className="mt-2 text-[1rem] font-semibold text-zinc-50">{source.title}</h4>
                </div>
                <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs font-semibold text-white/65">
                  {source.year}
                </span>
              </div>

              <p className="mt-3 line-clamp-3 text-[0.92rem] leading-6 text-white/56">
                {source.abstract}
              </p>

              <p className="mt-3 text-[0.88rem] leading-6 text-white/48">
                {formatAuthors(source.authors)}
              </p>

              <div className="mt-4 flex items-center justify-between gap-3">
                <a
                  href={source.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[0.88rem] font-semibold text-emerald-300 transition hover:text-emerald-200"
                >
                  Open source
                </a>
                <span className="text-[0.88rem] text-white/45">
                  Score {Number(source.finalScore ?? source.semanticScore ?? 0).toFixed(3)}
                </span>
              </div>
            </article>
          ))
        ) : (
          <div className="rounded-[20px] border border-dashed border-white/10 bg-white/[0.02] p-4 text-sm text-white/45">
            Source cards will appear after a query is sent.
          </div>
        )}
      </div>
    </section>
  )
}
