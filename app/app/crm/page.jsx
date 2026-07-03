"use client";

import { useState } from "react";
import { useStore, updateLead, addJob } from "@/lib/store";
import { PIPELINE_STAGES, money } from "@/lib/company";
import { PageHeader, ScoreBadge, typeLabel } from "@/components/ui";

function LeadCard({ lead }) {
  const [open, setOpen] = useState(false);
  const stageIdx = PIPELINE_STAGES.findIndex((s) => s.id === lead.status);

  function move(dir) {
    const next = PIPELINE_STAGES[stageIdx + dir];
    if (!next) return;
    updateLead(lead.id, { status: next.id });
    // Winning a lead automatically creates a scheduled job for tracking.
    if (next.id === "won") {
      addJob({
        customer: lead.name,
        city: lead.city,
        service: "Window Cleaning",
        amount: Number(lead.value) || 0,
        date: new Date().toISOString().slice(0, 10),
        status: "scheduled",
        reviewRequested: false,
      });
    }
  }

  return (
    <div className="rounded-xl border border-slate-100 bg-white p-3 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <button className="min-w-0 text-left" onClick={() => setOpen(!open)}>
          <div className="truncate text-sm font-bold text-slate-700">{lead.name}</div>
          <div className="text-xs text-slate-400">{typeLabel(lead.type)} · {lead.city}</div>
        </button>
        <ScoreBadge score={lead.score} />
      </div>

      {lead.value > 0 && <div className="mt-1 text-xs font-bold text-emerald-600">{money(lead.value)}</div>}
      {lead.followUp && (
        <div className={`mt-1 text-xs font-semibold ${lead.followUp <= new Date().toISOString().slice(0, 10) ? "text-amber-600" : "text-slate-400"}`}>
          ⏰ Follow up {lead.followUp}
        </div>
      )}

      {open && (
        <div className="mt-2 space-y-2 border-t border-slate-100 pt-2 text-xs text-slate-500">
          {lead.notes && <p>{lead.notes}</p>}
          <div className="flex flex-wrap gap-x-3 gap-y-1">
            {lead.phone && <a className="font-semibold text-harbor-600" href={`tel:${lead.phone}`}>📞 {lead.phone}</a>}
            {lead.email && <a className="font-semibold text-harbor-600" href={`mailto:${lead.email}`}>📧 Email</a>}
          </div>
          <div>
            <label className="label">Follow-up date</label>
            <input
              type="date"
              className="input"
              value={lead.followUp || ""}
              onChange={(e) => updateLead(lead.id, { followUp: e.target.value || null })}
            />
          </div>
        </div>
      )}

      <div className="mt-2 flex justify-between gap-1">
        <button className="btn-ghost px-2 py-1 text-xs" disabled={stageIdx <= 0} onClick={() => move(-1)}>←</button>
        <button className="btn-ghost px-2 py-1 text-xs" onClick={() => setOpen(!open)}>{open ? "Less" : "Details"}</button>
        <button className="btn-secondary px-2 py-1 text-xs" disabled={stageIdx >= PIPELINE_STAGES.length - 1} onClick={() => move(1)}>→</button>
      </div>
    </div>
  );
}

export default function CRM() {
  const { leads } = useStore();
  const today = new Date().toISOString().slice(0, 10);
  const followUpsDue = leads.filter((l) => l.followUp && l.followUp <= today && !["won", "lost"].includes(l.status));

  return (
    <div>
      <PageHeader title="CRM Pipeline" subtitle="Move every lead from first contact to won job — use the ← → arrows on each card." />

      {followUpsDue.length > 0 && (
        <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          ⏰ <strong>{followUpsDue.length} follow-up{followUpsDue.length > 1 ? "s" : ""} due:</strong>{" "}
          {followUpsDue.map((l) => l.name).join(", ")}
        </div>
      )}

      <div className="grid gap-4 overflow-x-auto pb-4 md:grid-cols-3 xl:grid-cols-6">
        {PIPELINE_STAGES.map((stage) => {
          const items = leads.filter((l) => l.status === stage.id).sort((a, b) => b.score - a.score);
          const value = items.reduce((s, l) => s + (Number(l.value) || 0), 0);
          return (
            <div key={stage.id} className="min-w-56 rounded-2xl bg-slate-100/70 p-3">
              <div className="mb-3 flex items-center gap-2">
                <span className={`h-2.5 w-2.5 rounded-full ${stage.color}`} />
                <span className="text-sm font-extrabold text-harbor-950">{stage.label}</span>
                <span className="ml-auto badge bg-white text-slate-500">{items.length}</span>
              </div>
              {value > 0 && <div className="mb-2 text-xs font-bold text-slate-500">{money(value)}</div>}
              <div className="space-y-2">
                {items.map((l) => <LeadCard key={l.id} lead={l} />)}
                {items.length === 0 && (
                  <div className="rounded-xl border-2 border-dashed border-slate-200 p-4 text-center text-xs text-slate-400">Empty</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
