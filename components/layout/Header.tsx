"use client";

import { useApp } from "@/lib/context";
import { Menu, Bell, Sun, Moon, Monitor, Search } from "lucide-react";
import { relativeTime } from "@/lib/utils";
import { useState, useRef, useEffect } from "react";

export default function Header({ title }: { title?: string }) {
  const { state, dispatch } = useApp();
  const [showNotifs, setShowNotifs] = useState(false);
  const [showTheme, setShowTheme] = useState(false);
  const notifsRef = useRef<HTMLDivElement>(null);
  const themeRef = useRef<HTMLDivElement>(null);

  const unread = state.notifications.filter((n) => !n.read).length;

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (notifsRef.current && !notifsRef.current.contains(e.target as Node)) setShowNotifs(false);
      if (themeRef.current && !themeRef.current.contains(e.target as Node)) setShowTheme(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const notifIcons: Record<string, string> = {
    booking: "📅", payment: "💳", review: "⭐", "missed-call": "📞",
    reminder: "⏰", message: "💬",
  };

  return (
    <header className="page-header">
      {/* Mobile menu */}
      <button
        className="btn btn-ghost btn-icon lg:hidden"
        onClick={() => dispatch({ type: "TOGGLE_SIDEBAR" })}
        aria-label="Open menu"
      >
        <Menu size={20} />
      </button>

      <h2 style={{ fontWeight: 700, fontSize: 18, letterSpacing: "-0.02em", flex: 1 }}>
        {title || "Harbor Glass"}
      </h2>

      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        {/* Search */}
        <button className="btn btn-ghost btn-icon" aria-label="Search">
          <Search size={18} />
        </button>

        {/* Theme */}
        <div style={{ position: "relative" }} ref={themeRef}>
          <button
            className="btn btn-ghost btn-icon"
            onClick={() => setShowTheme(!showTheme)}
            aria-label="Theme"
          >
            {state.theme === "dark" ? <Moon size={18} /> : state.theme === "light" ? <Sun size={18} /> : <Monitor size={18} />}
          </button>
          {showTheme && (
            <div style={{
              position: "absolute", top: "calc(100% + 8px)", right: 0,
              background: "rgb(var(--hg-bg-card))",
              border: "1px solid rgb(var(--hg-border))",
              borderRadius: 12, padding: 6, minWidth: 140,
              boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
              zIndex: 100,
            }} className="anim-scale">
              {(["light", "dark", "system"] as const).map((t) => (
                <button
                  key={t}
                  className={`nav-item ${state.theme === t ? "active" : ""}`}
                  style={{ width: "100%" }}
                  onClick={() => { dispatch({ type: "SET_THEME", theme: t }); setShowTheme(false); }}
                >
                  {t === "light" ? <Sun size={15} /> : t === "dark" ? <Moon size={15} /> : <Monitor size={15} />}
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notifications */}
        <div style={{ position: "relative" }} ref={notifsRef}>
          <button
            className="btn btn-ghost btn-icon"
            onClick={() => setShowNotifs(!showNotifs)}
            aria-label="Notifications"
            style={{ position: "relative" }}
          >
            <Bell size={18} />
            {unread > 0 && (
              <span style={{
                position: "absolute", top: 4, right: 4,
                width: 8, height: 8, borderRadius: "50%",
                background: "rgb(var(--hg-danger))",
                border: "2px solid rgb(var(--hg-bg-elevated))",
              }} />
            )}
          </button>

          {showNotifs && (
            <div style={{
              position: "absolute", top: "calc(100% + 8px)", right: 0,
              background: "rgb(var(--hg-bg-card))",
              border: "1px solid rgb(var(--hg-border))",
              borderRadius: 16, width: 340,
              boxShadow: "0 12px 48px rgba(0,0,0,0.2)",
              zIndex: 100, overflow: "hidden",
            }} className="anim-scale">
              <div style={{
                padding: "14px 16px 10px",
                borderBottom: "1px solid rgb(var(--hg-border))",
                display: "flex", alignItems: "center", justifyContent: "space-between",
              }}>
                <div style={{ fontWeight: 700, fontSize: 14 }}>
                  Notifications {unread > 0 && <span className="badge badge-red">{unread}</span>}
                </div>
                {unread > 0 && (
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => dispatch({ type: "MARK_ALL_READ" })}
                    style={{ fontSize: 12 }}
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <div style={{ maxHeight: 360, overflowY: "auto" }}>
                {state.notifications.length === 0 ? (
                  <div style={{ padding: 24, textAlign: "center", color: "rgb(var(--hg-text-secondary))", fontSize: 14 }}>
                    No notifications
                  </div>
                ) : (
                  state.notifications.slice(0, 8).map((n) => (
                    <div
                      key={n.id}
                      style={{
                        padding: "12px 16px",
                        display: "flex", gap: 12, alignItems: "flex-start",
                        background: n.read ? "transparent" : "rgb(var(--hg-blue-light) / 0.04)",
                        borderBottom: "1px solid rgb(var(--hg-border-subtle))",
                        cursor: "pointer",
                      }}
                      onClick={() => dispatch({ type: "MARK_READ", id: n.id })}
                    >
                      <span style={{ fontSize: 20, flexShrink: 0 }}>{notifIcons[n.type] || "🔔"}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: n.read ? 500 : 700, fontSize: 13 }}>{n.title}</div>
                        <div style={{ fontSize: 12, color: "rgb(var(--hg-text-secondary))", marginTop: 2 }}>{n.body}</div>
                        <div style={{ fontSize: 11, color: "rgb(var(--hg-text-tertiary))", marginTop: 4 }}>
                          {relativeTime(n.createdAt)}
                        </div>
                      </div>
                      {!n.read && (
                        <div style={{ width: 7, height: 7, borderRadius: "50%", background: "rgb(var(--hg-blue-light))", flexShrink: 0, marginTop: 4 }} />
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
