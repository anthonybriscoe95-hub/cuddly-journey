"use client";

import { useMemo, useState } from "react";
import { useStore, addLead, updateLead } from "@/lib/store";
import { LEAD_SOURCES, LEAD_TYPES } from "@/lib/company";
import { PageHeader, ScoreBadge, StageBadge, typeLabel } from "@/components/ui";

const SEARCH_IDEAS = [
  "property management companies",
  "real estate agents",
  "restaurants",
  "hotels",
  "boutiques",
  "dental offices",
  "gyms",
];

function QuickAdd({ onClose }) {
  const [form, setForm] = useState({ name: "", type: "homeowner", source: "Facebook Group (manual)", phone: "", email: "", website: "", city: "", notes: "", score: 75, value: "" });
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  return (
    <form
      className="card mb-6 grid gap-3 p-5 sm:grid-cols-3"
      onSubmit={(e) => {
        e.preventDefault();
        addLead({ ...form, score: Number(form.score) || 70, value: Number(form.value) || 0, lat: null, lng: null });
        onClose();
      }}
    >
      <div className="sm:col-span-3 flex items-center justify-between">
        <h3 className="font-extrabold text-harbor-950">Log a lead you found</h3>
        <button type="button" onClick={onClose} className="btn-ghost text-xs">✕ Cancel</button>
      </div>
      <div><label className="label">Name</label><input required className="input" value={form.name} onChange={set("name")} /></div>
      <div>
        <label className="label">Type</label>
        <select className="input" value={form.type} onChange={set("type")}>
          {LEAD_TYPES.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
        </select>
      </div>
      <div>
        <label className="label">Source</label>
        <select className="input" value={form.source} onChange={set("source")}>
          {LEAD_SOURCES.map((s) => <option key={s}>{s}</option>)}
        </select>
      </div>
      <div><label className="label">Phone</label><input className="input" value={form.phone} onChange={set("phone")} /></div>
      <div><label className="label">Email</label><input className="input" value={form.email} onChange={set("email")} /></div>
      <div><label className="label">City</label><input className="input" value={form.city} onChange={set("city")} /></div>
      <div><label className="label">Website</label><input className="input" value={form.website} onChange={set("website")} /></div>
      <div><label className="label">Est. Value ($)</label><input className="input" type="number" value={form.value} onChange={set("value")} /></div>
      <div><label className="label">Opportunity Score (0–100)</label><input className="input" type="number" min="0" max="100" value={form.score} onChange={set("score")} /></div>
      <div className="sm:col-span-3"><label className="label">Notes</label><input className="input" value={form.notes} onChange={set("notes")} placeholder="Where you found them, what they asked for…" /></div>
      <button className="btn-primary sm:col-span-3">➕ Add to Lead Finder &amp; CRM</button>
    </form>
  );
}

export default function LeadFinder() {
  const { leads } = useStore();
  const [query, setQuery] = useState("");
  const [city, setCity] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [showAdd, setShowAdd] = useState(false);
  const [searching, setSearching] = useState(false);
  const [liveResults, setLiveResults] = useState(null);
  const [notice, setNotice] = useState("");

  const filtered = useMemo(() => {
    return leads
      .filter((l) => (typeFilter === "all" ? true : l.type === typeFilter))
      .filter((l) => (sourceFilter === "all" ? true : l.source === sourceFilter))
      .filter((l) =>
        query
          ? [l.name, l.city, l.notes, l.website].join(" ").toLowerCase().includes(query.toLowerCase())
          : true
      )
      .sort((a, b) => b.score - a.score);
  }, [leads, typeFilter, sourceFilter, query]);

  async function runSearch(e) {
    e.preventDefault();
    if (!query.trim()) return;
    setSearching(true);
    setNotice("");
    try {
      const res = await fetch("/api/leads/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, city }),
      });
      const data = await res.json();
      if (data.fallback) {
        setLiveResults(null);
        setNotice(
          "Live Google Maps search needs a GOOGLE_MAPS_API_KEY in .env.local — showing your saved & sample leads below. Tip: use Quick Add to log leads you find on Facebook groups, Nextdoor, or Reddit."
        );
      } else {
        setLiveResults(data.results);
        setNotice(data.results.length ? "" : "No businesses found for that search — try a broader term.");
      }
    } catch {
      setNotice("Search failed — check your connection and try again.");
    }
    setSearching(false);
  }

  return (
    <div>
      <PageHeader title="Lead Finder" subtitle="Find businesses on Google Maps and log leads you spot in local groups — all in one place.">
        <button className="btn-primary" onClick={() => setShowAdd(!showAdd)}>➕ Quick Add Lead</button>
      </PageHeader>

      {showAdd && <QuickAdd onClose={() => setShowAdd(false)} />}

      <form onSubmit={runSearch} className="card mb-4 flex flex-wrap items-end gap-3 p-4">
        <div className="min-w-48 flex-1">
          <label className="label">Search businesses (Google Maps) or filter your leads</label>
          <input className="input" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="e.g. property management companies" />
        </div>
        <div className="w-40">
          <label className="label">City</label>
          <input className="input" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Wilmington, DE" />
        </div>
        <button className="btn-primary" disabled={searching}>{searching ? "Searching…" : "🔎 Search"}</button>
      </form>

      <div className="mb-4 flex flex-wrap items-center gap-2 text-xs">
        <span className="text-slate-400">Try:</span>
        {SEARCH_IDEAS.map((s) => (
          <button key={s} className="badge bg-harbor-50 text-harbor-700 hover:bg-harbor-100" onClick={() => setQuery(s)}>
            {s}
          </button>
        ))}
      </div>

      {notice && <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">{notice}</div>}

      {liveResults && (
        <div className="card mb-6 p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-extrabold text-harbor-950">Google Maps results ({liveResults.length})</h2>
            <button className="btn-ghost text-xs" onClick={() => setLiveResults(null)}>✕ Clear</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-xs uppercase tracking-wide text-slate-400">
                  <th className="py-2 pr-3">Name</th><th className="py-2 pr-3">Website</th><th className="py-2 pr-3">Phone</th>
                  <th className="py-2 pr-3">City</th><th className="py-2 pr-3">Score</th><th className="py-2"></th>
                </tr>
              </thead>
              <tbody>
                {liveResults.map((r, i) => (
                  <tr key={i} className="border-b border-slate-50">
                    <td className="py-2.5 pr-3 font-semibold text-slate-700">{r.name}</td>
                    <td className="py-2.5 pr-3 text-harbor-600">{r.website}</td>
                    <td className="py-2.5 pr-3">{r.phone}</td>
                    <td className="py-2.5 pr-3">{r.city}</td>
                    <td className="py-2.5 pr-3"><ScoreBadge score={r.score} /></td>
                    <td className="py-2.5 text-right">
                      <button className="btn-secondary text-xs" onClick={() => addLead({ ...r, value: 0, notes: r.address || "" })}>
                        ➕ Save
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="mb-3 flex flex-wrap gap-2">
        <select className="input w-auto" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
          <option value="all">All types</option>
          {LEAD_TYPES.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
        </select>
        <select className="input w-auto" value={sourceFilter} onChange={(e) => setSourceFilter(e.target.value)}>
          <option value="all">All sources</option>
          {LEAD_SOURCES.map((s) => <option key={s}>{s}</option>)}
        </select>
        <span className="ml-auto self-center text-sm text-slate-400">{filtered.length} leads</span>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full min-w-[860px] text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-left text-xs uppercase tracking-wide text-slate-400">
              <th className="p-3">Name</th><th className="p-3">Type</th><th className="p-3">Website</th>
              <th className="p-3">Phone</th><th className="p-3">Email</th><th className="p-3">City</th>
              <th className="p-3">Source</th><th className="p-3">Stage</th><th className="p-3">Score</th><th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((l) => (
              <tr key={l.id} className="border-b border-slate-50 hover:bg-harbor-50/40">
                <td className="p-3">
                  <div className="font-semibold text-slate-700">{l.name}</div>
                  {l.notes && <div className="max-w-52 truncate text-xs text-slate-400" title={l.notes}>{l.notes}</div>}
                </td>
                <td className="p-3 text-slate-500">{typeLabel(l.type)}</td>
                <td className="p-3 text-harbor-600">{l.website || "—"}</td>
                <td className="p-3">{l.phone || "—"}</td>
                <td className="p-3">{l.email || "—"}</td>
                <td className="p-3">{l.city}</td>
                <td className="p-3 text-slate-500">{l.source}</td>
                <td className="p-3"><StageBadge stage={l.status} /></td>
                <td className="p-3"><ScoreBadge score={l.score} /></td>
                <td className="p-3 text-right">
                  <button
                    className={`btn text-xs ${l.saved ? "bg-emerald-50 text-emerald-700" : "btn-secondary"}`}
                    onClick={() => updateLead(l.id, { saved: !l.saved })}
                    title={l.saved ? "Saved for route planning" : "Save for route planning"}
                  >
                    {l.saved ? "★ Saved" : "☆ Save"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-xs text-slate-400">
        Sources like Facebook groups, Nextdoor, and Reddit are logged manually — spot the request while you browse, then
        Quick Add it here. The app never scrapes those platforms, keeping your accounts safe and compliant.
      </p>
    </div>
  );
}
