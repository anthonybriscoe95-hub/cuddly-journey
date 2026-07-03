"use client";

import Link from "next/link";
import { useStore } from "@/lib/store";
import { money } from "@/lib/company";
import { PageHeader, typeLabel } from "@/components/ui";

// Rule-based daily briefing computed from live CRM data. Every insight below
// is derived from the owner's actual pipeline, not canned text.
function buildBriefing({ leads, jobs }) {
  const today = new Date().toISOString().slice(0, 10);
  const now = new Date();
  const thisMonth = (d) => {
    const x = new Date(d);
    return x.getFullYear() === now.getFullYear() && x.getMonth() === now.getMonth();
  };

  // Best neighborhoods: open leads clustered by neighborhood, weighted by score.
  const hoods = {};
  leads
    .filter((l) => !["won", "lost"].includes(l.status))
    .forEach((l) => {
      const key = l.neighborhood ? `${l.neighborhood} (${l.city})` : l.city;
      if (!key) return;
      hoods[key] = hoods[key] || { count: 0, score: 0, value: 0 };
      hoods[key].count++;
      hoods[key].score += l.score;
      hoods[key].value += Number(l.value) || 0;
    });
  const bestHoods = Object.entries(hoods)
    .map(([name, h]) => ({ name, ...h, avg: Math.round(h.score / h.count) }))
    .sort((a, b) => b.count * b.avg - a.count * a.avg)
    .slice(0, 3);

  const businessesToVisit = leads
    .filter((l) => ["business", "property_manager"].includes(l.type) && ["new", "contacted"].includes(l.status))
    .sort((a, b) => b.score - a.score)
    .slice(0, 4);

  const followUps = leads
    .filter((l) => l.followUp && l.followUp <= today && !["won", "lost"].includes(l.status))
    .sort((a, b) => (a.followUp < b.followUp ? -1 : 1));

  const revenueMTD = jobs.filter((j) => j.status === "completed" && thisMonth(j.date)).reduce((s, j) => s + j.amount, 0);
  const jobsCompleted = jobs.filter((j) => j.status === "completed" && thisMonth(j.date)).length;
  const jobsScheduled = jobs.filter((j) => j.status === "scheduled");
  const reviewsPending = jobs.filter((j) => j.status === "completed" && !j.reviewRequested);
  const untouchedNew = leads.filter((l) => l.status === "new");

  const tasks = [];
  if (followUps.length) tasks.push({ icon: "⏰", text: `Call your ${followUps.length} overdue follow-up${followUps.length > 1 ? "s" : ""} first — warm leads cool off fast.`, href: "/app/crm" });
  if (untouchedNew.length) tasks.push({ icon: "🤖", text: `Send intro messages to ${untouchedNew.length} new lead${untouchedNew.length > 1 ? "s" : ""} with the AI Assistant.`, href: "/app/assistant" });
  if (reviewsPending.length) tasks.push({ icon: "⭐", text: `Request reviews from ${reviewsPending.map((j) => j.customer.split(" ")[0]).join(" & ")} — recent jobs get the best response.`, href: "/app/reviews" });
  if (bestHoods[0]) tasks.push({ icon: "🚪", text: `Door-knock ${bestHoods[0].name} while you're in the area — ${bestHoods[0].count} open leads there.`, href: "/app/routes" });
  tasks.push({ icon: "📣", text: "Post a before/after to Facebook and your Google Business Profile — 2 minutes in the Marketing Studio.", href: "/app/marketing" });

  return { bestHoods, businessesToVisit, followUps, revenueMTD, jobsCompleted, jobsScheduled, tasks };
}

export default function Coach() {
  const store = useStore();
  const b = buildBriefing(store);
  const dateStr = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  return (
    <div>
      <PageHeader title="AI Business Coach" subtitle={`Your morning briefing for ${dateStr} — built from your live pipeline.`} />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <div className="card border-l-4 border-l-emerald-500 p-5">
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Revenue this month</div>
          <div className="mt-1 text-3xl font-extrabold text-emerald-600">{money(b.revenueMTD)}</div>
        </div>
        <div className="card border-l-4 border-l-harbor-500 p-5">
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Jobs completed</div>
          <div className="mt-1 text-3xl font-extrabold text-harbor-700">{b.jobsCompleted}</div>
        </div>
        <div className="card border-l-4 border-l-amber-400 p-5">
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Jobs on the calendar</div>
          <div className="mt-1 text-3xl font-extrabold text-amber-600">{b.jobsScheduled.length}</div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card p-6">
          <h2 className="font-extrabold text-harbor-950">✅ Today&apos;s game plan</h2>
          <ol className="mt-3 space-y-3">
            {b.tasks.map((t, i) => (
              <li key={i}>
                <Link href={t.href} className="flex items-start gap-3 rounded-xl border border-slate-100 p-3 transition hover:border-harbor-200 hover:bg-harbor-50/50">
                  <span className="text-xl">{t.icon}</span>
                  <span className="text-sm font-semibold text-slate-700">{t.text}</span>
                </Link>
              </li>
            ))}
          </ol>
        </div>

        <div className="space-y-6">
          <div className="card p-6">
            <h2 className="font-extrabold text-harbor-950">📍 Best neighborhoods to market</h2>
            {b.bestHoods.length ? (
              <div className="mt-3 space-y-2">
                {b.bestHoods.map((h, i) => (
                  <div key={h.name} className="flex items-center gap-3 rounded-xl bg-harbor-50 p-3 text-sm">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-harbor-600 text-xs font-black text-white">{i + 1}</span>
                    <span className="flex-1 font-bold text-harbor-900">{h.name}</span>
                    <span className="text-xs text-slate-500">{h.count} leads · avg score {h.avg}{h.value ? ` · ${money(h.value)} open` : ""}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-2 text-sm text-slate-400">Add leads with neighborhoods to unlock this.</p>
            )}
          </div>

          <div className="card p-6">
            <h2 className="font-extrabold text-harbor-950">🏢 Businesses worth a visit</h2>
            {b.businessesToVisit.length ? (
              <ul className="mt-3 space-y-2 text-sm">
                {b.businessesToVisit.map((l) => (
                  <li key={l.id} className="flex items-center justify-between rounded-xl border border-slate-100 p-3">
                    <div>
                      <div className="font-bold text-slate-700">{l.name}</div>
                      <div className="text-xs text-slate-400">{typeLabel(l.type)} · {l.neighborhood || l.city}</div>
                    </div>
                    <span className="badge bg-harbor-100 text-harbor-700">score {l.score}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-slate-400">No open business leads right now — run a Lead Finder search.</p>
            )}
          </div>

          <div className="card p-6">
            <h2 className="font-extrabold text-harbor-950">📞 Customers to follow up with</h2>
            {b.followUps.length ? (
              <ul className="mt-3 space-y-2 text-sm">
                {b.followUps.map((l) => (
                  <li key={l.id} className="flex items-center justify-between rounded-xl border border-amber-100 bg-amber-50/50 p-3">
                    <div>
                      <div className="font-bold text-slate-700">{l.name}</div>
                      <div className="text-xs text-amber-600">Due {l.followUp}</div>
                    </div>
                    {l.phone && <a className="btn-secondary text-xs" href={`tel:${l.phone}`}>📞 Call</a>}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-emerald-600">All caught up — nothing overdue. 🎉</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
