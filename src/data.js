import {
  ShieldIcon,
  SearchIcon,
  MessageIcon,
  CalendarIcon,
  BotIcon,
  ClipboardIcon,
  AlertIcon,
  SheetIcon,
} from "./icons.jsx";

export const agents = [
  {
    name: "Boss Agent",
    role: "Plans the day, assigns work, and makes sure risky actions require approval.",
    icon: ShieldIcon,
    x: [8, 52, 76, 20, 8],
    y: [12, 18, 64, 72, 12],
    skills: ["planning", "approvals", "daily report"],
    keywords: ["plan", "approve", "report", "summary", "delegate", "review"],
  },
  {
    name: "Sales Agent",
    role: "Finds leads, scores businesses, and drafts outreach messages.",
    icon: SearchIcon,
    x: [68, 24, 12, 84, 68],
    y: [10, 34, 76, 58, 10],
    skills: ["lead search", "outreach drafts", "reply tracking"],
    keywords: ["lead", "leads", "business", "businesses", "search", "internet", "find", "prospect", "outreach"],
  },
  {
    name: "Content Agent",
    role: "Creates posts, captions, offers, scripts, and business copy.",
    icon: MessageIcon,
    x: [18, 72, 64, 28, 18],
    y: [82, 70, 24, 18, 82],
    skills: ["captions", "offers", "flyers"],
    keywords: ["post", "caption", "script", "offer", "flyer", "facebook", "instagram", "tiktok", "copy", "ad"],
  },
  {
    name: "Ops Agent",
    role: "Organizes tasks, calendar follow-ups, sheets, reminders, and reports.",
    icon: CalendarIcon,
    x: [80, 36, 18, 58, 80],
    y: [78, 62, 20, 14, 78],
    skills: ["scheduling", "tracking", "reports"],
    keywords: ["calendar", "schedule", "follow", "follow-up", "sheet", "sheets", "reminder", "track", "tracking"],
  },
];

export const techStack = [
  {
    name: "Frontend",
    tool: "React command-room dashboard",
    description: "The visual control center where you chat with agents, watch tasks run, and approve actions.",
    icon: BotIcon,
  },
  {
    name: "Automation",
    tool: "n8n",
    description: "Runs workflows for follow-ups, webhooks, lead tracking, and daily reports.",
    icon: ClipboardIcon,
  },
  {
    name: "Browser Control",
    tool: "Playwright",
    description: "Controls browser sessions for tests, form filling, and safe browser automation.",
    icon: SearchIcon,
  },
  {
    name: "AI Brain",
    tool: "OpenAI Agents SDK or API",
    description: "Plans tasks, routes work, writes outputs, and summarizes results.",
    icon: ShieldIcon,
  },
  {
    name: "Data",
    tool: "Google Sheets",
    description: "Stores leads, customers, task status, replies, and progress reports.",
    icon: SheetIcon,
  },
  {
    name: "Messages",
    tool: "Gmail drafts first",
    description: "Creates draft emails, then waits for approval before sending.",
    icon: MessageIcon,
  },
  {
    name: "Calendar",
    tool: "Google Calendar",
    description: "Schedules demos, reminders, follow-ups, and daily check-ins.",
    icon: CalendarIcon,
  },
  {
    name: "Safety",
    tool: "Approval gate",
    description: "Requires approval before sending, posting, spending, deleting, or changing accounts.",
    icon: AlertIcon,
  },
];

export const backendRoutes = [
  { route: "/api/health", purpose: "Checks whether the local backend is connected." },
  { route: "/api/agent-task", purpose: "Runs real agent tasks with internet search, OpenAI, n8n, Playwright, and tool routing." },
  { route: "/api/approval", purpose: "Performs approved actions after you approve them in the UI." },
  { route: "/api/gmail/draft", purpose: "Creates Gmail drafts only. Never sends without approval." },
  { route: "/api/calendar/create", purpose: "Creates or schedules calendar events after approval." },
  { route: "/api/sheets/update", purpose: "Saves leads, customers, tasks, and reports to Google Sheets." },
];

export const taskTemplates = [
  "Find 10 local businesses near Claymont DE that need AI automation",
  "Draft outreach messages for barbers and cleaners",
  "Create a daily report for what the agents completed",
  "Make a Facebook post selling my AI automation setup",
  "Prepare Gmail drafts for 5 leads but do not send",
  "Schedule follow-ups for tomorrow",
];

export const defaultTaskSteps = [
  { label: "Understand request", done: false },
  { label: "Send task to backend", done: false },
  { label: "Receive agent result", done: false },
  { label: "Check safety rules", done: false },
  { label: "Prepare output", done: false },
];

export const RISKY_TASK_TYPES = new Set([
  "draft_messages",
  "schedule_followups",
  "content_creation",
]);

export const starterMessages = [
  { id: "starter-boss", sender: "Boss Agent", text: "I'm ready. Send a task and I'll route it to the right worker through your backend.", time: "" },
  { id: "starter-sales", sender: "Sales Agent", text: "I can search for live leads when /api/agent-task is connected.", time: "" },
  { id: "starter-content", sender: "Content Agent", text: "I can create posts, offers, captions, and scripts from real backend AI results.", time: "" },
  { id: "starter-ops", sender: "Ops Agent", text: "I can organize approvals, follow-ups, saved task history, and reports.", time: "" },
];
