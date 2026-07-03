"use client";

import { COMPANY, PIPELINE_STAGES, LEAD_TYPES } from "@/lib/company";

export function Logo({ size = "md", light = false }) {
  const dims = { sm: "h-8 w-8 text-base", md: "h-10 w-10 text-lg", lg: "h-14 w-14 text-2xl" }[size];
  const text = { sm: "text-base", md: "text-lg", lg: "text-2xl" }[size];
  return (
    <div className="flex items-center gap-2.5">
      <div className={`${dims} flex items-center justify-center rounded-xl bg-gradient-to-br from-harbor-500 to-harbor-800 font-black text-white shadow-sm`}>
        HG
      </div>
      <div className="leading-tight">
        <div className={`${text} font-extrabold tracking-tight ${light ? "text-white" : "text-harbor-900"}`}>
          Harbor Glass
        </div>
        <div className={`text-[10px] font-semibold uppercase tracking-[0.18em] ${light ? "text-harbor-200" : "text-harbor-500"}`}>
          Window Cleaning
        </div>
      </div>
    </div>
  );
}

export function PageHeader({ title, subtitle, children }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-harbor-950">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
      </div>
      {children && <div className="flex flex-wrap items-center gap-2">{children}</div>}
    </div>
  );
}

export function StatCard({ label, value, hint, accent = "text-harbor-700" }) {
  return (
    <div className="card p-5">
      <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</div>
      <div className={`mt-1 text-3xl font-extrabold tracking-tight ${accent}`}>{value}</div>
      {hint && <div className="mt-1 text-xs text-slate-400">{hint}</div>}
    </div>
  );
}

export function ScoreBadge({ score }) {
  const cls =
    score >= 85
      ? "bg-emerald-100 text-emerald-700"
      : score >= 75
      ? "bg-harbor-100 text-harbor-700"
      : "bg-amber-100 text-amber-700";
  return <span className={`badge ${cls}`}>{score}</span>;
}

export function StageBadge({ stage }) {
  const s = PIPELINE_STAGES.find((x) => x.id === stage);
  if (!s) return null;
  return (
    <span className="badge bg-slate-100 text-slate-600">
      <span className={`mr-1.5 h-1.5 w-1.5 rounded-full ${s.color}`} />
      {s.label}
    </span>
  );
}

export function typeLabel(type) {
  return LEAD_TYPES.find((t) => t.id === type)?.label || type;
}

export function CopyButton({ text, label = "Copy" }) {
  return (
    <button
      className="btn-secondary text-xs"
      onClick={async (e) => {
        try {
          await navigator.clipboard.writeText(text);
          const btn = e.currentTarget;
          const old = btn.textContent;
          btn.textContent = "Copied!";
          setTimeout(() => (btn.textContent = old), 1200);
        } catch {}
      }}
    >
      {label}
    </button>
  );
}

export function EmptyState({ title, hint }) {
  return (
    <div className="card flex flex-col items-center justify-center p-10 text-center">
      <div className="text-3xl">🪟</div>
      <div className="mt-2 font-bold text-slate-700">{title}</div>
      {hint && <div className="mt-1 max-w-sm text-sm text-slate-500">{hint}</div>}
    </div>
  );
}

export function Footerline() {
  return (
    <p className="mt-8 text-center text-xs text-slate-400">
      {COMPANY.name} · {COMPANY.phone} · {COMPANY.email}
    </p>
  );
}
