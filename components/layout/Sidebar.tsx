"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useApp } from "@/lib/context";
import { getInitials } from "@/lib/utils";
import {
  LayoutDashboard, Calendar, Users, ClipboardList, CreditCard,
  BarChart3, Bot, Megaphone, Package, UserCog, Settings,
  X, Droplets, ChevronRight,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/calendar", label: "Calendar", icon: Calendar },
  { href: "/customers", label: "Customers", icon: Users },
  { href: "/bookings", label: "Bookings", icon: ClipboardList },
  { href: "/payments", label: "Payments", icon: CreditCard },
  { href: "/reports", label: "Reports", icon: BarChart3 },
  { href: "/ai", label: "AI Assistant", icon: Bot },
  { href: "/marketing", label: "Marketing", icon: Megaphone },
  { href: "/inventory", label: "Inventory", icon: Package },
  { href: "/employees", label: "Employees", icon: UserCog },
  { href: "/settings", label: "Settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { state, dispatch } = useApp();

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <>
      {/* Mobile overlay */}
      {state.sidebarOpen && (
        <div
          className="fixed inset-0 z-30 lg:hidden"
          style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
          onClick={() => dispatch({ type: "SET_SIDEBAR", open: false })}
        />
      )}

      <aside className={`sidebar ${state.sidebarOpen ? "open" : ""}`}>
        {/* Logo */}
        <div style={{
          padding: "20px 16px 16px",
          borderBottom: "1px solid rgb(var(--hg-border))",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{
              width: 36, height: 36,
              background: "linear-gradient(135deg, rgb(var(--hg-blue-light)), rgb(var(--hg-cyan)))",
              borderRadius: 10,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Droplets size={20} color="white" />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, letterSpacing: "-0.02em" }}>Harbor Glass</div>
              <div style={{ fontSize: 11, color: "rgb(var(--hg-text-secondary))", fontWeight: 500 }}>Business OS</div>
            </div>
          </div>
          <button
            className="btn btn-ghost btn-icon lg:hidden"
            onClick={() => dispatch({ type: "SET_SIDEBAR", open: false })}
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "12px 10px", overflowY: "auto" }}>
          <div className="section-title" style={{ padding: "4px 6px" }}>MAIN MENU</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {NAV_ITEMS.slice(0, 6).map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={`nav-item ${isActive(href) ? "active" : ""}`}
                onClick={() => dispatch({ type: "SET_SIDEBAR", open: false })}
              >
                <Icon size={18} />
                {label}
                {href === "/bookings" && (
                  <span className="nav-badge">3</span>
                )}
              </Link>
            ))}
          </div>

          <div className="section-title" style={{ padding: "16px 6px 4px" }}>TOOLS</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {NAV_ITEMS.slice(6).map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={`nav-item ${isActive(href) ? "active" : ""}`}
                onClick={() => dispatch({ type: "SET_SIDEBAR", open: false })}
              >
                <Icon size={18} />
                {label}
              </Link>
            ))}
          </div>
        </nav>

        {/* User profile */}
        <div style={{
          padding: "12px 10px",
          borderTop: "1px solid rgb(var(--hg-border))",
        }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "10px 10px",
            borderRadius: 10,
            cursor: "pointer",
            transition: "background 0.15s ease",
          }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "rgb(var(--hg-border-subtle))")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            <div className="avatar" style={{ width: 34, height: 34, fontSize: 13 }}>
              {getInitials(state.user.name)}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {state.user.name}
              </div>
              <div style={{ fontSize: 11, color: "rgb(var(--hg-text-secondary))", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                Owner
              </div>
            </div>
            <ChevronRight size={14} style={{ color: "rgb(var(--hg-text-tertiary))", flexShrink: 0 }} />
          </div>
        </div>
      </aside>
    </>
  );
}
