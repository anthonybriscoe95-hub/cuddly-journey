import { cls } from "../lib/utils.js";

export default function Progress({ value = 0, max = 100, className, accent = "flame" }) {
  const pct = Math.max(0, Math.min(100, (value / Math.max(max, 1)) * 100));
  return (
    <div className={cls("h-2 w-full overflow-hidden rounded-full bg-ink-800", className)}>
      <div
        className={cls(
          "h-full rounded-full transition-all duration-500",
          accent === "flame"
            ? "bg-gradient-to-r from-flame-600 to-flame-400"
            : accent === "emerald"
              ? "bg-gradient-to-r from-emerald-600 to-emerald-400"
              : "bg-gradient-to-r from-zinc-500 to-zinc-300"
        )}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
