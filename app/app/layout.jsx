"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { getSession, signOut } from "@/lib/store";
import { Logo } from "@/components/ui";

const NAV = [
  { href: "/app", label: "Dashboard", icon: "📊" },
  { href: "/app/leads", label: "Lead Finder", icon: "🔎" },
  { href: "/app/assistant", label: "AI Assistant", icon: "🤖" },
  { href: "/app/routes", label: "Route Planner", icon: "🗺️" },
  { href: "/app/crm", label: "CRM Pipeline", icon: "📋" },
  { href: "/app/estimates", label: "Estimates", icon: "🧾" },
  { href: "/app/invoices", label: "Invoices", icon: "💳" },
  { href: "/app/marketing", label: "Marketing", icon: "📣" },
  { href: "/app/reviews", label: "Reviews", icon: "⭐" },
  { href: "/app/coach", label: "AI Coach", icon: "🧠" },
  { href: "/app/settings", label: "Settings", icon: "⚙️" },
];

export default function AppLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [session, setSession] = useState(undefined);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const s = getSession();
    if (!s) router.replace("/login");
    else setSession(s);
  }, [router]);

  useEffect(() => setMenuOpen(false), [pathname]);

  if (session === undefined) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-slate-400">
        Loading Harbor Glass…
      </div>
    );
  }

  const nav = (
    <nav className="space-y-1">
      {NAV.map((n) => {
        const active = pathname === n.href;
        return (
          <Link
            key={n.href}
            href={n.href}
            className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold transition ${
              active ? "bg-harbor-600 text-white shadow-sm" : "text-harbor-100 hover:bg-white/10"
            }`}
          >
            <span>{n.icon}</span> {n.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen md:flex">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col bg-harbor-950 p-4 md:flex">
        <div className="mb-6 px-1">
          <Logo light />
        </div>
        {nav}
        <div className="mt-auto space-y-2 pt-6">
          <Link href="/" className="block rounded-xl px-3 py-2 text-sm font-semibold text-harbor-200 hover:bg-white/10">
            🌐 View Public Website
          </Link>
          <button
            onClick={() => {
              signOut();
              router.replace("/login");
            }}
            className="block w-full rounded-xl px-3 py-2 text-left text-sm font-semibold text-harbor-200 hover:bg-white/10"
          >
            🚪 Sign Out ({session.name})
          </button>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="sticky top-0 z-40 flex items-center justify-between border-b border-slate-100 bg-harbor-950 px-4 py-3 md:hidden">
        <Logo size="sm" light />
        <button onClick={() => setMenuOpen(!menuOpen)} className="rounded-lg bg-white/10 px-3 py-1.5 text-sm font-bold text-white">
          {menuOpen ? "✕ Close" : "☰ Menu"}
        </button>
      </div>
      {menuOpen && (
        <div className="fixed inset-x-0 top-14 z-40 border-b border-harbor-900 bg-harbor-950 p-4 md:hidden">
          {nav}
          <button
            onClick={() => {
              signOut();
              router.replace("/login");
            }}
            className="mt-3 block w-full rounded-xl px-3 py-2 text-left text-sm font-semibold text-harbor-200 hover:bg-white/10"
          >
            🚪 Sign Out
          </button>
        </div>
      )}

      <main className="min-w-0 flex-1 p-4 md:p-8">{children}</main>
    </div>
  );
}
