import { useMemo, useState } from "react";
import { Card, CardHeader, StatCard } from "../components/Card.jsx";
import Chip from "../components/Chip.jsx";
import Progress from "../components/Progress.jsx";
import Button, { IconButton } from "../components/Button.jsx";
import Icon from "../components/Icon.jsx";
import SkillRunner from "../components/SkillRunner.jsx";
import { skillById, SKILLS } from "../skills/registry.js";
import { useStore, useWeekRevenue } from "../state/store.jsx";
import { formatRelative, todayISO, usd } from "../lib/utils.js";

export default function Dashboard({ goto }) {
  const { state, toggleTask, addTask } = useStore();
  const { total, goal } = useWeekRevenue();
  const [runner, setRunner] = useState(null);
  const [newTask, setNewTask] = useState("");

  const today = todayISO();
  const todays = state.tasks.filter((t) => t.due === today);
  const activeLeads = state.leads.filter((l) =>
    ["New", "Contacted", "Interested", "Booked"].includes(l.status)
  );
  const followUps = state.leads
    .filter((l) => l.nextFollowUp && l.nextFollowUp <= today && l.status !== "Won" && l.status !== "Lost")
    .slice(0, 6);

  const pipeline = useMemo(() => {
    const buckets = ["New", "Contacted", "Interested", "Booked", "Won", "Lost"];
    const counts = Object.fromEntries(buckets.map((b) => [b, 0]));
    state.leads.forEach((l) => (counts[l.status] = (counts[l.status] || 0) + 1));
    const max = Math.max(1, ...Object.values(counts));
    return buckets.map((b) => ({ name: b, count: counts[b], pct: (counts[b] / max) * 100 }));
  }, [state.leads]);

  const quickSkills = ["create_cold_text", "find_local_leads", "daily_business_plan", "create_invoice"]
    .map(skillById)
    .filter(Boolean);

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="surface relative overflow-hidden p-6 sm:p-8">
        <div className="grid-bg pointer-events-none absolute inset-0 opacity-30" />
        <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-flame-500/15 blur-3xl" />
        <div className="relative">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-flame-400">
            <span className="h-2 w-2 animate-pulse rounded-full bg-flame-500" />
            Operator Online
          </div>
          <h2 className="mt-3 text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-4xl">
            Good to see you, {state.settings.ownerName}.
          </h2>
          <p className="mt-2 max-w-xl text-sm text-zinc-400 text-balance">
            You've got <span className="font-semibold text-white">{todays.filter((t) => !t.done).length}</span> moves
            queued, <span className="font-semibold text-white">{followUps.length}</span> follow-ups ready,
            and a weekly goal of <span className="font-semibold text-flame-400">{usd(goal)}</span>.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            {quickSkills.map((s) => (
              <button
                key={s.id}
                onClick={() => setRunner(s)}
                className="group inline-flex items-center gap-2 rounded-lg border border-ink-700 bg-ink-850 px-3 py-2 text-sm font-medium text-zinc-200 transition-all hover:border-flame-500/40 hover:bg-ink-800"
              >
                <span className="grid h-7 w-7 place-items-center rounded-md bg-flame-500/10 text-flame-400 group-hover:bg-flame-500/20">
                  <Icon name={s.icon} className="h-4 w-4" />
                </span>
                {s.name}
              </button>
            ))}
            <button
              onClick={() => goto("skills")}
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-zinc-400 hover:text-flame-400"
            >
              All skills
              <Icon name="arrowRight" className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          accent
          label="This week"
          value={usd(total)}
          hint={`${Math.round((total / Math.max(goal, 1)) * 100)}% of ${usd(goal)} goal`}
          icon={<Icon name="trending" className="h-5 w-5" />}
        />
        <StatCard
          label="Active leads"
          value={activeLeads.length}
          hint={`${state.leads.length} total`}
          icon={<Icon name="users" className="h-5 w-5" />}
        />
        <StatCard
          label="Follow-ups due"
          value={followUps.length}
          hint="Today or earlier"
          icon={<Icon name="message" className="h-5 w-5" />}
        />
        <StatCard
          label="Active clients"
          value={state.clients.length}
          hint={`${state.clients.filter((c) => c.status === "In Progress").length} in motion`}
          icon={<Icon name="briefcase" className="h-5 w-5" />}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        {/* Today's tasks */}
        <Card className="xl:col-span-2">
          <CardHeader
            title="Today's tasks"
            subtitle={new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
            icon={<Icon name="list" className="h-4 w-4" />}
            action={
              <Button variant="outline" size="sm" onClick={() => goto("command")}>
                Command Center
              </Button>
            }
          />
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!newTask.trim()) return;
              addTask({ title: newTask.trim() });
              setNewTask("");
            }}
            className="mb-3 flex gap-2"
          >
            <input
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              placeholder="Add a task for today…"
              className="flex-1"
            />
            <Button type="submit" size="sm">
              <Icon name="plus" className="h-4 w-4" />
              Add
            </Button>
          </form>
          {todays.length === 0 ? (
            <div className="surface-2 p-6 text-center text-sm text-zinc-500">
              Nothing yet. Drop a task to get rolling.
            </div>
          ) : (
            <ul className="space-y-1.5">
              {todays.map((t) => (
                <li
                  key={t.id}
                  className="group flex items-center gap-3 rounded-lg border border-ink-800 bg-ink-850 px-3 py-2.5 transition-colors hover:border-ink-700"
                >
                  <button
                    onClick={() => toggleTask(t.id)}
                    className={`grid h-5 w-5 place-items-center rounded-md border ${
                      t.done
                        ? "border-flame-500 bg-flame-500 text-black"
                        : "border-ink-600 hover:border-flame-500"
                    }`}
                  >
                    {t.done && <Icon name="check" className="h-3 w-3" strokeWidth={3} />}
                  </button>
                  <span className={`flex-1 text-sm ${t.done ? "text-zinc-500 line-through" : "text-zinc-100"}`}>
                    {t.title}
                  </span>
                  {t.priority === "high" && (
                    <Chip status="In Progress" className="!py-0.5 !text-[10px]">
                      Priority
                    </Chip>
                  )}
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* Pipeline */}
        <Card>
          <CardHeader
            title="Client pipeline"
            subtitle="Lead status distribution"
            icon={<Icon name="trending" className="h-4 w-4" />}
            action={
              <button
                onClick={() => goto("leads")}
                className="text-xs font-semibold text-flame-400 hover:underline"
              >
                Open
              </button>
            }
          />
          <ul className="space-y-3">
            {pipeline.map((b) => (
              <li key={b.name}>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="font-medium text-zinc-300">{b.name}</span>
                  <span className="text-zinc-500">{b.count}</span>
                </div>
                <Progress value={b.pct} accent={b.name === "Won" ? "emerald" : "flame"} />
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        {/* Follow-ups */}
        <Card className="xl:col-span-2">
          <CardHeader
            title="Follow-ups due"
            subtitle="Don't let warm leads cool"
            icon={<Icon name="message" className="h-4 w-4" />}
            action={
              <Button variant="outline" size="sm" onClick={() => goto("leads")}>
                Open Leads
              </Button>
            }
          />
          {followUps.length === 0 ? (
            <div className="surface-2 p-6 text-center text-sm text-zinc-500">
              You're caught up. 🔥
            </div>
          ) : (
            <ul className="divide-y divide-ink-800">
              {followUps.map((l) => (
                <li key={l.id} className="flex items-center gap-3 py-3">
                  <div className="grid h-9 w-9 place-items-center rounded-lg bg-flame-500/10 text-flame-400 ring-1 ring-flame-500/20">
                    {l.business.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold text-white">
                      {l.business}
                    </div>
                    <div className="truncate text-xs text-zinc-500">
                      {l.owner} · {l.service} · {l.location}
                    </div>
                  </div>
                  <div className="hidden text-right sm:block">
                    <div className="text-xs text-zinc-400">
                      {formatRelative(l.nextFollowUp)}
                    </div>
                    <Chip status={l.status} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* Recent runs */}
        <Card>
          <CardHeader
            title="Recent AI runs"
            subtitle="Your last operator outputs"
            icon={<Icon name="sparkles" className="h-4 w-4" />}
          />
          <ul className="space-y-3">
            {state.runs.slice(0, 6).map((r) => (
              <li key={r.id} className="flex items-start gap-3">
                <div className="mt-1 grid h-7 w-7 place-items-center rounded-md bg-ink-800 text-flame-400 ring-1 ring-ink-700">
                  <Icon name="bolt" className="h-3.5 w-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-semibold text-white">{r.skill}</div>
                  <div className="truncate text-xs text-zinc-500">{r.summary}</div>
                </div>
                <div className="text-[10px] uppercase tracking-wider text-zinc-500">
                  {timeAgo(r.at)}
                </div>
              </li>
            ))}
            {state.runs.length === 0 && (
              <li className="text-sm text-zinc-500">No runs yet. Start a skill.</li>
            )}
          </ul>
        </Card>
      </div>

      {/* Quick action grid */}
      <Card>
        <CardHeader
          title="Quick actions"
          subtitle="Fastest path to revenue"
          icon={<Icon name="bolt" className="h-4 w-4" />}
        />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {SKILLS.slice(0, 8).map((s) => (
            <button
              key={s.id}
              onClick={() => setRunner(s)}
              className="group surface-2 flex items-center gap-3 p-3.5 text-left transition-all hover:border-flame-500/40 hover:bg-ink-800"
            >
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-flame-500/10 text-flame-400 ring-1 ring-flame-500/20 transition-transform group-hover:scale-105">
                <Icon name={s.icon} className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold text-white">{s.name}</div>
                <div className="truncate text-[11px] text-zinc-500">{s.accent}</div>
              </div>
            </button>
          ))}
        </div>
      </Card>

      <SkillRunner skill={runner} open={!!runner} onClose={() => setRunner(null)} />
    </div>
  );
}

function timeAgo(iso) {
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "now";
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  const days = Math.floor(h / 24);
  return `${days}d`;
}
