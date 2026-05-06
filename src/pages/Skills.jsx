import { useMemo, useState } from "react";
import { Card } from "../components/Card.jsx";
import Icon from "../components/Icon.jsx";
import SkillRunner from "../components/SkillRunner.jsx";
import { SKILLS } from "../skills/registry.js";
import { cls } from "../lib/utils.js";

const TAGS = ["All", "Discovery", "Outreach", "Sales", "Marketing", "Content", "Ops", "Planning"];

export default function Skills() {
  const [active, setActive] = useState(null);
  const [tag, setTag] = useState("All");
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    return SKILLS.filter((s) => {
      if (tag !== "All" && s.accent !== tag) return false;
      if (q && !`${s.name} ${s.description}`.toLowerCase().includes(q.toLowerCase()))
        return false;
      return true;
    });
  }, [tag, q]);

  return (
    <div className="space-y-6">
      <Card className="!p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2 rounded-lg border border-ink-700 bg-ink-850 px-3 py-2 sm:flex-1">
            <Icon name="search" className="h-4 w-4 text-zinc-500" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search skills…"
              className="w-full border-0 bg-transparent p-0 text-sm focus:ring-0 focus:shadow-none"
              style={{ outline: "none" }}
            />
          </div>
          <div className="no-scrollbar flex gap-1.5 overflow-x-auto">
            {TAGS.map((t) => (
              <button
                key={t}
                onClick={() => setTag(t)}
                className={cls(
                  "shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
                  tag === t
                    ? "border-flame-500/40 bg-flame-500/10 text-flame-400"
                    : "border-ink-700 bg-ink-850 text-zinc-400 hover:text-white"
                )}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((s) => (
          <button
            key={s.id}
            onClick={() => setActive(s)}
            className="group surface relative overflow-hidden p-5 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-flame-500/40 animate-fade-in"
          >
            <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-flame-500/10 opacity-0 blur-2xl transition-opacity group-hover:opacity-100" />
            <div className="flex items-start justify-between">
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-flame-500/10 text-flame-400 ring-1 ring-flame-500/20 transition-transform group-hover:scale-110">
                <Icon name={s.icon} className="h-6 w-6" />
              </div>
              <span className="chip bg-ink-800 text-zinc-400 ring-1 ring-ink-700">
                {s.accent}
              </span>
            </div>
            <h3 className="mt-4 text-lg font-bold text-white">{s.name}</h3>
            <p className="mt-1 text-sm text-zinc-400">{s.description}</p>
            <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-flame-400 opacity-0 transition-opacity group-hover:opacity-100">
              Run skill <Icon name="arrowRight" className="h-3.5 w-3.5" />
            </div>
          </button>
        ))}
        {filtered.length === 0 && (
          <div className="surface col-span-full p-10 text-center text-sm text-zinc-500">
            No skills match.
          </div>
        )}
      </div>

      <SkillRunner skill={active} open={!!active} onClose={() => setActive(null)} />
    </div>
  );
}
