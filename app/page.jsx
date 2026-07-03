"use client";

import { useState } from "react";
import Link from "next/link";
import { COMPANY, SERVICES } from "@/lib/company";
import { chatReply } from "@/lib/templates";
import { Logo } from "@/components/ui";
import { addLead } from "@/lib/store";

const TESTIMONIALS = [
  { name: "Karen W.", city: "Newark", text: "Harbor Glass cleans every listing I put on the market. Photos pop, buyers notice, and they always work around my showing schedule. My secret weapon." },
  { name: "Sam & Holly T.", city: "Lewes", text: "Our windows and screens haven't been this clear since the house was built. On time, careful with the flower beds, and the price matched the estimate exactly." },
  { name: "Riverfront Bistro", city: "Wilmington", text: "Storefront glass sparkles every month like clockwork. Customers literally comment on it. Worth every penny." },
];

const GALLERY = [
  { label: "Colonial home — Newark", before: "Hazy, water-spotted", after: "Crystal clear" },
  { label: "Storefront — Wilmington Riverfront", before: "Street-grime film", after: "Showroom shine" },
  { label: "Beach rental — Rehoboth", before: "Salt-sprayed glass", after: "Ocean view restored" },
];

const AREAS = [
  { name: "Wilmington", x: 62, y: 12 },
  { name: "Newark", x: 38, y: 22 },
  { name: "Middletown", x: 48, y: 38 },
  { name: "Dover", x: 55, y: 58 },
  { name: "Lewes", x: 78, y: 78 },
  { name: "Rehoboth Beach", x: 84, y: 84 },
];

function BookingForm() {
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", email: "", city: "", service: SERVICES[0].name, notes: "" });
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  if (sent)
    return (
      <div className="card p-8 text-center">
        <div className="text-4xl">✅</div>
        <h3 className="mt-2 text-xl font-extrabold text-harbor-950">Request received!</h3>
        <p className="mt-2 text-sm text-slate-500">
          Thanks {form.name.split(" ")[0] || ""}! We&apos;ll reach out within one business day to confirm your free
          estimate. Need us sooner? Call{" "}
          <a className="font-semibold text-harbor-600" href={COMPANY.phoneHref}>{COMPANY.phone}</a>.
        </p>
      </div>
    );

  return (
    <form
      className="card grid gap-4 p-6 sm:grid-cols-2"
      onSubmit={(e) => {
        e.preventDefault();
        // Inbound website inquiries flow straight into the Lead Finder/CRM.
        addLead({
          name: form.name || "Website visitor",
          type: "homeowner",
          source: "Website Inquiry",
          phone: form.phone,
          email: form.email,
          city: form.city,
          website: "",
          score: 88,
          value: 0,
          notes: `Requested: ${form.service}. ${form.notes}`,
          lat: null,
          lng: null,
        });
        setSent(true);
      }}
    >
      <div>
        <label className="label">Name</label>
        <input required className="input" value={form.name} onChange={set("name")} placeholder="Jane Smith" />
      </div>
      <div>
        <label className="label">Phone</label>
        <input required className="input" value={form.phone} onChange={set("phone")} placeholder="302-555-0123" />
      </div>
      <div>
        <label className="label">Email</label>
        <input type="email" className="input" value={form.email} onChange={set("email")} placeholder="you@email.com" />
      </div>
      <div>
        <label className="label">City</label>
        <input className="input" value={form.city} onChange={set("city")} placeholder="Wilmington" />
      </div>
      <div className="sm:col-span-2">
        <label className="label">Service</label>
        <select className="input" value={form.service} onChange={set("service")}>
          {SERVICES.map((s) => (
            <option key={s.id}>{s.name}</option>
          ))}
        </select>
      </div>
      <div className="sm:col-span-2">
        <label className="label">Anything we should know?</label>
        <textarea className="input" rows={3} value={form.notes} onChange={set("notes")} placeholder="2-story home, ~20 windows, prefer weekends…" />
      </div>
      <button className="btn-primary sm:col-span-2">Request My Free Estimate</button>
      <p className="sm:col-span-2 text-center text-xs text-slate-400">No spam, no pressure — just a fast, free quote.</p>
    </form>
  );
}

function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState([
    { from: "bot", text: `Hi! 👋 I'm the Harbor Glass assistant. Ask me about pricing, scheduling, or our service area.` },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);

  async function send(e) {
    e.preventDefault();
    const text = input.trim();
    if (!text || busy) return;
    setInput("");
    setMsgs((m) => [...m, { from: "you", text }]);
    setBusy(true);
    let reply = chatReply(text);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `A website visitor asked: "${text}". Reply in 1-3 friendly sentences as Harbor Glass's chat assistant. Offer a free estimate and the phone number when relevant.`,
        }),
      });
      const data = await res.json();
      if (data.text) reply = data.text;
    } catch {}
    setMsgs((m) => [...m, { from: "bot", text: reply }]);
    setBusy(false);
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {open && (
        <div className="mb-3 flex h-96 w-80 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
          <div className="bg-harbor-700 px-4 py-3 text-sm font-bold text-white">💬 Chat with Harbor Glass</div>
          <div className="flex-1 space-y-2 overflow-y-auto p-3">
            {msgs.map((m, i) => (
              <div key={i} className={`max-w-[85%] rounded-xl px-3 py-2 text-sm ${m.from === "bot" ? "bg-slate-100 text-slate-700" : "ml-auto bg-harbor-600 text-white"}`}>
                {m.text}
              </div>
            ))}
            {busy && <div className="max-w-[85%] rounded-xl bg-slate-100 px-3 py-2 text-sm text-slate-400">Typing…</div>}
          </div>
          <form onSubmit={send} className="flex gap-2 border-t border-slate-100 p-2">
            <input className="input" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type a question…" />
            <button className="btn-primary px-3">➤</button>
          </form>
        </div>
      )}
      <button
        onClick={() => setOpen(!open)}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-harbor-600 text-2xl text-white shadow-xl transition hover:bg-harbor-700"
        aria-label="Open live chat"
      >
        {open ? "✕" : "💬"}
      </button>
    </div>
  );
}

export default function Website() {
  return (
    <div className="bg-white">
      {/* Nav */}
      <header className="sticky top-0 z-40 border-b border-slate-100 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Logo />
          <nav className="hidden items-center gap-6 text-sm font-semibold text-slate-600 md:flex">
            <a href="#services" className="hover:text-harbor-600">Services</a>
            <a href="#gallery" className="hover:text-harbor-600">Before &amp; After</a>
            <a href="#reviews" className="hover:text-harbor-600">Reviews</a>
            <a href="#area" className="hover:text-harbor-600">Service Area</a>
            <a href="#book" className="hover:text-harbor-600">Contact</a>
          </nav>
          <div className="flex items-center gap-2">
            <a href={COMPANY.phoneHref} className="btn-secondary hidden sm:inline-flex">📞 {COMPANY.phone}</a>
            <a href="#book" className="btn-primary">Free Estimate</a>
            <Link href="/login" className="btn-ghost text-xs" title="Business owner login">Owner&nbsp;Login</Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-b from-harbor-50 via-white to-white">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 md:grid-cols-2 md:py-24">
          <div>
            <span className="badge bg-harbor-100 text-harbor-700">Serving {COMPANY.serviceArea}</span>
            <h1 className="mt-4 text-4xl font-black tracking-tight text-harbor-950 md:text-5xl">
              Streak-free windows. <span className="text-harbor-600">Crystal-clear views.</span>
            </h1>
            <p className="mt-4 max-w-md text-lg text-slate-600">
              Professional residential &amp; commercial window cleaning — screens, tracks, skylights, mirrors, and
              glass doors too. Always with a <strong>free estimate</strong>.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a href="#book" className="btn-primary px-6 py-3 text-base">Book Online</a>
              <a href={COMPANY.phoneHref} className="btn-secondary px-6 py-3 text-base">Call {COMPANY.phone}</a>
            </div>
            <div className="mt-6 flex flex-wrap gap-x-6 gap-y-1 text-sm text-slate-500">
              <span>✔ Fully insured</span>
              <span>✔ Satisfaction guaranteed</span>
              <span>✔ Locally owned</span>
            </div>
          </div>
          <div className="relative">
            <div className="card overflow-hidden">
              <div className="grid h-72 grid-cols-2">
                <div className="flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-slate-300 to-slate-400 text-slate-700">
                  <span className="text-5xl">🌫️</span>
                  <span className="badge bg-white/70">Before</span>
                </div>
                <div className="flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-harbor-300 to-harbor-500 text-white">
                  <span className="text-5xl">✨</span>
                  <span className="badge bg-white/80 text-harbor-800">After</span>
                </div>
              </div>
              <div className="p-4 text-center text-sm font-semibold text-slate-600">
                The Harbor Glass difference — one visit is all it takes.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-center text-3xl font-extrabold tracking-tight text-harbor-950">Our Services</h2>
        <p className="mx-auto mt-2 max-w-xl text-center text-slate-500">
          Everything glass, inside and out. Bundle services and save.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((s) => (
            <div key={s.id} className="card p-5 transition hover:-translate-y-0.5 hover:shadow-lg">
              <div className="text-2xl">🪟</div>
              <h3 className="mt-2 font-bold text-harbor-900">{s.name}</h3>
              <p className="mt-1 text-sm text-slate-500">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Gallery */}
      <section id="gallery" className="bg-harbor-950 py-16 text-white">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-center text-3xl font-extrabold tracking-tight">Before &amp; After</h2>
          <p className="mx-auto mt-2 max-w-xl text-center text-harbor-200">Real results from around Delaware.</p>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {GALLERY.map((g) => (
              <div key={g.label} className="overflow-hidden rounded-2xl bg-white/5 ring-1 ring-white/10">
                <div className="grid h-40 grid-cols-2 text-sm font-semibold">
                  <div className="flex items-center justify-center bg-slate-600/60">{g.before}</div>
                  <div className="flex items-center justify-center bg-harbor-500/70">{g.after}</div>
                </div>
                <div className="p-4 text-sm text-harbor-100">{g.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="reviews" className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-center text-3xl font-extrabold tracking-tight text-harbor-950">What Customers Say</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <figure key={t.name} className="card p-6">
              <div className="text-amber-400">★★★★★</div>
              <blockquote className="mt-3 text-sm text-slate-600">“{t.text}”</blockquote>
              <figcaption className="mt-4 text-sm font-bold text-harbor-900">
                {t.name} <span className="font-normal text-slate-400">· {t.city}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* Service area */}
      <section id="area" className="bg-harbor-50 py-16">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 md:grid-cols-2">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight text-harbor-950">Service Area</h2>
            <p className="mt-3 text-slate-600">
              Proudly serving {COMPANY.serviceArea}. From Wilmington row homes to Rehoboth beach rentals — if it has
              glass, we&apos;ll make it shine.
            </p>
            <ul className="mt-4 grid grid-cols-2 gap-2 text-sm font-semibold text-harbor-800">
              {AREAS.map((a) => (
                <li key={a.name}>📍 {a.name}</li>
              ))}
            </ul>
          </div>
          <div className="card relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-harbor-100 to-white p-2">
            <svg viewBox="0 0 100 100" className="h-full w-full">
              <path d="M30 5 L70 5 L75 25 L88 60 L92 95 L45 95 L40 60 L28 30 Z" fill="#daefff" stroke="#5bbcfd" strokeWidth="1.5" />
              {AREAS.map((a) => (
                <g key={a.name}>
                  <circle cx={a.x} cy={a.y} r="2.4" fill="#1f7def" />
                  <text x={a.x + 4} y={a.y + 1.5} fontSize="4.2" fill="#152c55" fontWeight="700">{a.name}</text>
                </g>
              ))}
            </svg>
          </div>
        </div>
      </section>

      {/* Booking / contact */}
      <section id="book" className="mx-auto max-w-3xl px-4 py-16">
        <h2 className="text-center text-3xl font-extrabold tracking-tight text-harbor-950">Book Online — Free Estimate</h2>
        <p className="mx-auto mt-2 max-w-lg text-center text-slate-500">
          Tell us a little about your home or business and we&apos;ll follow up within one business day.
        </p>
        <div className="mt-8">
          <BookingForm />
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 md:flex-row">
          <Logo size="sm" />
          <div className="text-center text-sm text-slate-500 md:text-right">
            <div>
              <a className="font-semibold text-harbor-600" href={COMPANY.phoneHref}>{COMPANY.phone}</a> ·{" "}
              <a className="font-semibold text-harbor-600" href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>
            </div>
            <div className="mt-1 text-xs text-slate-400">
              © {new Date().getFullYear()} {COMPANY.name} · {COMPANY.website}
            </div>
          </div>
        </div>
      </footer>

      <ChatWidget />
    </div>
  );
}
