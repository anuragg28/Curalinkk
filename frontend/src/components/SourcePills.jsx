export function SourcePills({ items }) {
  const pillItems = Array.isArray(items) ? items : []

  return (
    <div className="mt-4 flex flex-wrap gap-3">
      {pillItems.map((item) => (
        <span
          key={item}
          className="inline-flex items-center whitespace-nowrap rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-[0.92rem] font-semibold leading-none text-white/78 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]"
        >
          {item}
        </span>
      ))}
    </div>
  )
}
