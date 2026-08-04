export function SidebarField({ label, placeholder, value, onChange }) {
  return (
    <div className="flex flex-col">
      <label className="text-[12px] font-medium text-[var(--text-secondary)] mb-[6px]">
        {label}
      </label>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="w-full rounded-[10px] border border-[var(--border)] bg-[var(--bg-elevated)] px-[14px] py-[10px] text-[14px] text-[var(--text-primary)] outline-none transition-colors duration-150 focus:border-[var(--accent)] placeholder:text-[var(--text-muted)]"
      />
    </div>
  )
}
