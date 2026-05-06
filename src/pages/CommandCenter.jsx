import { useMemo, useState } from "react";
import { Card, CardHeader, StatCard } from "../components/Card.jsx";
import Chip from "../components/Chip.jsx";
import Progress from "../components/Progress.jsx";
import Button, { IconButton } from "../components/Button.jsx";
import Icon from "../components/Icon.jsx";
import Field from "../components/Field.jsx";
import { useStore, useWeekRevenue } from "../state/store.jsx";
import { formatRelative, todayISO, usd } from "../lib/utils.js";

export default function CommandCenter({ goto }) {
  const {
    state,
    toggleTask,
    deleteTask,
    addTask,
    addContent,
    toggleContent,
    deleteContent,
    addRevenue,
    deleteRevenue,
    setSettings,
  } = useStore();
  const { total, goal } = useWeekRevenue();

  const [newTask, setNewTask] = useState("");
  const [newContent, setNewContent] = useState({ title: "", channel: "TikTok", due: todayISO() });
  const [newRev, setNewRev] = useState({ label: "", amount: 0, date: todayISO() });

  const today = todayISO();
  const todays = state.tasks.filter((t) => t.due === today);
  const followUps = state.leads.filter(
    (l) => l.nextFollowUp && l.nextFollowUp <= today && l.status !== "Won" && l.status !== "Lost"
  );
  const clientsWork = state.clients.filter((c) => c.status === "In Progress");
  const todaysContent = state.contentPlan.filter((c) => c.due <= today);

  const pct = Math.min(100, Math.round((total / Math.max(goal, 1)) * 100));

  return (
    <div className="space-y-6">
      <Card className="!p-6">
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-flame-400">
              Daily Command
            </div>
            <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
              {new Date().toLocaleDateString(undefined, {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </h2>
            <p className="mt-1 text-sm text-zinc-400">
              Your day, distilled. Move what moves the line.
            </p>
          </div>
          <div className="grid w-full grid-cols-3 gap-3 sm:w-auto">
            <MiniStat label="Tasks" value={`${todays.filter((t) => !t.done).length}/${todays.length}`} />
            <MiniStat label="Follow-ups" value={followUps.length} accent />
            <MiniStat label="In motion" value={clientsWork.length} />
          </div>
        </div>
      </Card>

      <div className="grid gap-6 xl:grid-cols-2">
        {/* Today's tasks */}
        <Card>
          <CardHeader
            title="What I need to do today"
            subtitle="One done is better than ten queued"
            icon={<Icon name="list" className="h-4 w-4" />}
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
              placeholder="New task for today…"
              className="flex-1"
            />
            <Button type="submit" size="sm">Add</Button>
          </form>
          <ul className="space-y-1.5">
            {todays.map((t) => (
              <li
                key={t.id}
                className="group flex items-center gap-3 rounded-lg border border-ink-800 bg-ink-850 px-3 py-2.5"
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
                <IconButton
                  onClick={() => deleteTask(t.id)}
                  className="opacity-0 group-hover:opacity-100 hover:!border-rose-500/40 hover:!text-rose-400"
                >
                  <Icon name="trash" className="h-4 w-4" />
                </IconButton>
              </li>
            ))}
            {todays.length === 0 && (
              <li className="surface-2 p-5 text-center text-sm text-zinc-500">
                Empty. Add the one move that matters most.
              </li>
            )}
          </ul>
        </Card>

        {/* Follow-ups */}
        <Card>
          <CardHeader
            title="Who I need to follow up with"
            subtitle="Warm leads cool fast"
            icon={<Icon name="message" className="h-4 w-4" />}
            action={
              <Button variant="outline" size="sm" onClick={() => goto("leads")}>
                Open Leads
              </Button>
            }
          />
          {followUps.length === 0 ? (
            <div className="surface-2 p-5 text-center text-sm text-zinc-500">
              You're caught up. 🔥
            </div>
          ) : (
            <ul className="divide-y divide-ink-800">
              {followUps.map((l) => (
                <li key={l.id} className="flex items-center gap-3 py-2.5">
                  <div className="grid h-9 w-9 place-items-center rounded-lg bg-flame-500/10 text-flame-400 ring-1 ring-flame-500/20">
                    {l.business.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold text-white">
                      {l.business}
                    </div>
                    <div className="truncate text-xs text-zinc-500">
                      {l.owner} · {l.service}
                    </div>
                  </div>
                  <div className="text-right">
                    <Chip status={l.status} />
                    <div className="mt-0.5 text-[11px] text-zinc-500">
                      {formatRelative(l.nextFollowUp)}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* Clients work */}
        <Card>
          <CardHeader
            title="What clients need work"
            subtitle="Active engagements with motion"
            icon={<Icon name="briefcase" className="h-4 w-4" />}
            action={
              <Button variant="outline" size="sm" onClick={() => goto("clients")}>
                Open Clients
              </Button>
            }
          />
          {clientsWork.length === 0 ? (
            <div className="surface-2 p-5 text-center text-sm text-zinc-500">
              No clients in motion right now.
            </div>
          ) : (
            <ul className="space-y-2">
              {clientsWork.map((c) => {
                const total = c.deliverables.length;
                const done = c.deliverables.filter((d) => d.done).length;
                return (
                  <li
                    key={c.id}
                    className="surface-2 flex flex-col gap-2 p-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <div className="truncate text-sm font-semibold text-white">
                          {c.name}
                        </div>
                        <div className="truncate text-xs text-zinc-500">
                          {c.package}
                        </div>
                      </div>
                      <Chip status={c.status} />
                    </div>
                    <div className="flex items-center gap-3">
                      <Progress value={total ? (done / total) * 100 : 0} accent="flame" />
                      <span className="text-xs text-zinc-500">{done}/{total}</span>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>

        {/* Content to post */}
        <Card>
          <CardHeader
            title="What content to post"
            subtitle="Show up daily — show out weekly"
            icon={<Icon name="tiktok" className="h-4 w-4" />}
          />
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!newContent.title.trim()) return;
              addContent({ ...newContent });
              setNewContent({ title: "", channel: "TikTok", due: todayISO() });
            }}
            className="mb-3 grid grid-cols-12 gap-2"
          >
            <input
              value={newContent.title}
              onChange={(e) => setNewContent({ ...newContent, title: e.target.value })}
              placeholder="Idea or hook…"
              className="col-span-7"
            />
            <select
              value={newContent.channel}
              onChange={(e) => setNewContent({ ...newContent, channel: e.target.value })}
              className="col-span-3"
            >
              {["TikTok", "Instagram", "Facebook", "YouTube", "X"].map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
            <Button type="submit" size="sm" className="col-span-2">
              Add
            </Button>
          </form>
          <ul className="space-y-1.5">
            {todaysContent.map((c) => (
              <li
                key={c.id}
                className="group flex items-center gap-3 rounded-lg border border-ink-800 bg-ink-850 px-3 py-2.5"
              >
                <button
                  onClick={() => toggleContent(c.id)}
                  className={`grid h-5 w-5 place-items-center rounded-md border ${
                    c.done
                      ? "border-flame-500 bg-flame-500 text-black"
                      : "border-ink-600 hover:border-flame-500"
                  }`}
                >
                  {c.done && <Icon name="check" className="h-3 w-3" strokeWidth={3} />}
                </button>
                <span className={`flex-1 text-sm ${c.done ? "text-zinc-500 line-through" : "text-zinc-100"}`}>
                  {c.title}
                </span>
                <span className="chip bg-ink-800 text-zinc-400 ring-1 ring-ink-700">
                  {c.channel}
                </span>
                <IconButton
                  onClick={() => deleteContent(c.id)}
                  className="opacity-0 group-hover:opacity-100 hover:!border-rose-500/40 hover:!text-rose-400"
                >
                  <Icon name="trash" className="h-4 w-4" />
                </IconButton>
              </li>
            ))}
            {todaysContent.length === 0 && (
              <li className="surface-2 p-5 text-center text-sm text-zinc-500">
                Stack at least one piece for today.
              </li>
            )}
          </ul>
        </Card>
      </div>

      {/* Money */}
      <Card>
        <CardHeader
          title="How much money I'm trying to make this week"
          subtitle="Goal vs. actual — log every dollar."
          icon={<Icon name="trending" className="h-4 w-4" />}
        />
        <div className="grid gap-5 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            <div className="surface-2 p-4">
              <div className="flex items-end justify-between gap-3">
                <div>
                  <div className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                    This week
                  </div>
                  <div className="mt-1 text-3xl font-extrabold text-white">{usd(total)}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                    Goal
                  </div>
                  <Field label="" className="!gap-0">
                    <input
                      type="number"
                      value={goal}
                      onChange={(e) =>
                        setSettings({ weeklyRevenueGoal: Number(e.target.value) || 0 })
                      }
                      className="w-32 text-right !text-base !font-bold"
                    />
                  </Field>
                </div>
              </div>
              <div className="mt-3">
                <Progress value={pct} accent="flame" />
                <div className="mt-1.5 text-xs text-zinc-400">
                  {pct}% of goal · {usd(Math.max(0, goal - total))} to go
                </div>
              </div>
            </div>
            <form
              className="grid grid-cols-12 gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                if (!newRev.label.trim() || !newRev.amount) return;
                addRevenue(newRev);
                setNewRev({ label: "", amount: 0, date: todayISO() });
              }}
            >
              <input
                value={newRev.label}
                onChange={(e) => setNewRev({ ...newRev, label: e.target.value })}
                placeholder="What for?"
                className="col-span-6"
              />
              <input
                type="number"
                value={newRev.amount || ""}
                onChange={(e) => setNewRev({ ...newRev, amount: Number(e.target.value) })}
                placeholder="$"
                className="col-span-2"
              />
              <input
                type="date"
                value={newRev.date}
                onChange={(e) => setNewRev({ ...newRev, date: e.target.value })}
                className="col-span-2"
              />
              <Button type="submit" size="sm" className="col-span-2">
                Log
              </Button>
            </form>
          </div>
          <div className="surface-2 p-3">
            <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Recent revenue
            </div>
            <ul className="space-y-1.5">
              {state.revenue.slice(0, 8).map((r) => (
                <li
                  key={r.id}
                  className="group flex items-center justify-between gap-2 rounded-md px-2 py-1.5 hover:bg-ink-800"
                >
                  <div className="min-w-0">
                    <div className="truncate text-sm text-white">{r.label}</div>
                    <div className="truncate text-[11px] text-zinc-500">{formatRelative(r.date)}</div>
                  </div>
                  <span className="font-semibold text-emerald-400">{usd(r.amount)}</span>
                  <IconButton
                    onClick={() => deleteRevenue(r.id)}
                    className="opacity-0 group-hover:opacity-100 hover:!border-rose-500/40 hover:!text-rose-400"
                  >
                    <Icon name="close" className="h-3 w-3" />
                  </IconButton>
                </li>
              ))}
              {state.revenue.length === 0 && (
                <li className="p-5 text-center text-sm text-zinc-500">
                  No income logged yet.
                </li>
              )}
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}

function MiniStat({ label, value, accent }) {
  return (
    <div
      className={`surface-2 p-3 ${accent ? "border-flame-500/40" : ""}`}
    >
      <div className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">
        {label}
      </div>
      <div className={`mt-1 text-xl font-bold ${accent ? "text-flame-400" : "text-white"}`}>
        {value}
      </div>
    </div>
  );
}
