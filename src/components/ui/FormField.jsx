export function FormField({
    label,
    children,
    hint,
    className = "",
  }) {
    return (
      <label className={["grid gap-2 text-sm font-black text-slate-700", className].join(" ")}>
        <span>{label}</span>
        {children}
        {hint ? <span className="text-xs font-bold text-slate-500">{hint}</span> : null}
      </label>
    );
  }
  
  export const fieldClassName =
    "w-full rounded-2xl border border-blue-200 bg-[#f8fbff] px-3 py-2.5 font-bold text-slate-900 outline-none transition focus:border-[#005eb8] focus:ring-4 focus:ring-blue-100";