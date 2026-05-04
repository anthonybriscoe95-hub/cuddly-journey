import express from "express";
import "dotenv/config";

const app = express();
app.use(express.json({ limit: "1mb" }));
app.use((req, _res, next) => {
  console.log(`[api] ${req.method} ${req.path}`);
  next();
});

const PORT = Number(process.env.PORT || 5174);
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";

const RISKY_TYPES = new Set(["draft_messages", "schedule_followups", "content_creation"]);

const agentSystemPrompts = {
  "Boss Agent":
    "You are Boss Agent. Plan and assign work. Produce a JSON object with 'summary' (one paragraph) and 'results' (array of {title, snippet, source}) listing the steps you'd assign and to which agent.",
  "Sales Agent":
    "You are Sales Agent. Find prospect businesses. Produce a JSON object with 'summary' (one paragraph) and 'results' (array of {title, snippet, source, url, score}) describing realistic-looking lead candidates by category. Mark source as 'Sales Agent'. Score 0-100 based on fit.",
  "Content Agent":
    "You are Content Agent. Draft posts, captions, scripts, and offers. Produce a JSON object with 'summary' (one paragraph) and 'results' (array of {title, snippet, source}) where each result is one drafted piece of content. Mark source as 'Content Agent'.",
  "Ops Agent":
    "You are Ops Agent. Organize calendar follow-ups, sheet rows, and reminders. Produce a JSON object with 'summary' (one paragraph) and 'results' (array of {title, snippet, source}) describing scheduled actions. Mark source as 'Ops Agent'.",
};

function makeApprovalIfRisky(taskType, agent, results = []) {
  if (!RISKY_TYPES.has(taskType)) return [];
  return [
    {
      id: `apr-${Date.now()}`,
      title: `Approve before ${taskType.replaceAll("_", " ")}`,
      type: taskType,
      status: "Waiting",
      detail: `${agent} prepared ${results.length} item(s). Review before any action is taken.`,
      draft: results.map((result) => result?.title).filter(Boolean).slice(0, 5),
    },
  ];
}

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    ts: Date.now(),
    openai: Boolean(OPENAI_API_KEY),
    model: OPENAI_API_KEY ? OPENAI_MODEL : null,
  });
});

app.post("/api/agent-task", async (req, res) => {
  const command = String(req.body?.command || "").trim();
  const agent = String(req.body?.agent || "Boss Agent");
  const taskType = String(req.body?.taskType || "general_task");

  if (!command) {
    return res.status(400).json({ error: "Missing command" });
  }

  if (!OPENAI_API_KEY) {
    return res.json({
      summary:
        "Backend reached, but no OPENAI_API_KEY is configured. Add a key to server/.env to get real agent results. No fake data is being produced.",
      results: [],
      approvals: [],
    });
  }

  try {
    const sys = agentSystemPrompts[agent] || agentSystemPrompts["Boss Agent"];
    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        temperature: 0.4,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content: `${sys}\n\nReturn ONLY valid JSON: {"summary": string, "results": [{"title": string, "snippet": string, "source": string, "url"?: string, "score"?: number}]}.`,
          },
          { role: "user", content: command },
        ],
      }),
    });

    if (!r.ok) {
      const errorText = await r.text();
      return res.status(502).json({ error: `OpenAI error: ${errorText}` });
    }

    const data = await r.json();
    const raw = data?.choices?.[0]?.message?.content || "{}";
    let parsed = {};
    try {
      parsed = JSON.parse(raw);
    } catch {
      parsed = { summary: raw, results: [] };
    }

    const results = Array.isArray(parsed.results) ? parsed.results : [];
    const summary = typeof parsed.summary === "string" && parsed.summary.trim()
      ? parsed.summary
      : "No summary returned.";

    return res.json({
      summary,
      results,
      approvals: makeApprovalIfRisky(taskType, agent, results),
    });
  } catch (error) {
    console.error("[agent-task] error", error);
    return res.status(500).json({ error: String(error?.message || error) });
  }
});

app.post("/api/approval", (req, res) => {
  const { approval, action } = req.body || {};
  console.log(`[approval] ${action} ${approval?.id || ""} ${approval?.title || ""}`);
  res.json({ ok: true, action, id: approval?.id || null });
});

app.post("/api/gmail/draft", (req, res) => {
  console.log("[gmail/draft]", req.body);
  res.json({ ok: true, draftId: `draft-${Date.now()}` });
});

app.post("/api/calendar/create", (req, res) => {
  console.log("[calendar/create]", req.body);
  res.json({ ok: true, eventId: `evt-${Date.now()}` });
});

app.post("/api/sheets/update", (req, res) => {
  console.log("[sheets/update]", req.body);
  res.json({ ok: true, rowsUpdated: Array.isArray(req.body?.rows) ? req.body.rows.length : 1 });
});

app.use((_req, res) => res.status(404).json({ error: "Not found" }));

app.listen(PORT, () => {
  console.log(`[api] listening on http://localhost:${PORT}`);
  console.log(`[api] OPENAI_API_KEY: ${OPENAI_API_KEY ? "set" : "NOT set (agent-task will return empty results)"}`);
});
