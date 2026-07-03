"use client";

import Link from "next/link";
import { useStore } from "@/lib/store";
import { money, PIPELINE_STAGES } from "@/lib/company";
import { PageHeader, StatCard, ScoreBadge, StageBadge, typeLabel } from "@/components/ui";

export default function Dashboard() {
  const { leads, jobs } = useStore();

  const now = new Date();
  const thisMonth = (d) => {
    const x = new Date(d);
    return x.getFullYear() === now.getFullYear() && x.getMonth() === now.getMonth();
  };

  const newLeads = leads.filter((l) => l.status === "new");
  const pipelineValue = leads
    .filter((l) => !["won", "lost"].includes(l.status))
    .reduce((s, l) => s + (Number(l.value) || 0), 0);
  const revenueMTD = jobs
    .filter((j) => j.status === "completed" && thisMonth(j.date))
    .reduce((s, j) => s + j.amount, 0);
  const followUpsDue = leads.filter((l) => l.followUp && l.followUp <= now.toISOString().slice(0, 10));
  const recentLeads = [...leads].sort((a, b) => b.score - a.score).slice(0, 6);

  return (
    <div>
      <PageHeader
        title={`Good morning! ☀️`}
        subtitle={now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
      >
        <Link href="/app/coach" className="btn-primary">🧠 Today&apos;s Game Plan</Link>
        <Link href="/app/leads" className="btn-secondary">🔎 Find Leads</Link>
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="New Leads" value={newLeads.length} hint="Waiting for first contact" />
        <StatCard label="Pipeline Value" value={money(pipelineValue)} hint="Open opportunities" />
        <StatCard label="Revenue This Month" value={money(revenueMTD)} hint="Completed jobs" accent="text-emerald-600" />
        <StatCard
          label="Follow-ups Due"
          value={followUpsDue.length}
          hint={followUpsDue.length ? "Don't let them go cold!" : "All caught up 🎉"}
          accent={followUpsDue.length ? "text-amber-600" : "text-harbor-700"}
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="card p-5 lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-extrabold text-harbor-950">Hottest Leads</h2>
            <Link href="/app/leads" className="text-sm font-semibold text-harbor-600 hover:underline">View all →</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-xs uppercase tracking-wide text-slate-400">
                  <th className="py-2 pr-3">Lead</th>
                  <th className="py-2 pr-3">Type</th>
                  <th className="py-2 pr-3">City</th>
                  <th className="py-2 pr-3">Stage</th>
                  <th className="py-2">Score</th>
                </tr>
              </thead>
              <tbody>
                {recentLeads.map((l) => (
                  <tr key={l.id} className="border-b border-slate-50">
                    <td className="py-2.5 pr-3 font-semibold text-slate-700">{l.name}</td>
                    <td className="py-2.5 pr-3 text-slate-500">{typeLabel(l.type)}</td>
                    <td className="py-2.5 pr-3 text-slate-500">{l.city}</td>
                    <td className="py-2.5 pr-3"><StageBadge stage={l.status} /></td>
                    <td className="py-2.5"><ScoreBadge score={l.score} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card p-5">
            <h2 className="mb-3 font-extrabold text-harbor-950">Pipeline Snapshot</h2>
            <div className="space-y-2">
              {PIPELINE_STAGES.map((s) => {
                const count = leads.filter((l) => l.status === s.id).length;
                return (
                  <div key={s.id} className="flex items-center gap-3 text-sm">
                    <span className={`h-2.5 w-2.5 rounded-full ${s.color}`} />
                    <span className="flex-1 text-slate-600">{s.label}</span>
                    <span className="font-bold text-harbor-900">{count}</span>
                  </div>
                );
              })}
            </div>
            <Link href="/app/crm" className="btn-secondary mt-4 w-full">Open CRM →</Link>
          </div>

          <div className="card p-5">
            <h2 className="mb-3 font-extrabold text-harbor-950">Quick Actions</h2>
            <div className="grid gap-2">
              <Link href="/app/assistant" className="btn-secondary justify-start">🤖 Write outreach message</Link>
              <Link href="/app/estimates" className="btn-secondary justify-start">🧾 Create an estimate</Link>
              <Link href="/app/routes" className="btn-secondary justify-start">🗺️ Plan today&apos;s route</Link>
              <Link href="/app/reviews" className="btn-secondary justify-start">⭐ Request a review</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
