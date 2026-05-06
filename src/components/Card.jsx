import { cls } from "../lib/utils.js";

export function Card({ className, children, hover = false }) {
  return (
    <div
      className={cls(
        "surface p-5 animate-fade-in",
        hover && "transition-transform duration-150 hover:-translate-y-0.5 hover:border-flame-500/40",
        className
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({ title, subtitle, action, icon }) {
  return (
    <div className="mb-4 flex items-start justify-between gap-3">
      <div className="flex items-center gap-3">
        {icon && (
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-flame-500/10 text-flame-400 ring-1 ring-flame-500/20">
            {icon}
          </div>
        )}
        <div>
          <h3 className="text-[15px] font-semibold text-zinc-100">{title}</h3>
          {subtitle && (
            <p className="mt-0.5 text-xs text-zinc-500">{subtitle}</p>
          )}
        </div>
      </div>
      {action}
    </div>
  );
}

export function StatCard({ label, value, hint, icon, accent = false }) {
  return (
    <div
      className={cls(
        "surface relative overflow-hidden p-5 animate-fade-in",
        accent && "border-flame-500/40"
      )}
    >
      {accent && (
        <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-flame-500/20 blur-3xl" />
      )}
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs font-medium uppercase tracking-wider text-zinc-500">
            {label}
          </div>
          <div className="mt-2 text-3xl font-bold tracking-tight text-white">
            {value}
          </div>
          {hint && <div className="mt-1.5 text-xs text-zinc-400">{hint}</div>}
        </div>
        {icon && (
          <div
            className={cls(
              "grid h-10 w-10 place-items-center rounded-xl",
              accent
                ? "bg-flame-500 text-black"
                : "bg-ink-800 text-zinc-300 ring-1 ring-ink-700"
            )}
          >
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
