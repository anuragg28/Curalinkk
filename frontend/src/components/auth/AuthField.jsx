export function AuthField({ label, ...props }) {
  return (
    <div>
      <label className="mb-2 block text-[0.95rem] font-semibold text-white/68">{label}</label>
      <input
        {...props}
        className="min-h-[64px] w-full rounded-[18px] border border-white/10 bg-[#222222] px-5 text-[1rem] font-semibold text-zinc-50 outline-none placeholder:text-white/38 transition focus:border-emerald-400/40 focus:ring-2 focus:ring-emerald-400/18"
      />
    </div>
  )
}
