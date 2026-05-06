import { cls } from "../lib/utils.js";

const STATUS_STYLES = {
  New: "bg-zinc-500/15 text-zinc-300 ring-1 ring-zinc-500/30",
  Contacted: "bg-blue-500/15 text-blue-300 ring-1 ring-blue-500/30",
  Interested: "bg-amber-500/15 text-amber-300 ring-1 ring-amber-500/30",
  Booked: "bg-violet-500/15 text-violet-300 ring-1 ring-violet-500/30",
  Won: "bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/30",
  Lost: "bg-rose-500/15 text-rose-300 ring-1 ring-rose-500/30",
  "In Progress": "bg-flame-500/15 text-flame-300 ring-1 ring-flame-500/30",
  Blocked: "bg-rose-500/15 text-rose-300 ring-1 ring-rose-500/30",
  Done: "bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/30",
  Pending: "bg-zinc-500/15 text-zinc-300 ring-1 ring-zinc-500/30",
};

export const LEAD_STATUSES = [
  "New",
  "Contacted",
  "Interested",
  "Booked",
  "Won",
  "Lost",
];

export const CLIENT_STATUSES = ["In Progress", "Blocked", "Done", "Pending"];

export default function Chip({ status, children, className }) {
  const style = STATUS_STYLES[status] || STATUS_STYLES.New;
  return (
    <span className={cls("chip", style, className)}>
      <span
        className={cls(
          "h-1.5 w-1.5 rounded-full",
          status === "Won" || status === "Done"
            ? "bg-emerald-400"
            : status === "Lost" || status === "Blocked"
              ? "bg-rose-400"
              : status === "Booked"
                ? "bg-violet-400"
                : status === "Interested"
                  ? "bg-amber-400"
                  : status === "Contacted"
                    ? "bg-blue-400"
                    : status === "In Progress"
                      ? "bg-flame-400 animate-pulse"
                      : "bg-zinc-400"
        )}
      />
      {children || status}
    </span>
  );
}
