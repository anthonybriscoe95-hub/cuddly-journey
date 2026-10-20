"use client";

import React, { createContext, useContext, useReducer, useEffect } from "react";
import type { AppState, Notification } from "./types";

type Action =
  | { type: "TOGGLE_SIDEBAR" }
  | { type: "SET_SIDEBAR"; open: boolean }
  | { type: "SET_THEME"; theme: AppState["theme"] }
  | { type: "MARK_READ"; id: string }
  | { type: "MARK_ALL_READ" }
  | { type: "ADD_NOTIFICATION"; notification: Notification };

const initialState: AppState = {
  theme: "system",
  sidebarOpen: false,
  user: {
    name: "Anthony Briscoe",
    email: "anthony@harborglass.com",
    company: "Harbor Glass Window Cleaning",
  },
  notifications: [],
  unreadCount: 0,
};

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "TOGGLE_SIDEBAR":
      return { ...state, sidebarOpen: !state.sidebarOpen };
    case "SET_SIDEBAR":
      return { ...state, sidebarOpen: action.open };
    case "SET_THEME":
      return { ...state, theme: action.theme };
    case "MARK_READ": {
      const notifications = state.notifications.map((n) =>
        n.id === action.id ? { ...n, read: true } : n
      );
      return { ...state, notifications, unreadCount: notifications.filter((n) => !n.read).length };
    }
    case "MARK_ALL_READ": {
      const notifications = state.notifications.map((n) => ({ ...n, read: true }));
      return { ...state, notifications, unreadCount: 0 };
    }
    case "ADD_NOTIFICATION":
      return {
        ...state,
        notifications: [action.notification, ...state.notifications],
        unreadCount: state.unreadCount + 1,
      };
    default:
      return state;
  }
}

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<Action>;
} | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    import("./mock-data").then(({ MOCK_NOTIFICATIONS }) => {
      MOCK_NOTIFICATIONS.forEach((n) => dispatch({ type: "ADD_NOTIFICATION", notification: n }));
    });
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (state.theme === "dark") {
      root.setAttribute("data-theme", "dark");
    } else if (state.theme === "light") {
      root.setAttribute("data-theme", "light");
    } else {
      root.removeAttribute("data-theme");
    }
  }, [state.theme]);

  return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside AppProvider");
  return ctx;
}
