export function TrialCards({ sources }) {
  const trials = (sources || []).filter((source) => source.source === 'ClinicalTrials')

  return (
    <section className="grid gap-3">
      <div className="flex items-center justify-between">
        <h3 className="text-[0.92rem] font-semibold uppercase tracking-[0.18em] text-white/42">
          Clinical trials
        </h3>
        <span className="text-[0.85rem] text-white/45">{trials.length} trials</span>
      </div>

      <div className="grid gap-3">
        {trials.length ? (
          trials.map((trial, index) => (
            <article
              key={`${trial.url || trial.title}-${index}`}
              className="rounded-[20px] border border-white/10 bg-[#232323] p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-[0.76rem] font-semibold uppercase tracking-[0.18em] text-white/38">
                    ClinicalTrials
                  </p>
                  <h4 className="mt-2 text-[1rem] font-semibold text-zinc-50">{trial.title}</h4>
                </div>
                <span className="rounded-full border border-emerald-300/20 bg-emerald-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-200">
                  {trial.status || 'Unknown'}
                </span>
              </div>

              <p className="mt-3 line-clamp-3 text-[0.92rem] leading-6 text-white/56">
                {trial.abstract}
              </p>

              <div className="mt-4 flex items-center justify-between gap-3">
                <a
                  href={trial.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[0.88rem] font-semibold text-emerald-300 transition hover:text-emerald-200"
                >
                  Open trial
                </a>
                <span className="text-[0.88rem] text-white/45">{trial.year}</span>
              </div>
            </article>
          ))
        ) : (
          <div className="rounded-[20px] border border-dashed border-white/10 bg-white/[0.02] p-4 text-sm text-white/45">
            Clinical trial cards will appear if the pool includes trial results.
          </div>
        )}
      </div>
    </section>
  )
}
