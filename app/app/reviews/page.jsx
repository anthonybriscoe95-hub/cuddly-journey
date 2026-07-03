"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { useStore, updateJob } from "@/lib/store";
import { money } from "@/lib/company";
import { reviewRequestSMS, reviewRequestEmail } from "@/lib/templates";
import { PageHeader, CopyButton, EmptyState } from "@/components/ui";

export default function Reviews() {
  const { jobs, settings } = useStore();
  const [selectedId, setSelectedId] = useState("");
  const [qr, setQr] = useState("");

  const completed = jobs.filter((j) => j.status === "completed");
  const job = completed.find((j) => j.id === selectedId) || completed[0];

  useEffect(() => {
    QRCode.toDataURL(settings.reviewUrl, { width: 480, margin: 2, color: { dark: "#152c55" } })
      .then(setQr)
      .catch(() => setQr(""));
  }, [settings.reviewUrl]);

  const sms = job ? reviewRequestSMS({ customer: job.customer, reviewUrl: settings.reviewUrl }) : "";
  const email = job ? reviewRequestEmail({ customer: job.customer, reviewUrl: settings.reviewUrl }) : { subject: "", body: "" };

  return (
    <div>
      <PageHeader
        title="Review Generator"
        subtitle="Turn finished jobs into 5-star Google reviews — by text, email, or QR code."
      />

      {completed.length === 0 ? (
        <EmptyState title="No completed jobs yet" hint="Mark a job completed in the CRM and it will show up here, ready for a review request." />
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="card p-5">
            <h2 className="mb-3 font-extrabold text-harbor-950">Completed jobs</h2>
            <div className="space-y-2">
              {completed.map((j) => (
                <button
                  key={j.id}
                  onClick={() => setSelectedId(j.id)}
                  className={`w-full rounded-xl border p-3 text-left text-sm transition ${
                    job?.id === j.id ? "border-harbor-400 bg-harbor-50" : "border-slate-100 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-700">{j.customer}</span>
                    {j.reviewRequested && <span className="badge bg-emerald-100 text-emerald-700">✓ Requested</span>}
                  </div>
                  <div className="text-xs text-slate-400">{j.service} · {j.city} · {j.date} · {money(j.amount)}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-6 lg:col-span-2">
            <div className="card p-5">
              <div className="mb-2 flex items-center justify-between">
                <h2 className="font-extrabold text-harbor-950">📱 Text message</h2>
                <div className="flex gap-2">
                  <CopyButton text={sms} />
                  <a className="btn-primary text-xs" href={`sms:?&body=${encodeURIComponent(sms)}`} onClick={() => job && updateJob(job.id, { reviewRequested: true })}>
                    Send Text
                  </a>
                </div>
              </div>
              <p className="rounded-xl bg-slate-50 p-3 text-sm text-slate-600">{sms}</p>
            </div>

            <div className="card p-5">
              <div className="mb-2 flex items-center justify-between">
                <h2 className="font-extrabold text-harbor-950">📧 Email</h2>
                <div className="flex gap-2">
                  <CopyButton text={`${email.subject}\n\n${email.body}`} />
                  <a
                    className="btn-primary text-xs"
                    href={`mailto:?subject=${encodeURIComponent(email.subject)}&body=${encodeURIComponent(email.body)}`}
                    onClick={() => job && updateJob(job.id, { reviewRequested: true })}
                  >
                    Send Email
                  </a>
                </div>
              </div>
              <p className="text-sm font-bold text-slate-700">{email.subject}</p>
              <p className="mt-1 whitespace-pre-wrap rounded-xl bg-slate-50 p-3 text-sm text-slate-600">{email.body}</p>
            </div>

            <div className="card flex flex-col items-center p-6 text-center sm:flex-row sm:gap-6 sm:text-left">
              {qr ? (
                <img src={qr} alt="QR code linking to the Harbor Glass Google Reviews page" className="h-40 w-40 rounded-xl border border-slate-100" />
              ) : (
                <div className="flex h-40 w-40 items-center justify-center rounded-xl bg-slate-100 text-xs text-slate-400">QR unavailable</div>
              )}
              <div className="mt-4 sm:mt-0">
                <h2 className="font-extrabold text-harbor-950">⭐ Review QR code</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Print this on invoices, door hangers, and business cards. Customers scan it and land directly on your
                  Google Reviews page.
                </p>
                <p className="mt-2 break-all text-xs text-slate-400">{settings.reviewUrl}</p>
                <div className="mt-3 flex flex-wrap justify-center gap-2 sm:justify-start">
                  {qr && <a className="btn-secondary text-xs" href={qr} download="harbor-glass-review-qr.png">⬇️ Download PNG</a>}
                  <span className="self-center text-xs text-slate-400">Set your real review link in Settings.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
