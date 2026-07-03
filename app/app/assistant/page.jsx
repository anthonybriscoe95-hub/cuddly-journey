"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { LEAD_TYPES } from "@/lib/company";
import { outreachMessage } from "@/lib/templates";
import { PageHeader, CopyButton, typeLabel } from "@/components/ui";

const TONES = [
  { id: "friendly", label: "Friendly" },
  { id: "professional", label: "Professional" },
  { id: "short", label: "Short & punchy" },
];

export default function Assistant() {
  const { leads } = useStore();
  const [audience, setAudience] = useState("homeowner");
  const [tone, setTone] = useState("friendly");
  const [leadId, setLeadId] = useState("");
  const [custom, setCustom] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [aiUsed, setAiUsed] = useState(false);

  const lead = leads.find((l) => l.id === leadId);

  async function generate() {
    setBusy(true);
    setAiUsed(false);
    const fallback = outreachMessage({
      audience,
      tone,
      name: lead?.name,
      city: lead?.city,
      business: lead?.type !== "homeowner" ? lead?.name : "",
    });
    let text = fallback;
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `Write a ${tone} cold outreach message (80-120 words) from Harbor Glass Window Cleaning to a ${typeLabel(audience)}${lead ? ` named ${lead.name} in ${lead.city}` : ""}. Mention streak-free window cleaning and free estimates. ${lead?.notes ? `Context: ${lead.notes}.` : ""} ${custom ? `Extra instructions: ${custom}` : ""} End with the signature: Harbor Glass Window Cleaning, 302-494-9680, harborglasswindowcleaning.com`,
        }),
      });
      const data = await res.json();
      if (data.text) {
        text = data.text;
        setAiUsed(true);
      }
    } catch {}
    setMessage(text);
    setBusy(false);
  }

  return (
    <div>
      <PageHeader
        title="AI Assistant"
        subtitle="Personalized outreach messages for every kind of customer — ready to copy into email, text, or DM."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card space-y-4 p-6">
          <div>
            <label className="label">Who are you writing to?</label>
            <div className="flex flex-wrap gap-2">
              {LEAD_TYPES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setAudience(t.id)}
                  className={`btn text-xs ${audience === t.id ? "bg-harbor-600 text-white" : "btn-secondary"}`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="label">Tone</label>
            <div className="flex flex-wrap gap-2">
              {TONES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTone(t.id)}
                  className={`btn text-xs ${tone === t.id ? "bg-harbor-600 text-white" : "btn-secondary"}`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="label">Personalize for a lead (optional)</label>
            <select className="input" value={leadId} onChange={(e) => setLeadId(e.target.value)}>
              <option value="">— No specific lead —</option>
              {leads.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name} · {l.city} ({typeLabel(l.type)})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Extra instructions (optional)</label>
            <input
              className="input"
              value={custom}
              onChange={(e) => setCustom(e.target.value)}
              placeholder="e.g. mention we're already servicing their street next Tuesday"
            />
          </div>

          <button onClick={generate} disabled={busy} className="btn-primary w-full py-2.5">
            {busy ? "Writing…" : "✍️ Write My Message"}
          </button>
          <p className="text-center text-xs text-slate-400">
            Uses OpenAI when configured; otherwise Harbor Glass&apos;s built-in proven templates.
          </p>
        </div>

        <div className="card flex flex-col p-6">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-extrabold text-harbor-950">Your message</h2>
            {message && (
              <div className="flex items-center gap-2">
                {aiUsed && <span className="badge bg-violet-100 text-violet-700">AI-written</span>}
                <CopyButton text={message} />
              </div>
            )}
          </div>
          {message ? (
            <textarea
              className="input flex-1 whitespace-pre-wrap font-mono text-[13px] leading-relaxed"
              rows={14}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 p-8 text-center text-sm text-slate-400">
              <span className="text-3xl">🤖</span>
              <p className="mt-2">Pick an audience and hit “Write My Message.”<br />Edit the result right here before sending.</p>
            </div>
          )}
          {message && lead?.email && (
            <a
              className="btn-secondary mt-3"
              href={`mailto:${lead.email}?subject=${encodeURIComponent("Streak-free windows — free estimate")}&body=${encodeURIComponent(message)}`}
            >
              📧 Open in email to {lead.name}
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
