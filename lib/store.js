"use client";

import { useSyncExternalStore } from "react";

// ── Local-first data store ──────────────────────────────────────────────────
// Persists to localStorage so the app works instantly with zero setup.
// When Firebase env vars are present, this module is the single place to
// swap persistence for Firestore (see README).

const KEY = "hg_data_v2";
const SESSION_KEY = "hg_session";

export const seedLeads = [
  { id: "L1", name: "Bayshore Realty Group", type: "realtor", source: "Google Maps", website: "bayshorerealtyde.com", phone: "302-555-0141", email: "info@bayshorerealtyde.com", city: "Wilmington", neighborhood: "Trolley Square", lat: 39.7573, lng: -75.5613, score: 92, status: "new", value: 380, notes: "Lists 8–12 homes/month. Pre-listing window cleaning pitch.", followUp: null, saved: true },
  { id: "L2", name: "Marta Jenkins", type: "homeowner", source: "Website Inquiry", website: "", phone: "302-555-0177", email: "marta.j@example.com", city: "Newark", neighborhood: "Fairfield", lat: 39.6837, lng: -75.7497, score: 88, status: "contacted", value: 240, notes: "Two-story colonial, 24 windows + screens. Asked for weekend slot.", followUp: "2026-07-06", saved: true },
  { id: "L3", name: "Riverfront Bistro", type: "business", source: "Google Maps", website: "riverfrontbistro.com", phone: "302-555-0122", email: "", city: "Wilmington", neighborhood: "Riverfront", lat: 39.7365, lng: -75.5545, score: 85, status: "new", value: 160, notes: "Large storefront glass facing the river walk. Monthly plan candidate.", followUp: null, saved: true },
  { id: "L4", name: "Coastal Stay Rentals", type: "airbnb", source: "Referral", website: "coastalstayde.com", phone: "302-555-0139", email: "host@coastalstayde.com", city: "Rehoboth Beach", neighborhood: "The Pines", lat: 38.7209, lng: -75.076, score: 90, status: "estimate", value: 520, notes: "Manages 6 beach rentals. Turnover cleans between guests.", followUp: "2026-07-04", saved: true },
  { id: "L5", name: "Hartley Property Management", type: "property_manager", source: "Business Directory", website: "hartleypm.com", phone: "302-555-0163", email: "office@hartleypm.com", city: "Dover", neighborhood: "Downtown Dover", lat: 39.1582, lng: -75.5244, score: 87, status: "quoted", value: 1150, notes: "40-unit portfolio. Quoted quarterly common-area glass.", followUp: "2026-07-08", saved: true },
  { id: "L6", name: "Dan & Priya Okafor", type: "homeowner", source: "Nextdoor (manual)", website: "", phone: "302-555-0114", email: "", city: "Middletown", neighborhood: "Willow Grove", lat: 39.4496, lng: -75.7163, score: 78, status: "new", value: 210, notes: "Asked on Nextdoor for window cleaner recs — I replied, awaiting DM.", followUp: "2026-07-05", saved: false },
  { id: "L7", name: "Lewes Bookshop & Cafe", type: "business", source: "Door Knock", website: "lewesbookcafe.com", phone: "302-555-0186", email: "hello@lewesbookcafe.com", city: "Lewes", neighborhood: "Second Street", lat: 38.7746, lng: -75.1393, score: 74, status: "contacted", value: 120, notes: "Owner interested in bi-weekly storefront service.", followUp: "2026-07-07", saved: true },
  { id: "L8", name: "Sandpiper Suites", type: "business", source: "Google Maps", website: "sandpipersuites.com", phone: "302-555-0158", email: "gm@sandpipersuites.com", city: "Rehoboth Beach", neighborhood: "Boardwalk", lat: 38.7168, lng: -75.0766, score: 83, status: "new", value: 640, notes: "Boutique hotel, 3 floors of ocean-facing glass.", followUp: null, saved: false },
  { id: "L9", name: "Karen Whitfield", type: "realtor", source: "Facebook Group (manual)", website: "", phone: "302-555-0192", email: "karen.sellsde@example.com", city: "Newark", neighborhood: "Pike Creek", lat: 39.7096, lng: -75.7038, score: 80, status: "won", value: 175, notes: "Found via local FB group post I answered. Repeat pre-listing cleans.", followUp: null, saved: true },
  { id: "L10", name: "Tidewater Dental", type: "business", source: "Google Maps", website: "tidewaterdentalde.com", phone: "302-555-0171", email: "", city: "Dover", neighborhood: "Route 8 Corridor", lat: 39.1622, lng: -75.556, score: 71, status: "lost", value: 140, notes: "Went with a cheaper quote. Revisit in the fall.", followUp: "2026-09-15", saved: false },
  { id: "L11", name: "Greg Alvarez", type: "homeowner", source: "Reddit (manual)", website: "", phone: "", email: "galvarez@example.com", city: "Wilmington", neighborhood: "Highlands", lat: 39.7648, lng: -75.5687, score: 69, status: "new", value: 260, notes: "r/Delaware thread asking about skylight cleaning — sent info.", followUp: "2026-07-09", saved: false },
  { id: "L12", name: "First & Main Boutique", type: "business", source: "Google Maps", website: "firstandmainboutique.com", phone: "302-555-0125", email: "shop@firstandmainboutique.com", city: "Middletown", neighborhood: "Main Street", lat: 39.4485, lng: -75.7132, score: 76, status: "estimate", value: 110, notes: "Display windows monthly. Estimate walk-through Tuesday.", followUp: "2026-07-07", saved: true },
];

const seedJobs = [
  { id: "J1", customer: "Karen Whitfield", city: "Newark", service: "Residential Window Cleaning", amount: 175, date: "2026-06-12", status: "completed", reviewRequested: true },
  { id: "J2", customer: "The Marina Grill", city: "Wilmington", service: "Commercial Window Cleaning", amount: 220, date: "2026-06-20", status: "completed", reviewRequested: false },
  { id: "J3", customer: "Holly & Sam Turner", city: "Lewes", service: "Residential + Screen Cleaning", amount: 310, date: "2026-06-27", status: "completed", reviewRequested: false },
  { id: "J4", customer: "Marta Jenkins", city: "Newark", service: "Residential Window Cleaning", amount: 240, date: "2026-07-11", status: "scheduled", reviewRequested: false },
];

const defaults = () => ({
  leads: seedLeads,
  jobs: seedJobs,
  estimates: [],
  invoices: [],
  settings: {
    taxRate: 0,
    reviewUrl: process.env.NEXT_PUBLIC_GOOGLE_REVIEW_URL || "https://g.page/r/harbor-glass/review",
    stripeLink: process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK || "",
    squareLink: process.env.NEXT_PUBLIC_SQUARE_PAYMENT_LINK || "",
    cashTag: process.env.NEXT_PUBLIC_CASHAPP_CASHTAG || "$HarborGlassDE",
    venmo: process.env.NEXT_PUBLIC_VENMO_HANDLE || "@HarborGlass-Cleaning",
  },
});

let state = null;
const listeners = new Set();

function read() {
  if (state) return state;
  if (typeof window === "undefined") return defaults();
  try {
    const raw = window.localStorage.getItem(KEY);
    state = raw ? { ...defaults(), ...JSON.parse(raw) } : defaults();
  } catch {
    state = defaults();
  }
  return state;
}

function write(next) {
  state = next;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {}
  listeners.forEach((fn) => fn());
}

export function getStore() {
  return read();
}

export function updateStore(updater) {
  write({ ...read(), ...updater(read()) });
}

const serverSnapshot = defaults();

export function useStore() {
  return useSyncExternalStore(
    (fn) => {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
    () => read(),
    () => serverSnapshot
  );
}

export const uid = () => Math.random().toString(36).slice(2, 9).toUpperCase();

// ── Lead helpers ────────────────────────────────────────────────────────────

export function addLead(lead) {
  updateStore((s) => ({
    leads: [{ id: "L" + uid(), status: "new", saved: true, score: 70, ...lead }, ...s.leads],
  }));
}

export function updateLead(id, patch) {
  updateStore((s) => ({
    leads: s.leads.map((l) => (l.id === id ? { ...l, ...patch } : l)),
  }));
}

export function addJob(job) {
  updateStore((s) => ({ jobs: [{ id: "J" + uid(), ...job }, ...s.jobs] }));
}

export function updateJob(id, patch) {
  updateStore((s) => ({
    jobs: s.jobs.map((j) => (j.id === id ? { ...j, ...patch } : j)),
  }));
}

export function saveDocument(kind, doc) {
  updateStore((s) => ({ [kind]: [doc, ...s[kind]] }));
}

export function updateSettings(patch) {
  updateStore((s) => ({ settings: { ...s.settings, ...patch } }));
}

export function resetDemoData() {
  write(defaults());
}

// ── Demo auth session (swap for Firebase Auth when configured) ─────────────

export function getSession() {
  if (typeof window === "undefined") return null;
  try {
    return JSON.parse(window.localStorage.getItem(SESSION_KEY));
  } catch {
    return null;
  }
}

export function signIn(email) {
  const session = { email, name: email.split("@")[0], at: Date.now() };
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session;
}

export function signOut() {
  window.localStorage.removeItem(SESSION_KEY);
}
