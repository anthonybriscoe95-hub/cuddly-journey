"use client";

import { useState } from "react";
import { COMPANY, SERVICES } from "@/lib/company";
import { socialPost } from "@/lib/templates";
import { PageHeader, CopyButton } from "@/components/ui";

const PLATFORMS = [
  { id: "facebook", label: "Facebook" },
  { id: "instagram", label: "Instagram" },
  { id: "gbp", label: "Google Business Profile" },
];
const TOPICS = [
  { id: "general", label: "General promo" },
  { id: "beforeafter", label: "Before / After" },
  { id: "promo", label: "Special offer" },
];
const DESIGNS = [
  { id: "flyer", label: "🖼️ Flyer" },
  { id: "hanger", label: "🚪 Door Hanger" },
  { id: "card", label: "💼 Business Card" },
  { id: "beforeafter", label: "📸 Before/After Template" },
];

function Flyer() {
  return (
    <div className="print-sheet mx-auto w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card">
      <div className="bg-gradient-to-br from-harbor-600 to-harbor-900 p-8 text-center text-white">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 text-xl font-black">HG</div>
        <h2 className="mt-3 text-3xl font-black leading-tight">Streak-Free<br />Windows</h2>
        <p className="mt-2 text-harbor-100">See your neighborhood clearly again.</p>
      </div>
      <div className="p-6">
        <ul className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm font-semibold text-slate-600">
          {SERVICES.map((s) => <li key={s.id}>✔ {s.name.replace(" Cleaning", "")}</li>)}
        </ul>
        <div className="mt-5 rounded-xl bg-harbor-50 p-4 text-center">
          <div className="text-xs font-bold uppercase tracking-wide text-harbor-400">Free Estimates</div>
          <div className="mt-1 text-2xl font-black text-harbor-800">{COMPANY.phone}</div>
          <div className="text-sm font-semibold text-harbor-500">{COMPANY.website}</div>
        </div>
        <p className="mt-3 text-center text-xs text-slate-400">Locally owned · Fully insured · Satisfaction guaranteed</p>
      </div>
    </div>
  );
}

function DoorHanger() {
  return (
    <div className="print-sheet mx-auto w-64 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card">
      <div className="relative bg-harbor-800 pb-6 pt-4 text-center text-white">
        <div className="mx-auto h-10 w-10 rounded-full border-4 border-white/30" title="door knob hole" />
        <h3 className="mt-3 px-4 text-xl font-black leading-tight">We were in your neighborhood!</h3>
      </div>
      <div className="p-5 text-center">
        <p className="text-sm text-slate-600">
          Your neighbors just got <strong>streak-free windows</strong> from {COMPANY.shortName}. Want yours to match?
        </p>
        <div className="mt-4 rounded-xl bg-harbor-50 p-3">
          <div className="text-[10px] font-bold uppercase tracking-wide text-harbor-400">Free estimate — call or text</div>
          <div className="text-xl font-black text-harbor-800">{COMPANY.phone}</div>
        </div>
        <p className="mt-3 text-xs font-semibold text-harbor-500">{COMPANY.website}</p>
        <p className="mt-2 text-[10px] text-slate-400">Mention this hanger for 10% off your first clean!</p>
      </div>
    </div>
  );
}

function BusinessCard() {
  return (
    <div className="mx-auto space-y-4">
      <div className="print-sheet flex h-48 w-80 flex-col justify-between rounded-xl bg-gradient-to-br from-harbor-600 to-harbor-950 p-5 text-white shadow-card">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/15 font-black">HG</div>
        <div>
          <div className="text-lg font-black">{COMPANY.name}</div>
          <div className="text-xs text-harbor-200">{COMPANY.tagline}</div>
        </div>
      </div>
      <div className="print-sheet flex h-48 w-80 flex-col justify-center gap-1.5 rounded-xl border border-slate-200 bg-white p-5 text-sm shadow-card">
        <div className="font-black text-harbor-900">Let&apos;s make your glass shine.</div>
        <div className="text-slate-600">📞 {COMPANY.phone}</div>
        <div className="text-slate-600">📧 {COMPANY.email}</div>
        <div className="text-slate-600">🌐 {COMPANY.website}</div>
        <div className="mt-2 text-xs text-slate-400">Residential · Commercial · Free estimates</div>
      </div>
    </div>
  );
}

function BeforeAfter() {
  return (
    <div className="print-sheet mx-auto w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card">
      <div className="grid grid-cols-2">
        <div className="flex h-56 flex-col items-center justify-center gap-2 bg-gradient-to-br from-slate-300 to-slate-500 text-white">
          <span className="text-4xl">🌫️</span>
          <span className="badge bg-black/30 text-white">BEFORE</span>
          <span className="px-4 text-center text-[10px] text-white/70">(drop your before photo here)</span>
        </div>
        <div className="flex h-56 flex-col items-center justify-center gap-2 bg-gradient-to-br from-harbor-300 to-harbor-600 text-white">
          <span className="text-4xl">✨</span>
          <span className="badge bg-white/80 text-harbor-800">AFTER</span>
          <span className="px-4 text-center text-[10px] text-white/80">(drop your after photo here)</span>
        </div>
      </div>
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-harbor-700 text-xs font-black text-white">HG</div>
          <div className="text-sm font-black text-harbor-900">{COMPANY.shortName}</div>
        </div>
        <div className="text-right text-xs font-bold text-harbor-600">
          {COMPANY.phone}<br />{COMPANY.website}
        </div>
      </div>
    </div>
  );
}

export default function Marketing() {
  const [tab, setTab] = useState("posts");
  const [platform, setPlatform] = useState("facebook");
  const [topic, setTopic] = useState("general");
  const [city, setCity] = useState("Wilmington");
  const [post, setPost] = useState("");
  const [busy, setBusy] = useState(false);
  const [design, setDesign] = useState("flyer");

  async function generate() {
    setBusy(true);
    let text = socialPost({ platform, topic, city });
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `Write a ${TOPICS.find((t) => t.id === topic).label} social post for ${PLATFORMS.find((p) => p.id === platform).label} for Harbor Glass Window Cleaning targeting ${city}. Include a call to action with phone 302-494-9680. ${platform === "instagram" ? "Include 8-10 hashtags." : ""} Keep platform conventions.`,
        }),
      });
      const data = await res.json();
      if (data.text) text = data.text;
    } catch {}
    setPost(text);
    setBusy(false);
  }

  return (
    <div>
      <PageHeader title="Marketing Studio" subtitle="Ready-to-post social content and print-ready designs, all on brand." />

      <div className="no-print mb-6 flex gap-2">
        <button className={`btn ${tab === "posts" ? "bg-harbor-600 text-white" : "btn-secondary"}`} onClick={() => setTab("posts")}>📣 Social Posts</button>
        <button className={`btn ${tab === "designs" ? "bg-harbor-600 text-white" : "btn-secondary"}`} onClick={() => setTab("designs")}>🎨 Print Designs</button>
      </div>

      {tab === "posts" && (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="card space-y-4 p-6">
            <div>
              <label className="label">Platform</label>
              <div className="flex flex-wrap gap-2">
                {PLATFORMS.map((p) => (
                  <button key={p.id} className={`btn text-xs ${platform === p.id ? "bg-harbor-600 text-white" : "btn-secondary"}`} onClick={() => setPlatform(p.id)}>{p.label}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="label">Post type</label>
              <div className="flex flex-wrap gap-2">
                {TOPICS.map((t) => (
                  <button key={t.id} className={`btn text-xs ${topic === t.id ? "bg-harbor-600 text-white" : "btn-secondary"}`} onClick={() => setTopic(t.id)}>{t.label}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="label">City / area to target</label>
              <input className="input" value={city} onChange={(e) => setCity(e.target.value)} />
            </div>
            <button className="btn-primary w-full py-2.5" onClick={generate} disabled={busy}>
              {busy ? "Writing…" : "✨ Generate Post"}
            </button>
          </div>
          <div className="card flex flex-col p-6">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-extrabold text-harbor-950">Your post</h2>
              {post && <CopyButton text={post} />}
            </div>
            {post ? (
              <textarea className="input flex-1 text-[13px] leading-relaxed" rows={12} value={post} onChange={(e) => setPost(e.target.value)} />
            ) : (
              <div className="flex flex-1 items-center justify-center rounded-xl border-2 border-dashed border-slate-200 p-8 text-center text-sm text-slate-400">
                Pick a platform and generate — then copy straight into Facebook, Instagram, or your Google Business Profile.
              </div>
            )}
          </div>
        </div>
      )}

      {tab === "designs" && (
        <div>
          <div className="no-print mb-6 flex flex-wrap gap-2">
            {DESIGNS.map((d) => (
              <button key={d.id} className={`btn text-xs ${design === d.id ? "bg-harbor-600 text-white" : "btn-secondary"}`} onClick={() => setDesign(d.id)}>{d.label}</button>
            ))}
            <button className="btn-primary ml-auto text-xs" onClick={() => window.print()}>🖨️ Print / Save PDF</button>
          </div>
          <div className="py-4">
            {design === "flyer" && <Flyer />}
            {design === "hanger" && <DoorHanger />}
            {design === "card" && <BusinessCard />}
            {design === "beforeafter" && <BeforeAfter />}
          </div>
          <p className="no-print mt-4 text-center text-xs text-slate-400">
            Print on cardstock for flyers and hangers. Business cards: print both sides at 3.5×2&quot;.
          </p>
        </div>
      )}
    </div>
  );
}
