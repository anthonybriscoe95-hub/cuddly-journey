"use client";

import { useState } from "react";
import { COMPANY } from "@/lib/company";
import { useStore, updateSettings, resetDemoData } from "@/lib/store";
import { PageHeader } from "@/components/ui";

export default function Settings() {
  const { settings } = useStore();
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState(settings);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  return (
    <div className="max-w-2xl">
      <PageHeader title="Settings" subtitle="Payment links, review link, and defaults used across estimates, invoices, and review requests." />

      <form
        className="card space-y-4 p-6"
        onSubmit={(e) => {
          e.preventDefault();
          updateSettings({ ...form, taxRate: Number(form.taxRate) || 0 });
          setSaved(true);
          setTimeout(() => setSaved(false), 1500);
        }}
      >
        <div>
          <label className="label">Google review link (shown in review requests &amp; QR code)</label>
          <input className="input" value={form.reviewUrl} onChange={set("reviewUrl")} placeholder="https://g.page/r/…/review" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Stripe payment link</label>
            <input className="input" value={form.stripeLink} onChange={set("stripeLink")} placeholder="https://buy.stripe.com/…" />
          </div>
          <div>
            <label className="label">Square payment link</label>
            <input className="input" value={form.squareLink} onChange={set("squareLink")} placeholder="https://square.link/…" />
          </div>
          <div>
            <label className="label">Cash App $cashtag</label>
            <input className="input" value={form.cashTag} onChange={set("cashTag")} placeholder="$HarborGlassDE" />
          </div>
          <div>
            <label className="label">Venmo handle</label>
            <input className="input" value={form.venmo} onChange={set("venmo")} placeholder="@HarborGlass-Cleaning" />
          </div>
        </div>
        <div>
          <label className="label">Default tax rate (%) — Delaware has no state sales tax</label>
          <input className="input" type="number" step="0.01" min="0" value={form.taxRate} onChange={set("taxRate")} />
        </div>
        <button className="btn-primary">{saved ? "✓ Saved!" : "Save Settings"}</button>
      </form>

      <div className="card mt-6 p-6">
        <h2 className="font-extrabold text-harbor-950">Business profile</h2>
        <dl className="mt-3 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
          <div><dt className="label">Business</dt><dd className="font-semibold text-slate-700">{COMPANY.name}</dd></div>
          <div><dt className="label">Phone</dt><dd className="font-semibold text-slate-700">{COMPANY.phone}</dd></div>
          <div><dt className="label">Email</dt><dd className="font-semibold text-slate-700">{COMPANY.email}</dd></div>
          <div><dt className="label">Website</dt><dd className="font-semibold text-slate-700">{COMPANY.website}</dd></div>
        </dl>
        <p className="mt-3 text-xs text-slate-400">To change these, edit <code>lib/company.js</code>.</p>
      </div>

      <div className="card mt-6 border-red-100 p-6">
        <h2 className="font-extrabold text-red-600">Danger zone</h2>
        <p className="mt-1 text-sm text-slate-500">Restore the original sample leads and jobs. Your added data will be erased.</p>
        <button
          className="btn mt-3 bg-red-50 text-red-600 hover:bg-red-100"
          onClick={() => {
            if (window.confirm("Reset all app data back to the demo dataset?")) resetDemoData();
          }}
        >
          Reset demo data
        </button>
      </div>
    </div>
  );
}
