import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
} from "react";
import { uid, todayISO } from "../lib/utils.js";

const STORAGE_KEY = "briscoe-os.v1";

const defaultSettings = {
  businessName: "Briscoe Services",
  ownerName: "AB",
  email: "owner@briscoe.co",
  phone: "(555) 010-0199",
  services: [
    "Pressure Washing",
    "Lawn Care",
    "AI Automation Setup",
    "Local SEO",
    "Website Build",
  ],
  pricing: [
    { name: "Driveway Wash", price: 150 },
    { name: "Full Exterior Wash", price: 450 },
    { name: "AI Receptionist Setup", price: 1200 },
    { name: "Local SEO (monthly)", price: 600 },
  ],
  brandPrimary: "#ff6a13",
  brandDark: "#0b0c0f",
  weeklyRevenueGoal: 3500,
};

const seedLeads = [
  {
    id: uid(),
    business: "Lakeside Auto Spa",
    owner: "Marcus Lee",
    phone: "(404) 555-0181",
    email: "marcus@lakesideauto.co",
    location: "Atlanta, GA",
    service: "Pressure Washing",
    status: "Interested",
    lastContacted: todayISO(),
    nextFollowUp: nextDateISO(2),
    notes: "Wants quote for monthly lot wash. Manager is decision maker.",
  },
  {
    id: uid(),
    business: "Hollow Oak Cafe",
    owner: "Priya Shah",
    phone: "(678) 555-0144",
    email: "hello@hollowoak.co",
    location: "Marietta, GA",
    service: "AI Automation Setup",
    status: "Contacted",
    lastContacted: nextDateISO(-1),
    nextFollowUp: nextDateISO(1),
    notes: "Interested in an AI receptionist for missed calls.",
  },
  {
    id: uid(),
    business: "South Peach Roofing",
    owner: "Devon Carter",
    phone: "(770) 555-0166",
    email: "devon@southpeachroof.co",
    location: "Decatur, GA",
    service: "Local SEO",
    status: "New",
    lastContacted: "",
    nextFollowUp: nextDateISO(0),
    notes: "Found via Maps cold list. No website. Easy win.",
  },
  {
    id: uid(),
    business: "Riverwalk Grill",
    owner: "Tomi Adebayo",
    phone: "(404) 555-0117",
    email: "tomi@riverwalkgrill.com",
    location: "Atlanta, GA",
    service: "AI Automation Setup",
    status: "Booked",
    lastContacted: nextDateISO(-2),
    nextFollowUp: nextDateISO(3),
    notes: "Demo scheduled Friday 10am.",
  },
  {
    id: uid(),
    business: "Pine Ridge HVAC",
    owner: "Sam Carter",
    phone: "(770) 555-0190",
    email: "sam@pineridgehvac.com",
    location: "Smyrna, GA",
    service: "Website Build",
    status: "Won",
    lastContacted: nextDateISO(-7),
    nextFollowUp: "",
    notes: "Closed at $2,400. Building site now.",
  },
];

const seedClients = [
  {
    id: uid(),
    name: "Pine Ridge HVAC",
    package: "Website Build + SEO Starter",
    price: 2400,
    dueDate: nextDateISO(10),
    status: "In Progress",
    notes: "Awaiting logo files from owner.",
    deliverables: [
      { id: uid(), title: "Discovery call", done: true },
      { id: uid(), title: "Wireframes", done: true },
      { id: uid(), title: "Site build", done: false },
      { id: uid(), title: "GBP optimization", done: false },
      { id: uid(), title: "Launch + handoff", done: false },
    ],
  },
  {
    id: uid(),
    name: "Hollow Oak Cafe",
    package: "AI Receptionist Setup",
    price: 1200,
    dueDate: nextDateISO(5),
    status: "In Progress",
    notes: "Phone tree mapped. Voice recording done.",
    deliverables: [
      { id: uid(), title: "Call flow design", done: true },
      { id: uid(), title: "Twilio + agent build", done: false },
      { id: uid(), title: "QA + go live", done: false },
    ],
  },
];

const seedTasks = [
  {
    id: uid(),
    title: "Send 20 cold texts to roofing list",
    due: todayISO(),
    done: false,
    priority: "high",
  },
  {
    id: uid(),
    title: "Follow up with Hollow Oak Cafe",
    due: todayISO(),
    done: false,
    priority: "high",
  },
  {
    id: uid(),
    title: "Post TikTok script #4",
    due: todayISO(),
    done: false,
    priority: "med",
  },
  {
    id: uid(),
    title: "Invoice Pine Ridge HVAC milestone 1",
    due: nextDateISO(1),
    done: true,
    priority: "med",
  },
];

const seedRuns = [
  {
    id: uid(),
    skill: "Find Local Leads",
    summary: "Pulled 24 roofing leads in Decatur, GA",
    at: nowISO(),
  },
  {
    id: uid(),
    skill: "Create Cold Text",
    summary: "Drafted SMS for Lakeside Auto Spa",
    at: nowISO(-1000 * 60 * 22),
  },
  {
    id: uid(),
    skill: "Daily Business Plan",
    summary: "Generated today's command plan",
    at: nowISO(-1000 * 60 * 60 * 3),
  },
];

const seedRevenue = [
  { id: uid(), label: "Pine Ridge HVAC deposit", amount: 1200, date: nextDateISO(-2) },
  { id: uid(), label: "Driveway wash – Lewis", amount: 175, date: nextDateISO(-4) },
  { id: uid(), label: "AI setup deposit – Hollow Oak", amount: 600, date: nextDateISO(-1) },
];

const seedVault = [
  {
    id: uid(),
    title: "Cold text v3 – pressure washing",
    category: "Outputs",
    body:
      "Hey {first_name}, saw your shop on Maps — quick Q: would a $99 monthly storefront wash help on weekends? — AB",
    createdAt: nowISO(),
  },
  {
    id: uid(),
    title: "Local lead niches I crush",
    category: "Wiki",
    body:
      "Roofers, HVAC, mobile detailers, cafes near busy roads, gyms with bad reviews on Google.",
    createdAt: nowISO(-1000 * 60 * 60 * 30),
  },
];

function nowISO(offsetMs = 0) {
  return new Date(Date.now() + offsetMs).toISOString();
}
function nextDateISO(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

const initialState = {
  settings: defaultSettings,
  tasks: seedTasks,
  leads: seedLeads,
  clients: seedClients,
  vault: seedVault,
  runs: seedRuns,
  revenue: seedRevenue,
  contentPlan: [
    { id: uid(), title: "TikTok: Before/after driveway wash", channel: "TikTok", due: todayISO(), done: false },
    { id: uid(), title: "IG Reel: AI receptionist demo", channel: "Instagram", due: todayISO(), done: false },
    { id: uid(), title: "FB post: Local roofing case study", channel: "Facebook", due: nextDateISO(1), done: false },
  ],
};

function reducer(state, action) {
  switch (action.type) {
    case "HYDRATE":
      return { ...state, ...action.payload };
    case "SET_SETTINGS":
      return { ...state, settings: { ...state.settings, ...action.payload } };

    // tasks
    case "TASK_ADD":
      return { ...state, tasks: [action.payload, ...state.tasks] };
    case "TASK_UPDATE":
      return {
        ...state,
        tasks: state.tasks.map((t) =>
          t.id === action.payload.id ? { ...t, ...action.payload.patch } : t
        ),
      };
    case "TASK_TOGGLE":
      return {
        ...state,
        tasks: state.tasks.map((t) =>
          t.id === action.payload ? { ...t, done: !t.done } : t
        ),
      };
    case "TASK_DELETE":
      return { ...state, tasks: state.tasks.filter((t) => t.id !== action.payload) };

    // leads
    case "LEAD_ADD":
      return { ...state, leads: [action.payload, ...state.leads] };
    case "LEAD_UPDATE":
      return {
        ...state,
        leads: state.leads.map((l) =>
          l.id === action.payload.id ? { ...l, ...action.payload.patch } : l
        ),
      };
    case "LEAD_DELETE":
      return { ...state, leads: state.leads.filter((l) => l.id !== action.payload) };

    // clients
    case "CLIENT_ADD":
      return { ...state, clients: [action.payload, ...state.clients] };
    case "CLIENT_UPDATE":
      return {
        ...state,
        clients: state.clients.map((c) =>
          c.id === action.payload.id ? { ...c, ...action.payload.patch } : c
        ),
      };
    case "CLIENT_DELETE":
      return { ...state, clients: state.clients.filter((c) => c.id !== action.payload) };
    case "CLIENT_DELIVERABLE_TOGGLE": {
      const { clientId, deliverableId } = action.payload;
      return {
        ...state,
        clients: state.clients.map((c) =>
          c.id !== clientId
            ? c
            : {
                ...c,
                deliverables: c.deliverables.map((d) =>
                  d.id !== deliverableId ? d : { ...d, done: !d.done }
                ),
              }
        ),
      };
    }
    case "CLIENT_DELIVERABLE_ADD": {
      const { clientId, title } = action.payload;
      return {
        ...state,
        clients: state.clients.map((c) =>
          c.id !== clientId
            ? c
            : {
                ...c,
                deliverables: [
                  ...c.deliverables,
                  { id: uid(), title, done: false },
                ],
              }
        ),
      };
    }

    // vault
    case "VAULT_ADD":
      return { ...state, vault: [action.payload, ...state.vault] };
    case "VAULT_UPDATE":
      return {
        ...state,
        vault: state.vault.map((v) =>
          v.id === action.payload.id ? { ...v, ...action.payload.patch } : v
        ),
      };
    case "VAULT_DELETE":
      return { ...state, vault: state.vault.filter((v) => v.id !== action.payload) };

    // runs
    case "RUN_ADD":
      return { ...state, runs: [action.payload, ...state.runs].slice(0, 50) };

    // revenue
    case "REVENUE_ADD":
      return { ...state, revenue: [action.payload, ...state.revenue] };
    case "REVENUE_DELETE":
      return { ...state, revenue: state.revenue.filter((r) => r.id !== action.payload) };

    // content
    case "CONTENT_ADD":
      return { ...state, contentPlan: [action.payload, ...state.contentPlan] };
    case "CONTENT_TOGGLE":
      return {
        ...state,
        contentPlan: state.contentPlan.map((c) =>
          c.id === action.payload ? { ...c, done: !c.done } : c
        ),
      };
    case "CONTENT_DELETE":
      return {
        ...state,
        contentPlan: state.contentPlan.filter((c) => c.id !== action.payload),
      };

    case "RESET":
      return initialState;

    default:
      return state;
  }
}

const StoreCtx = createContext(null);

export function StoreProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState, (init) => {
    if (typeof window === "undefined") return init;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return init;
      const parsed = JSON.parse(raw);
      return { ...init, ...parsed };
    } catch {
      return init;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* noop */
    }
  }, [state]);

  // Convenience action creators
  const actions = useMemo(
    () => ({
      setSettings: (patch) => dispatch({ type: "SET_SETTINGS", payload: patch }),

      addTask: (task) =>
        dispatch({
          type: "TASK_ADD",
          payload: {
            id: uid(),
            done: false,
            priority: "med",
            due: todayISO(),
            ...task,
          },
        }),
      updateTask: (id, patch) =>
        dispatch({ type: "TASK_UPDATE", payload: { id, patch } }),
      toggleTask: (id) => dispatch({ type: "TASK_TOGGLE", payload: id }),
      deleteTask: (id) => dispatch({ type: "TASK_DELETE", payload: id }),

      addLead: (lead) =>
        dispatch({
          type: "LEAD_ADD",
          payload: { id: uid(), status: "New", ...lead },
        }),
      updateLead: (id, patch) =>
        dispatch({ type: "LEAD_UPDATE", payload: { id, patch } }),
      deleteLead: (id) => dispatch({ type: "LEAD_DELETE", payload: id }),

      addClient: (client) =>
        dispatch({
          type: "CLIENT_ADD",
          payload: {
            id: uid(),
            status: "In Progress",
            deliverables: [],
            ...client,
          },
        }),
      updateClient: (id, patch) =>
        dispatch({ type: "CLIENT_UPDATE", payload: { id, patch } }),
      deleteClient: (id) => dispatch({ type: "CLIENT_DELETE", payload: id }),
      toggleDeliverable: (clientId, deliverableId) =>
        dispatch({
          type: "CLIENT_DELIVERABLE_TOGGLE",
          payload: { clientId, deliverableId },
        }),
      addDeliverable: (clientId, title) =>
        dispatch({
          type: "CLIENT_DELIVERABLE_ADD",
          payload: { clientId, title },
        }),

      addVault: (item) =>
        dispatch({
          type: "VAULT_ADD",
          payload: {
            id: uid(),
            createdAt: nowISO(),
            category: "Outputs",
            ...item,
          },
        }),
      updateVault: (id, patch) =>
        dispatch({ type: "VAULT_UPDATE", payload: { id, patch } }),
      deleteVault: (id) => dispatch({ type: "VAULT_DELETE", payload: id }),

      logRun: (run) =>
        dispatch({
          type: "RUN_ADD",
          payload: { id: uid(), at: nowISO(), ...run },
        }),

      addRevenue: (item) =>
        dispatch({
          type: "REVENUE_ADD",
          payload: { id: uid(), date: todayISO(), ...item },
        }),
      deleteRevenue: (id) => dispatch({ type: "REVENUE_DELETE", payload: id }),

      addContent: (item) =>
        dispatch({
          type: "CONTENT_ADD",
          payload: { id: uid(), done: false, due: todayISO(), ...item },
        }),
      toggleContent: (id) => dispatch({ type: "CONTENT_TOGGLE", payload: id }),
      deleteContent: (id) => dispatch({ type: "CONTENT_DELETE", payload: id }),

      reset: () => dispatch({ type: "RESET" }),
    }),
    []
  );

  const value = useMemo(() => ({ state, ...actions }), [state, actions]);
  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreCtx);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}

export function useWeekRevenue() {
  const { state } = useStore();
  const now = new Date();
  const start = new Date(now);
  start.setDate(now.getDate() - now.getDay());
  start.setHours(0, 0, 0, 0);
  const total = state.revenue
    .filter((r) => new Date(r.date) >= start)
    .reduce((s, r) => s + Number(r.amount || 0), 0);
  return { total, goal: state.settings.weeklyRevenueGoal };
}
