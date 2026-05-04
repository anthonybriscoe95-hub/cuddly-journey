import { agents, defaultTaskSteps, RISKY_TASK_TYPES } from "./data.js";

export const STORAGE_KEY = "ai-agent-command-room-v3";
export const LEGACY_STORAGE_KEYS = ["ai-agent-command-room-v2", "ai-agent-command-room-v1"];
export const REQUEST_TIMEOUT_MS = 20000;

export function uid(prefix = "id") {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function asArray(value) {
  return Array.isArray(value) ? value : [];
}

export function asText(value, fallback = "") {
  if (typeof value === "string") return value;
  if (value === null || typeof value === "undefined") return fallback;
  return String(value);
}

export function clampNumber(value, min = 0, max = 100) {
  const number = Number(value);
  if (!Number.isFinite(number)) return min;
  return Math.min(max, Math.max(min, number));
}

export function nowTime() {
  return new Date().toLocaleTimeString();
}

export function getAgentByName(name) {
  return agents.find((agent) => agent.name === name) || agents[0];
}

export function pickAgentForCommand(command) {
  const text = asText(command).toLowerCase();
  if (!text.trim()) return "Boss Agent";
  let best = { name: "Boss Agent", score: 0 };
  for (const agent of agents) {
    const score = (agent.keywords || []).reduce(
      (sum, keyword) => (text.includes(keyword) ? sum + 1 : sum),
      0
    );
    if (score > best.score) best = { name: agent.name, score };
  }
  return best.name;
}

export function detectTaskType(command) {
  const text = asText(command).toLowerCase();
  if (text.includes("lead") || text.includes("business") || text.includes("search") || text.includes("internet")) return "lead_search";
  if (text.includes("gmail") || text.includes("email") || text.includes("draft") || text.includes("message")) return "draft_messages";
  if (text.includes("calendar") || text.includes("schedule") || text.includes("follow")) return "schedule_followups";
  if (text.includes("post") || text.includes("caption") || text.includes("offer") || text.includes("facebook")) return "content_creation";
  if (text.includes("report")) return "daily_report";
  return "general_task";
}

export function isRiskyTaskType(type) {
  return RISKY_TASK_TYPES.has(type);
}

export function getFreshSteps() {
  return defaultTaskSteps.map((step) => ({ ...step }));
}

export function createTask(command) {
  const clean = asText(command).trim();
  const agentName = pickAgentForCommand(clean);
  return {
    id: uid("task"),
    command: clean,
    agentName,
    type: detectTaskType(clean),
    status: "Queued",
    progress: 0,
    steps: getFreshSteps(),
    createdAt: nowTime(),
  };
}

const VALID_TASK_STATUSES = new Set(["Queued", "Running", "Done", "Failed", "Waiting", "Cancelled", "Rejected"]);

export function normalizeTask(task) {
  const command = asText(task?.command, "Untitled task").trim() || "Untitled task";
  const agentName = agents.some((agent) => agent.name === task?.agentName) ? task.agentName : pickAgentForCommand(command);
  const rawSteps = asArray(task?.steps);
  const steps =
    rawSteps.length > 0
      ? rawSteps.map((step, index) => ({
          label: asText(step?.label, defaultTaskSteps[index]?.label || `Step ${index + 1}`),
          done: Boolean(step?.done),
        }))
      : getFreshSteps();
  const status = VALID_TASK_STATUSES.has(task?.status) ? task.status : "Queued";
  return {
    id: asText(task?.id, uid("task")),
    command,
    agentName,
    type: asText(task?.type, detectTaskType(command)),
    status,
    progress: clampNumber(task?.progress),
    steps,
    createdAt: asText(task?.createdAt, nowTime()),
  };
}

export function normalizeResult(item, index = 0) {
  return {
    title: asText(item?.title, `Result ${index + 1}`),
    snippet: asText(item?.snippet || item?.description, "No details returned."),
    url: asText(item?.url, ""),
    source: asText(item?.source, "Backend"),
    score: typeof item?.score === "undefined" ? undefined : item.score,
  };
}

export function normalizeApproval(item) {
  return {
    id: asText(item?.id, uid("approval")),
    title: asText(item?.title, "Approval needed"),
    type: asText(item?.type, "approval"),
    status: ["Waiting", "Approved", "Rejected"].includes(item?.status) ? item.status : "Waiting",
    detail: asText(item?.detail, "Review before the agent performs this action."),
    draft: asArray(item?.draft).map((line) => asText(line)),
    taskId: asText(item?.taskId, ""),
    agentName: asText(item?.agentName, "Boss Agent"),
    createdAt: asText(item?.createdAt, nowTime()),
  };
}

export function normalizeOutput(item) {
  return {
    id: asText(item?.id, uid("output")),
    taskId: asText(item?.taskId, ""),
    agentName: asText(item?.agentName, "Boss Agent"),
    command: asText(item?.command, "Completed task"),
    summary: asText(item?.summary, "Backend returned a response."),
    results: asArray(item?.results).map(normalizeResult),
    createdAt: asText(item?.createdAt, nowTime()),
  };
}

export function normalizeLogItem(item) {
  return {
    id: asText(item?.id, uid("log")),
    text: asText(item?.text, "Log entry"),
    time: asText(item?.time, nowTime()),
    level: ["info", "warn", "error", "ok"].includes(item?.level) ? item.level : "info",
  };
}

export function normalizeMessage(item) {
  if (typeof item === "string") {
    const colonAt = item.indexOf(":");
    if (colonAt > 0 && colonAt < 32) {
      return { id: uid("msg"), sender: item.slice(0, colonAt).trim(), text: item.slice(colonAt + 1).trim(), time: "" };
    }
    return { id: uid("msg"), sender: "System", text: item, time: "" };
  }
  return {
    id: asText(item?.id, uid("msg")),
    sender: asText(item?.sender, "System"),
    text: asText(item?.text, ""),
    time: asText(item?.time, ""),
  };
}

export function normalizeSavedState(state) {
  if (!state || typeof state !== "object") return null;
  return {
    selectedName: agents.some((agent) => agent.name === state.selectedName) ? state.selectedName : agents[0].name,
    messages: asArray(state.messages).map(normalizeMessage).filter((message) => message.text),
    tasks: asArray(state.tasks).map(normalizeTask),
    activityLog: asArray(state.activityLog).map(normalizeLogItem),
    outputs: asArray(state.outputs).map(normalizeOutput),
    approvals: asArray(state.approvals).map(normalizeApproval),
  };
}

export function normalizeBackendPayload(payload) {
  return {
    summary: asText(payload?.summary, "Backend returned a response."),
    results: asArray(payload?.results).map(normalizeResult),
    approvals: asArray(payload?.approvals).map(normalizeApproval),
  };
}

export function safeLoadState() {
  if (typeof window === "undefined") return null;
  try {
    const candidates = [STORAGE_KEY, ...LEGACY_STORAGE_KEYS];
    for (const key of candidates) {
      const raw = window.localStorage.getItem(key);
      if (raw) return normalizeSavedState(JSON.parse(raw));
    }
    return null;
  } catch (error) {
    console.warn("Failed to load saved state", error);
    return null;
  }
}

export function safeSaveState(state) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.warn("Failed to save state", error);
  }
}

export function clearStoredState() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
    LEGACY_STORAGE_KEYS.forEach((key) => window.localStorage.removeItem(key));
  } catch (error) {
    console.warn("Failed to clear stored state", error);
  }
}

export async function fetchJsonWithTimeout(url, options = {}, timeoutMs = REQUEST_TIMEOUT_MS) {
  const controller = new AbortController();
  const externalSignal = options.signal;
  if (externalSignal) {
    if (externalSignal.aborted) controller.abort(externalSignal.reason);
    else externalSignal.addEventListener("abort", () => controller.abort(externalSignal.reason), { once: true });
  }
  const timer = setTimeout(() => controller.abort(new Error(`Request timed out after ${timeoutMs / 1000}s`)), timeoutMs);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    const text = await response.text();
    let payload = {};
    if (text) {
      try {
        payload = JSON.parse(text);
      } catch {
        throw new Error(`Backend returned non-JSON response from ${url}.`);
      }
    }
    if (!response.ok) throw new Error(payload?.error || `Backend returned HTTP ${response.status} from ${url}.`);
    return payload;
  } catch (error) {
    if (error?.name === "AbortError") {
      const reason = controller.signal?.reason;
      throw new Error(reason?.message || `Request aborted: ${url}`);
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

export function makeChatReply(userText, agents) {
  const clean = asText(userText).trim();
  if (!clean) return null;
  const agentName = pickAgentForCommand(clean);
  const replies = {
    "Boss Agent": `Boss Agent: I'll plan this and route it to the right worker. Drop "${clean}" into the task box and click Run Agent Task.`,
    "Sales Agent": `Sales Agent: I can search for matching businesses and score them. Run "${clean}" as a task to get live results.`,
    "Content Agent": `Content Agent: I can draft this — captions, scripts, or offers. Run "${clean}" as a task and I'll prepare it for your approval.`,
    "Ops Agent": `Ops Agent: I can schedule this and log it to your sheet. Run "${clean}" as a task and I'll prep the calendar entries.`,
  };
  return { id: uid("msg"), sender: agentName, text: replies[agentName] || replies["Boss Agent"], time: nowTime() };
}

export function getStatusClass(status) {
  const styles = {
    Queued: "bg-slate-100 text-slate-700 border-slate-200",
    Running: "bg-blue-100 text-blue-700 border-blue-200",
    Done: "bg-emerald-100 text-emerald-700 border-emerald-200",
    Failed: "bg-red-100 text-red-700 border-red-200",
    Cancelled: "bg-zinc-200 text-zinc-700 border-zinc-300",
    Waiting: "bg-amber-100 text-amber-800 border-amber-200",
    Approved: "bg-emerald-100 text-emerald-700 border-emerald-200",
    Rejected: "bg-red-100 text-red-700 border-red-200",
    Connected: "bg-emerald-100 text-emerald-700 border-emerald-200",
    Offline: "bg-red-100 text-red-700 border-red-200",
    Checking: "bg-blue-100 text-blue-700 border-blue-200",
  };
  return styles[status] || styles.Queued;
}

export function runSelfTests() {
  const results = [];
  const test = (name, condition) => results.push({ name, pass: Boolean(condition) });
  test("there are four agents", agents.length === 4);
  test("lead command routes to Sales Agent", pickAgentForCommand("find leads") === "Sales Agent");
  test("content command routes to Content Agent", pickAgentForCommand("make a post") === "Content Agent");
  test("schedule command routes to Ops Agent", pickAgentForCommand("schedule followups") === "Ops Agent");
  test("undefined command safely routes", pickAgentForCommand(undefined) === "Boss Agent");
  test("task creation stores command", createTask("Find leads").command === "Find leads");
  test("task normalization adds missing steps", normalizeTask({ command: "Find leads" }).steps.length === defaultTaskSteps.length);
  test("invalid status falls back to Queued", normalizeTask({ command: "x", status: "Bogus" }).status === "Queued");
  test("output normalization defaults results", Array.isArray(normalizeOutput({ summary: "x" }).results));
  test("backend payload normalizes results", normalizeBackendPayload({ results: [{ title: "Lead" }] }).results.length === 1);
  test("backend payload normalizes approvals", normalizeBackendPayload({ approvals: [{ title: "Approve draft" }] }).approvals.length === 1);
  test("approval status invalid falls back to Waiting", normalizeApproval({ status: "Bad" }).status === "Waiting");
  test("saved state normalization handles bad arrays", normalizeSavedState({ tasks: null, outputs: null, approvals: null })?.tasks.length === 0);
  test("legacy string message normalizes", normalizeMessage("Boss Agent: hello").sender === "Boss Agent");
  test("empty chat returns null", makeChatReply("   ") === null);
  test("non-empty chat replies", Boolean(makeChatReply("find leads")));
  test("draft_messages is risky", isRiskyTaskType("draft_messages"));
  test("daily_report is not risky", !isRiskyTaskType("daily_report"));
  return results;
}
