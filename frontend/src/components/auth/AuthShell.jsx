export function AuthShell({ eyebrow, title, description, children }) {
  return (
    <main className="min-h-dvh bg-[#121212] p-3 text-zinc-100">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.12),transparent_32%),radial-gradient(circle_at_top_right,rgba(59,130,246,0.08),transparent_28%),radial-gradient(circle_at_bottom,rgba(255,255,255,0.04),transparent_35%)]" />
      <div className="relative mx-auto grid min-h-[calc(100dvh-1.5rem)] max-w-[1480px] overflow-hidden rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(38,38,38,0.98),rgba(26,26,26,0.98))] shadow-[0_24px_80px_rgba(0,0,0,0.42)] lg:grid-cols-[minmax(320px,0.95fr)_minmax(0,1.05fr)]">
        <section className="flex flex-col justify-between border-b border-white/10 bg-[#191919] px-6 py-7 lg:border-b-0 lg:border-r lg:px-8 lg:py-8">
          <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-6">
            <p className="text-[0.8rem] font-semibold uppercase tracking-[0.18em] text-emerald-300/85">
              {eyebrow}
            </p>
            <h1 className="mt-3 text-[2.4rem] font-semibold tracking-[-0.05em] text-zinc-50 sm:text-[3rem]">
              Curalink
            </h1>
            <p className="mt-3 max-w-md text-[1rem] leading-7 text-white/60">
              AI Medical Research Assistant built for focused clinical search,
              evidence synthesis, and clean research workflows.
            </p>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            {[
              ['Secure auth', 'JWT sessions with MongoDB-backed users.'],
              ['Fast workflow', 'Simple sign in and sign up with clear states.'],
              ['Consistent UI', 'Matches the dark Curalink dashboard theme.'],
            ].map(([titleText, body]) => (
              <article
                key={titleText}
                className="rounded-[22px] border border-white/10 bg-white/[0.03] p-5"
              >
                <h2 className="text-[1rem] font-semibold text-zinc-50">{titleText}</h2>
                <p className="mt-2 text-[0.93rem] leading-6 text-white/55">{body}</p>
              </article>
            ))}
          </div>

          <div className="mt-6 rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(34,34,34,0.9),rgba(28,28,28,0.9))] p-5">
            <p className="text-[0.82rem] font-semibold uppercase tracking-[0.18em] text-white/42">
              Research-ready interface
            </p>
            <p className="mt-3 text-[1.02rem] leading-7 text-white/64">
              Switch between sign in and sign up, then continue into the same
              dashboard shell you already have.
            </p>
          </div>
        </section>

        <section className="flex items-center justify-center px-5 py-8 sm:px-8">
          <div className="w-full max-w-[560px]">
            <div className="mb-5">
              <p className="text-[0.8rem] font-semibold uppercase tracking-[0.18em] text-emerald-300/85">
                {eyebrow}
              </p>
              <h2 className="mt-3 text-[1.8rem] font-semibold tracking-[-0.04em] text-zinc-50 sm:text-[2.1rem]">
                {title}
              </h2>
              <p className="mt-2 max-w-xl text-[0.98rem] leading-7 text-white/58">
                {description}
              </p>
            </div>

            {children}
          </div>
        </section>
      </div>
    </main>
  )
}
