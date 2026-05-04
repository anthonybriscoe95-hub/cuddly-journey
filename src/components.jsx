import { getStatusClass } from "./utils.js";

export function StatusBadge({ status }) {
  return (
    <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${getStatusClass(status)}`}>
      {status}
    </span>
  );
}

export function StackCard({ item }) {
  const Icon = item.icon;
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-4 transition hover:border-white/20">
      <div className="mb-3 flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-white text-slate-950">
          <Icon size={20} />
        </div>
        <div>
          <p className="text-xs uppercase tracking-[.2em] text-slate-500">{item.name}</p>
          <p className="font-black text-white">{item.tool}</p>
        </div>
      </div>
      <p className="text-sm text-slate-400">{item.description}</p>
    </div>
  );
}

export function EmptyState({ children }) {
  return (
    <div className="rounded-2xl border border-dashed border-white/10 bg-slate-950/50 p-4 text-sm text-slate-400">
      {children}
    </div>
  );
}

export function StatTile({ label, value, accent = "text-white" }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-3">
      <p className="text-[11px] uppercase tracking-[.18em] text-slate-500">{label}</p>
      <p className={`mt-1 text-2xl font-black ${accent}`}>{value}</p>
    </div>
  );
}

export function ToastStack({ toasts, onDismiss }) {
  if (!toasts.length) return null;
  return (
    <div className="pointer-events-none fixed bottom-6 right-6 z-50 flex w-[min(92vw,360px)] flex-col gap-2">
      {toasts.map((toast) => {
        const tone =
          toast.level === "error"
            ? "border-red-400/40 bg-red-500/10 text-red-100"
            : toast.level === "warn"
            ? "border-amber-400/40 bg-amber-500/10 text-amber-100"
            : toast.level === "ok"
            ? "border-emerald-400/40 bg-emerald-500/10 text-emerald-100"
            : "border-white/10 bg-slate-900/90 text-slate-100";
        return (
          <div
            key={toast.id}
            className={`pointer-events-auto rounded-2xl border px-4 py-3 text-sm shadow-2xl backdrop-blur ${tone}`}
            role="status"
          >
            <div className="flex items-start justify-between gap-3">
              <p>{toast.text}</p>
              <button
                onClick={() => onDismiss(toast.id)}
                aria-label="Dismiss"
                className="text-xs font-bold opacity-70 hover:opacity-100"
              >
                ×
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
