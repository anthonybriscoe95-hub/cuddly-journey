import Icon from "./Icon.jsx";
import { useStore } from "../state/store.jsx";

const TITLES = {
  dashboard: { title: "Dashboard", sub: "Your AI-powered HQ. Make today count." },
  skills: { title: "Skills", sub: "Run a skill — fill the form, get a clean output." },
  leads: { title: "Leads", sub: "Local prospects, statuses, and follow-ups." },
  clients: { title: "Clients", sub: "Active engagements and deliverables." },
  vault: { title: "Vault", sub: "Persistent memory: notes, outputs, playbooks." },
  outreach: { title: "Outreach Generator", sub: "Cold outreach in seconds." },
  command: { title: "Daily Command Center", sub: "What you do today moves the line." },
  settings: { title: "Settings", sub: "Brand, services, and pricing." },
};

export default function Topbar({ active, onMenu, onQuick }) {
  const { state } = useStore();
  const meta = TITLES[active] || { title: "Briscoe", sub: "" };

  return (
    <header className="sticky top-0 z-30 border-b border-ink-800 bg-ink-950/80 backdrop-blur-md">
      <div className="flex items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <button
          onClick={onMenu}
          className="grid h-10 w-10 place-items-center rounded-lg border border-ink-700 bg-ink-850 text-zinc-300 lg:hidden"
          aria-label="Open menu"
        >
          <Icon name="menu" className="h-5 w-5" />
        </button>

        <div className="min-w-0 flex-1">
          <h1 className="truncate text-xl font-extrabold tracking-tight text-white sm:text-2xl">
            {meta.title}
          </h1>
          <p className="hidden truncate text-xs text-zinc-500 sm:block">
            {meta.sub}
          </p>
        </div>

        <div className="hidden items-center gap-2 md:flex">
          <div className="flex items-center gap-2 rounded-lg border border-ink-700 bg-ink-850 px-3 py-1.5 text-sm text-zinc-400">
            <Icon name="search" className="h-4 w-4" />
            <input
              className="w-44 border-0 bg-transparent p-0 text-sm focus:ring-0 focus:shadow-none placeholder:text-zinc-500"
              placeholder="Search…"
              style={{ outline: "none" }}
            />
            <span className="rounded-md border border-ink-700 px-1.5 py-0.5 text-[10px] font-mono text-zinc-500">
              ⌘K
            </span>
          </div>
        </div>

        <button
          onClick={onQuick}
          className="btn-primary ml-auto md:ml-0"
        >
          <Icon name="sparkles" className="h-4 w-4" />
          <span className="hidden sm:inline">Quick action</span>
        </button>

        <div className="hidden items-center gap-2 rounded-lg border border-ink-700 bg-ink-850 px-2.5 py-1.5 sm:flex">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-medium text-zinc-300">
            {state.settings.businessName}
          </span>
        </div>
      </div>
    </header>
  );
}
