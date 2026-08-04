export function WorkflowStages({ stages }) {
  const stageItems = Array.isArray(stages) ? stages : []

  return (
    <section className="grid gap-3 lg:grid-cols-3">
      {stageItems.map((stage, index) => (
        <article
          key={stage.title}
          className="rounded-[20px] border border-white/10 bg-white/[0.03] p-4 transition hover:border-white/15 hover:bg-white/[0.045]"
        >
          <div className="mb-3 flex items-center justify-between">
            <span className="text-[0.78rem] font-semibold uppercase tracking-[0.18em] text-white/38">
              0{index + 1}
            </span>
            <span className="h-2.5 w-2.5 rounded-full bg-white/18" />
          </div>
          <h3 className="text-[1rem] font-semibold text-zinc-50">{stage.title}</h3>
          <p className="mt-2 text-[0.92rem] leading-6 text-white/54">{stage.detail}</p>
        </article>
      ))}
    </section>
  )
}
