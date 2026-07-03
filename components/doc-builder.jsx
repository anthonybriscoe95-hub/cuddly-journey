"use client";

import { useState } from "react";
import { COMPANY, SERVICES, money } from "@/lib/company";
import { useStore, saveDocument, uid } from "@/lib/store";
import { PageHeader } from "@/components/ui";

const emptyItem = () => ({ id: uid(), service: SERVICES[0].name, desc: "", qty: 1, price: SERVICES[0].basePrice });

export default function DocBuilder({ kind }) {
  const isInvoice = kind === "invoices";
  const noun = isInvoice ? "Invoice" : "Estimate";
  const { settings, leads, [kind]: saved } = useStore();

  const [customer, setCustomer] = useState({ name: "", email: "", phone: "", address: "", city: "" });
  const [items, setItems] = useState([emptyItem()]);
  const [taxRate, setTaxRate] = useState(settings.taxRate);
  const [notes, setNotes] = useState(
    isInvoice ? "Payment due within 14 days. Thank you for your business!" : "Estimate valid for 30 days. Free re-quote anytime."
  );
  const [docNo] = useState(`${isInvoice ? "INV" : "EST"}-${new Date().getFullYear()}-${uid().slice(0, 4)}`);

  const subtotal = items.reduce((s, i) => s + (Number(i.qty) || 0) * (Number(i.price) || 0), 0);
  const tax = subtotal * ((Number(taxRate) || 0) / 100);
  const total = subtotal + tax;

  const setItem = (id, patch) => setItems(items.map((i) => (i.id === id ? { ...i, ...patch } : i)));
  const setCust = (k) => (e) => setCustomer({ ...customer, [k]: e.target.value });

  function fillFromLead(id) {
    const l = leads.find((x) => x.id === id);
    if (l) setCustomer({ name: l.name, email: l.email || "", phone: l.phone || "", address: "", city: l.city || "" });
  }

  const payments = [
    settings.stripeLink && { label: "💳 Pay by card (Stripe)", href: settings.stripeLink },
    settings.squareLink && { label: "💳 Pay by card (Square)", href: settings.squareLink },
    settings.cashTag && { label: `💵 Cash App ${settings.cashTag}`, href: `https://cash.app/${settings.cashTag}` },
    settings.venmo && { label: `📱 Venmo ${settings.venmo}`, href: `https://venmo.com/${settings.venmo.replace("@", "")}` },
  ].filter(Boolean);

  return (
    <div>
      <PageHeader
        title={`${noun} Generator`}
        subtitle={`Build a professional ${noun.toLowerCase()}, then Print / Save as PDF to send it.`}
      >
        <button
          className="btn-secondary no-print"
          onClick={() => saveDocument(kind, { id: docNo, customer, items, taxRate, total, date: new Date().toISOString().slice(0, 10) })}
        >
          💾 Save
        </button>
        <button className="btn-primary no-print" onClick={() => window.print()}>
          🖨️ Print / Export PDF
        </button>
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Builder */}
        <div className="no-print space-y-4">
          <div className="card space-y-3 p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-extrabold text-harbor-950">Customer</h2>
              <select className="input w-52 text-xs" defaultValue="" onChange={(e) => fillFromLead(e.target.value)}>
                <option value="" disabled>Fill from CRM lead…</option>
                {leads.map((l) => <option key={l.id} value={l.id}>{l.name} · {l.city}</option>)}
              </select>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div><label className="label">Name</label><input className="input" value={customer.name} onChange={setCust("name")} /></div>
              <div><label className="label">Phone</label><input className="input" value={customer.phone} onChange={setCust("phone")} /></div>
              <div><label className="label">Email</label><input className="input" value={customer.email} onChange={setCust("email")} /></div>
              <div><label className="label">City</label><input className="input" value={customer.city} onChange={setCust("city")} /></div>
              <div className="sm:col-span-2"><label className="label">Address</label><input className="input" value={customer.address} onChange={setCust("address")} /></div>
            </div>
          </div>

          <div className="card space-y-3 p-5">
            <h2 className="font-extrabold text-harbor-950">Services</h2>
            {items.map((item) => (
              <div key={item.id} className="grid grid-cols-12 items-end gap-2">
                <div className="col-span-12 sm:col-span-5">
                  <label className="label">Service</label>
                  <select
                    className="input"
                    value={item.service}
                    onChange={(e) => {
                      const svc = SERVICES.find((s) => s.name === e.target.value);
                      setItem(item.id, { service: e.target.value, price: svc ? svc.basePrice : item.price });
                    }}
                  >
                    {SERVICES.map((s) => <option key={s.id}>{s.name}</option>)}
                    <option>Custom / Other</option>
                  </select>
                </div>
                <div className="col-span-4 sm:col-span-3">
                  <label className="label">Qty</label>
                  <input type="number" min="0" className="input" value={item.qty} onChange={(e) => setItem(item.id, { qty: e.target.value })} />
                </div>
                <div className="col-span-5 sm:col-span-3">
                  <label className="label">Unit $</label>
                  <input type="number" min="0" step="0.01" className="input" value={item.price} onChange={(e) => setItem(item.id, { price: e.target.value })} />
                </div>
                <button
                  className="btn-ghost col-span-3 sm:col-span-1 text-xs"
                  onClick={() => setItems(items.length > 1 ? items.filter((i) => i.id !== item.id) : items)}
                  title="Remove line"
                >
                  ✕
                </button>
              </div>
            ))}
            <button className="btn-secondary text-xs" onClick={() => setItems([...items, emptyItem()])}>➕ Add line</button>
            <div className="grid gap-3 sm:grid-cols-2">
              <div><label className="label">Tax rate (%)</label><input type="number" min="0" step="0.01" className="input" value={taxRate} onChange={(e) => setTaxRate(e.target.value)} /></div>
              <div><label className="label">Notes / terms</label><input className="input" value={notes} onChange={(e) => setNotes(e.target.value)} /></div>
            </div>
          </div>

          {saved.length > 0 && (
            <div className="card p-5 text-sm">
              <h2 className="mb-2 font-extrabold text-harbor-950">Saved {noun.toLowerCase()}s</h2>
              {saved.slice(0, 5).map((d) => (
                <div key={d.id} className="flex justify-between border-b border-slate-50 py-1.5 text-slate-500">
                  <span>{d.id} · {d.customer?.name || "—"}</span>
                  <span className="font-bold text-slate-700">{money(d.total)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Live preview / print sheet */}
        <div className="card print-sheet self-start p-8">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-harbor-500 to-harbor-800 font-black text-white">HG</div>
                <div>
                  <div className="font-extrabold text-harbor-950">{COMPANY.name}</div>
                  <div className="text-xs text-slate-400">{COMPANY.website}</div>
                </div>
              </div>
              <div className="mt-3 text-xs text-slate-500">
                {COMPANY.phone} · {COMPANY.email}
                <br />
                {COMPANY.serviceArea}
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-black uppercase tracking-wide text-harbor-600">{noun}</div>
              <div className="text-xs text-slate-500">{docNo}</div>
              <div className="text-xs text-slate-500">{new Date().toLocaleDateString()}</div>
            </div>
          </div>

          <div className="mt-6 rounded-xl bg-harbor-50 p-4 text-sm">
            <div className="text-xs font-bold uppercase tracking-wide text-harbor-400">{isInvoice ? "Bill to" : "Prepared for"}</div>
            <div className="mt-1 font-bold text-harbor-950">{customer.name || "Customer name"}</div>
            <div className="text-slate-500">
              {[customer.address, customer.city].filter(Boolean).join(", ")}
              {(customer.phone || customer.email) && <br />}
              {[customer.phone, customer.email].filter(Boolean).join(" · ")}
            </div>
          </div>

          <table className="mt-6 w-full text-sm">
            <thead>
              <tr className="border-b-2 border-harbor-100 text-left text-xs uppercase tracking-wide text-slate-400">
                <th className="py-2">Service</th>
                <th className="py-2 text-right">Qty</th>
                <th className="py-2 text-right">Unit</th>
                <th className="py-2 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {items.map((i) => (
                <tr key={i.id} className="border-b border-slate-50">
                  <td className="py-2 font-semibold text-slate-700">{i.service}</td>
                  <td className="py-2 text-right">{i.qty}</td>
                  <td className="py-2 text-right">{money(i.price)}</td>
                  <td className="py-2 text-right font-semibold">{money((Number(i.qty) || 0) * (Number(i.price) || 0))}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-4 ml-auto w-56 space-y-1 text-sm">
            <div className="flex justify-between text-slate-500"><span>Subtotal</span><span>{money(subtotal)}</span></div>
            <div className="flex justify-between text-slate-500"><span>Tax ({Number(taxRate) || 0}%)</span><span>{money(tax)}</span></div>
            <div className="flex justify-between border-t-2 border-harbor-100 pt-1 text-base font-black text-harbor-950">
              <span>Total</span><span>{money(total)}</span>
            </div>
          </div>

          {isInvoice && payments.length > 0 && (
            <div className="mt-6 rounded-xl border border-harbor-100 p-4">
              <div className="text-xs font-bold uppercase tracking-wide text-harbor-400">Ways to pay</div>
              <div className="mt-2 flex flex-wrap gap-2">
                {payments.map((p) => (
                  <a key={p.label} href={p.href} target="_blank" rel="noreferrer" className="badge bg-harbor-50 text-harbor-700 hover:bg-harbor-100">
                    {p.label}
                  </a>
                ))}
              </div>
            </div>
          )}

          <p className="mt-6 text-xs text-slate-400">{notes}</p>
          <p className="mt-2 text-center text-xs font-semibold text-harbor-300">Thank you for choosing {COMPANY.shortName}! ✨</p>
        </div>
      </div>
    </div>
  );
}
