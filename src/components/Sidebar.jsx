import { cls } from "../lib/utils.js";
import Icon from "./Icon.jsx";
import { useStore } from "../state/store.jsx";

export const NAV = [
  { id: "dashboard", label: "Dashboard", icon: "dashboard" },
  { id: "skills", label: "Skills", icon: "bolt" },
  { id: "leads", label: "Leads", icon: "users" },
  { id: "clients", label: "Clients", icon: "briefcase" },
  { id: "vault", label: "Vault", icon: "vault" },
  { id: "outreach", label: "Outreach", icon: "send" },
  { id: "command", label: "Command Center", icon: "command" },
  { id: "settings", label: "Settings", icon: "settings" },
];

export default function Sidebar({ active, onChange, mobileOpen, onCloseMobile }) {
  const { state } = useStore();
  return (
    <>
      {/* Mobile backdrop */}
      <div
        className={cls(
          "fixed inset-0 z-40 bg-black/70 backdrop-blur-sm transition-opacity duration-200 lg:hidden",
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={onCloseMobile}
      />
      <aside
        className={cls(
          "fixed inset-y-0 left-0 z-50 w-72 transform border-r border-ink-800 bg-ink-950/95 backdrop-blur-md transition-transform duration-200 lg:static lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center gap-3 border-b border-ink-800 p-5">
            <div className="relative grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-flame-500 to-flame-700 text-black shadow-glow">
              <Icon name="flame" className="h-5 w-5" strokeWidth={2.2} />
              <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-ink-950 bg-emerald-400" />
            </div>
            <div className="min-w-0">
              <div className="truncate text-sm font-bold tracking-tight text-white">
                Briscoe AI
              </div>
              <div className="truncate text-[11px] uppercase tracking-[0.18em] text-zinc-500">
                Command OS
              </div>
            </div>
          </div>

          <nav className="flex-1 space-y-1 overflow-y-auto p-3">
            {NAV.map((item) => {
              const isActive = active === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onChange(item.id);
                    onCloseMobile?.();
                  }}
                  className={cls(
                    "group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150",
                    isActive
                      ? "bg-flame-500/10 text-flame-400 ring-1 ring-flame-500/30"
                      : "text-zinc-400 hover:bg-ink-800 hover:text-white"
                  )}
                >
                  {isActive && (
                    <span className="absolute left-0 top-1/2 h-6 -translate-y-1/2 w-0.5 rounded-r-full bg-flame-500" />
                  )}
                  <Icon
                    name={item.icon}
                    className={cls(
                      "h-[18px] w-[18px] transition-transform",
                      isActive && "scale-110"
                    )}
                  />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="border-t border-ink-800 p-4">
            <div className="surface-2 flex items-center gap-3 p-3">
              <div className="grid h-9 w-9 place-items-center rounded-lg bg-flame-500 text-sm font-bold text-black">
                {(state.settings.ownerName || "AB").slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold text-white">
                  {state.settings.ownerName || "Owner"}
                </div>
                <div className="truncate text-xs text-zinc-500">
                  {state.settings.businessName}
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
