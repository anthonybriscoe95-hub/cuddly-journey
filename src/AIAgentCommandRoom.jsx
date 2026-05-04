import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";

import {
  agents,
  techStack,
  backendRoutes,
  taskTemplates,
  starterMessages,
} from "./data.js";
import {
  asArray,
  asText,
  clearStoredState,
  createTask,
  fetchJsonWithTimeout,
  getAgentByName,
  getFreshSteps,
  isRiskyTaskType,
  makeChatReply,
  normalizeApproval,
  normalizeBackendPayload,
  normalizeLogItem,
  normalizeMessage,
  normalizeOutput,
  normalizeTask,
  nowTime,
  pickAgentForCommand,
  runSelfTests,
  safeLoadState,
  safeSaveState,
  uid,
} from "./utils.js";
import { StatusBadge, StackCard, EmptyState, StatTile, ToastStack } from "./components.jsx";
import {
  AlertIcon,
  BotIcon,
  CalendarIcon,
  CheckIcon,
  ClipboardIcon,
  ClockIcon,
  CopyIcon,
  DollarIcon,
  DownloadIcon,
  GlobeIcon,
  PauseIcon,
  PlayIcon,
  SendIcon,
  StopIcon,
  TrashIcon,
} from "./icons.jsx";

const HEALTH_POLL_INTERVAL_MS = 60_000;
const TASK_FILTERS = ["All", "Queued", "Running", "Waiting", "Done", "Failed", "Cancelled", "Rejected"];
const selfTestResults = runSelfTests();

export default function AIAgentCommandRoom() {
  const savedState = useMemo(() => safeLoadState(), []);

  const [running, setRunning] = useState(true);
  const [selectedName, setSelectedName] = useState(savedState?.selectedName || agents[0].name);
  const [messages, setMessages] = useState(
    savedState?.messages?.length ? savedState.messages : starterMessages
  );
  const [chatInput, setChatInput] = useState("");
  const [taskInput, setTaskInput] = useState(
    "Find 10 local businesses near Claymont DE that need AI automation"
  );
  const [backendStatus, setBackendStatus] = useState("Checking");
  const [tasks, setTasks] = useState(savedState?.tasks || []);
  const [activeTaskId, setActiveTaskId] = useState(null);
  const [activityLog, setActivityLog] = useState(
    savedState?.activityLog?.length
      ? savedState.activityLog
      : [normalizeLogItem({ id: uid("log"), text: "System loaded. Checking backend connection..." })]
  );
  const [outputs, setOutputs] = useState(savedState?.outputs || []);
  const [approvals, setApprovals] = useState(savedState?.approvals || []);
  const [toasts, setToasts] = useState([]);
  const [taskFilter, setTaskFilter] = useState("All");
  const [taskSearch, setTaskSearch] = useState("");
  const [now, setNow] = useState(() => new Date());

  const activeTaskRef = useRef(null);
  const cancelRef = useRef({ taskId: null, controller: null });
  const messagesEndRef = useRef(null);

  const selected = useMemo(() => getAgentByName(selectedName), [selectedName]);
  const passedTests = selfTestResults.filter((result) => result.pass).length;
  const activeTask = tasks.find((task) => task.id === activeTaskId);
  const waitingApprovals = approvals.filter((item) => item.status === "Waiting").length;

  const stats = useMemo(() => {
    const total = tasks.length;
    const done = tasks.filter((task) => task.status === "Done").length;
    const failed = tasks.filter((task) => ["Failed", "Cancelled", "Rejected"].includes(task.status)).length;
    const waiting = tasks.filter((task) => task.status === "Waiting").length;
    return { total, done, failed, waiting };
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    const search = taskSearch.trim().toLowerCase();
    return tasks.filter((task) => {
      if (taskFilter !== "All" && task.status !== taskFilter) return false;
      if (!search) return true;
      return (
        task.command.toLowerCase().includes(search) ||
        task.agentName.toLowerCase().includes(search) ||
        task.type.toLowerCase().includes(search)
      );
    });
  }, [tasks, taskFilter, taskSearch]);

  // Persist workspace
  useEffect(() => {
    safeSaveState({ selectedName, messages, tasks, activityLog, outputs, approvals });
  }, [selectedName, messages, tasks, activityLog, outputs, approvals]);

  // Scroll chat to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  // Live clock
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);

  // Auto-finalize tasks once all their approvals resolve
  useEffect(() => {
    setTasks((current) => {
      let changed = false;
      const next = current.map((task) => {
        if (task.status !== "Waiting") return task;
        const taskApprovals = approvals.filter((approval) => approval.taskId === task.id);
        if (taskApprovals.length === 0) return task;
        const allResolved = taskApprovals.every((approval) => approval.status !== "Waiting");
        if (!allResolved) return task;
        const anyApproved = taskApprovals.some((approval) => approval.status === "Approved");
        changed = true;
        return { ...task, status: anyApproved ? "Done" : "Rejected", progress: 100 };
      });
      return changed ? next : current;
    });
  }, [approvals]);

  const pushToast = useCallback((text, level = "info") => {
    const toast = { id: uid("toast"), text: asText(text), level };
    setToasts((current) => [...current, toast]);
    setTimeout(() => setToasts((current) => current.filter((item) => item.id !== toast.id)), 4500);
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const addLog = useCallback((text, level = "info") => {
    const cleanText = asText(text, "Log entry");
    setActivityLog((current) =>
      [normalizeLogItem({ id: uid("log"), text: cleanText, time: nowTime(), level }), ...asArray(current)].slice(0, 60)
    );
  }, []);

  const checkBackendHealth = useCallback(
    async ({ silent = false } = {}) => {
      try {
        setBackendStatus("Checking");
        const payload = await fetchJsonWithTimeout("/api/health", { method: "GET" }, 8000);
        setBackendStatus("Connected");
        if (!silent) {
          const detail = payload?.openai === false ? " (no OPENAI_API_KEY set)" : "";
          addLog(`Backend connected${detail}.`, "ok");
          pushToast(`Backend connected${detail}.`, "ok");
        }
        return true;
      } catch (error) {
        setBackendStatus("Offline");
        if (!silent) {
          addLog(`Backend offline. ${error.message}`, "error");
          pushToast("Backend is offline. Start the local server.", "error");
        }
        return false;
      }
    },
    [addLog, pushToast]
  );

  // Initial check + periodic poll
  useEffect(() => {
    checkBackendHealth({ silent: true });
    const id = setInterval(() => checkBackendHealth({ silent: true }), HEALTH_POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [checkBackendHealth]);

  function updateTask(taskId, updater) {
    const id = asText(taskId);
    setTasks((current) =>
      asArray(current).map((task) => {
        if (task.id !== id) return task;
        return typeof updater === "function" ? updater(task) : { ...task, ...updater };
      })
    );
  }

  function upsertTask(task) {
    const normalized = normalizeTask(task);
    setTasks((current) => {
      const list = asArray(current);
      return list.some((item) => item.id === normalized.id) ? list : [normalized, ...list];
    });
    return normalized;
  }

  function setTaskStepDone(taskId, stepIndex) {
    updateTask(taskId, (task) => {
      const total = task.steps.length || 1;
      return {
        ...task,
        steps: task.steps.map((step, index) => (index <= stepIndex ? { ...step, done: true } : step)),
        progress: Math.round(((stepIndex + 1) / total) * 100),
      };
    });
  }

  async function callBackendTask(task, signal) {
    const payload = await fetchJsonWithTimeout(
      "/api/agent-task",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          command: task.command,
          taskType: task.type,
          agent: task.agentName,
          safetyMode: "approval-required",
        }),
        signal,
      }
    );
    return normalizeBackendPayload(payload);
  }

  async function callApprovalBackend(approval) {
    return fetchJsonWithTimeout("/api/approval", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ approval, action: "approve" }),
    });
  }

  async function runTask(rawTask) {
    if (activeTaskRef.current) {
      addLog("Another task is already running. Wait until it finishes.", "warn");
      pushToast("A task is already running.", "warn");
      return;
    }

    const task = upsertTask(rawTask);
    activeTaskRef.current = task.id;
    setActiveTaskId(task.id);

    const connected = backendStatus === "Connected" || (await checkBackendHealth({ silent: true }));
    if (!connected) {
      updateTask(task.id, { status: "Failed", progress: 0, steps: getFreshSteps() });
      addLog("Task blocked: backend is not connected.", "error");
      pushToast("Backend is offline — task blocked.", "error");
      activeTaskRef.current = null;
      setActiveTaskId(null);
      return;
    }

    const controller = new AbortController();
    cancelRef.current = { taskId: task.id, controller };

    updateTask(task.id, { status: "Running", progress: 0, steps: getFreshSteps() });
    setSelectedName(task.agentName);
    addLog(`${task.agentName} started backend task: ${task.command}`);

    try {
      setTaskStepDone(task.id, 0);
      setTaskStepDone(task.id, 1);
      const output = await callBackendTask(task, controller.signal);
      setTaskStepDone(task.id, 2);
      setTaskStepDone(task.id, 3);
      setTaskStepDone(task.id, 4);

      const outputRecord = normalizeOutput({
        id: uid("output"),
        taskId: task.id,
        agentName: task.agentName,
        command: task.command,
        summary: output.summary,
        results: output.results,
        createdAt: nowTime(),
      });

      const approvalRecords = output.approvals.map((approval) =>
        normalizeApproval({ ...approval, taskId: task.id, agentName: task.agentName })
      );
      const inferredApprovals =
        approvalRecords.length === 0 && isRiskyTaskType(task.type)
          ? [
              normalizeApproval({
                id: uid("approval"),
                title: `Approve before ${task.type.replaceAll("_", " ")}`,
                type: task.type,
                detail: `${task.agentName} prepared output. Review before any action is taken.`,
                draft: outputRecord.results.map((result) => result.title).filter(Boolean).slice(0, 5),
                taskId: task.id,
                agentName: task.agentName,
              }),
            ]
          : approvalRecords;

      setOutputs((current) => [outputRecord, ...asArray(current)]);
      if (inferredApprovals.length > 0) {
        setApprovals((current) => [...inferredApprovals, ...asArray(current)]);
        updateTask(task.id, { status: "Waiting", progress: 100 });
        pushToast(`${task.agentName} needs approval before continuing.`, "warn");
      } else {
        updateTask(task.id, { status: "Done", progress: 100 });
        pushToast(`${task.agentName} finished.`, "ok");
      }

      addLog(
        `${task.agentName} returned ${outputRecord.results.length} result${
          outputRecord.results.length === 1 ? "" : "s"
        }.`,
        "ok"
      );
    } catch (error) {
      const isAbort = controller.signal.aborted;
      updateTask(task.id, { status: isAbort ? "Cancelled" : "Failed" });
      addLog(`Task ${isAbort ? "cancelled" : "failed"}: ${error.message}`, isAbort ? "warn" : "error");
      if (!isAbort) pushToast(`Task failed: ${error.message}`, "error");
    } finally {
      activeTaskRef.current = null;
      cancelRef.current = { taskId: null, controller: null };
      setActiveTaskId(null);
    }
  }

  function cancelActiveTask() {
    const { controller, taskId } = cancelRef.current;
    if (!controller || !taskId) return;
    controller.abort(new Error("Cancelled by user"));
    addLog("Cancel requested for the running task.", "warn");
  }

  function deleteTask(taskId) {
    if (taskId === activeTaskId) {
      pushToast("Cancel the running task first.", "warn");
      return;
    }
    setTasks((current) => current.filter((task) => task.id !== taskId));
    setApprovals((current) => current.filter((approval) => approval.taskId !== taskId));
  }

  function addTask(command = taskInput) {
    const clean = asText(command).trim();
    if (!clean) {
      pushToast("Type a task first.", "warn");
      return null;
    }
    const task = createTask(clean);
    upsertTask(task);
    setTaskInput("");
    addLog(`Queued ${task.agentName}: ${task.command}`);
    return task;
  }

  function addAndRunTask() {
    const task = addTask(taskInput);
    if (task) runTask(task);
  }

  async function approveItem(approvalId) {
    const approval = approvals.find((item) => item.id === approvalId);
    if (!approval) {
      addLog("Approval not found.", "error");
      return;
    }
    setApprovals((current) =>
      asArray(current).map((item) => (item.id === approvalId ? { ...item, status: "Approved" } : item))
    );
    addLog("Approval accepted. Sending approval to backend...", "ok");
    try {
      const connected = backendStatus === "Connected" || (await checkBackendHealth({ silent: true }));
      if (!connected) throw new Error("Backend is offline.");
      await callApprovalBackend({ ...approval, status: "Approved" });
      addLog("Backend confirmed the approved action.", "ok");
    } catch (error) {
      addLog(`Approval saved locally, but backend action did not run: ${error.message}`, "error");
      pushToast("Approval saved, but backend rejected it.", "error");
    }
  }

  function rejectItem(approvalId) {
    setApprovals((current) =>
      asArray(current).map((item) => (item.id === approvalId ? { ...item, status: "Rejected" } : item))
    );
    addLog("Approval rejected. No action taken.", "warn");
  }

  function clearWorkspace() {
    if (activeTaskRef.current) {
      pushToast("Cancel the running task before clearing the workspace.", "warn");
      return;
    }
    setTasks([]);
    setOutputs([]);
    setApprovals([]);
    setMessages(starterMessages);
    setActivityLog([normalizeLogItem({ id: uid("log"), text: "Workspace cleared." })]);
    clearStoredState();
    pushToast("Workspace cleared.", "ok");
  }

  function sendChatMessage() {
    const text = chatInput.trim();
    if (!text) return;
    const userMessage = normalizeMessage({ id: uid("msg"), sender: "You", text, time: nowTime() });
    const reply = makeChatReply(text);
    setMessages((current) => [...asArray(current), userMessage, ...(reply ? [reply] : [])]);
    setChatInput("");
  }

  async function copyOutput(output) {
    if (typeof navigator === "undefined" || !navigator.clipboard) {
      pushToast("Clipboard API not available.", "warn");
      return;
    }
    const text = [
      `Task: ${output.command}`,
      `Agent: ${output.agentName}`,
      `Time: ${output.createdAt}`,
      "",
      `Summary: ${output.summary}`,
      "",
      ...output.results.map(
        (result, index) =>
          `${index + 1}. ${result.title}\n   ${result.snippet}${result.url ? `\n   ${result.url}` : ""}`
      ),
    ].join("\n");
    try {
      await navigator.clipboard.writeText(text);
      pushToast("Output copied to clipboard.", "ok");
    } catch (error) {
      pushToast(`Copy failed: ${error.message}`, "error");
    }
  }

  function exportOutputs() {
    if (typeof window === "undefined") return;
    const payload = JSON.stringify({ exportedAt: new Date().toISOString(), outputs, approvals }, null, 2);
    const blob = new Blob([payload], { type: "application/json" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `agent-room-${Date.now()}.json`;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  // Keyboard shortcuts
  useEffect(() => {
    function onKeyDown(event) {
      if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
        event.preventDefault();
        addAndRunTask();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taskInput, backendStatus]);

  return (
    <div className="min-h-screen bg-slate-950 p-4 text-white md:p-8">
      <ToastStack toasts={toasts} onDismiss={dismissToast} />
      <div className="mx-auto max-w-7xl space-y-6">
        <Header
          backendStatus={backendStatus}
          onCheckBackend={() => checkBackendHealth()}
          running={running}
          onToggleRunning={() => setRunning((value) => !value)}
          now={now}
        />

        <StatsBar stats={stats} waitingApprovals={waitingApprovals} backendStatus={backendStatus} />

        <div className="grid gap-6 lg:grid-cols-[1.25fr_.75fr]">
          <AgentRoom
            running={running}
            selectedName={selected.name}
            activeAgentName={activeTask?.agentName}
            onSelect={setSelectedName}
          />
          <div className="space-y-6">
            <SelectedAgentCard selected={selected} />
            <SafetyBanner />
            <SystemStatus
              backendStatus={backendStatus}
              waitingApprovals={waitingApprovals}
              activeTask={activeTask}
              onCancel={cancelActiveTask}
            />
          </div>
        </div>

        <TaskRunner
          taskInput={taskInput}
          setTaskInput={setTaskInput}
          backendStatus={backendStatus}
          onAdd={() => addTask()}
          onAddAndRun={addAndRunTask}
          activeTask={activeTask}
          templates={taskTemplates}
        />

        <div className="grid gap-6 lg:grid-cols-[.9fr_1.1fr]">
          <TaskQueue
            tasks={filteredTasks}
            allCount={tasks.length}
            taskFilter={taskFilter}
            setTaskFilter={setTaskFilter}
            taskSearch={taskSearch}
            setTaskSearch={setTaskSearch}
            activeTaskId={activeTaskId}
            onRun={runTask}
            onCancel={cancelActiveTask}
            onDelete={deleteTask}
          />
          <OutputsPanel outputs={outputs} onCopy={copyOutput} onExport={exportOutputs} />
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_.9fr]">
          <ApprovalCenter approvals={approvals} onApprove={approveItem} onReject={rejectItem} />
          <ChatPanel
            messages={messages}
            chatInput={chatInput}
            setChatInput={setChatInput}
            onSend={sendChatMessage}
            messagesEndRef={messagesEndRef}
          />
        </div>

        <RoutesPanel backendRoutes={backendRoutes} />
        <StackPanel />

        <div className="grid gap-6 lg:grid-cols-[.8fr_1.2fr]">
          <UseModeCard onClear={clearWorkspace} />
          <SelfTestPanel results={selfTestResults} passed={passedTests} />
        </div>

        <ActivityLogPanel activityLog={activityLog} />

        <Footer now={now} />
      </div>
    </div>
  );
}

function Header({ backendStatus, onCheckBackend, running, onToggleRunning, now }) {
  return (
    <div className="flex flex-col justify-between gap-4 rounded-[2rem] border border-white/10 bg-white/5 p-5 shadow-2xl md:flex-row md:items-center">
      <div>
        <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-sm text-emerald-200">
          <DollarIcon size={16} /> Real Agent Dashboard
        </div>
        <h1 className="text-3xl font-black tracking-tight md:text-5xl">AI Agent Command Room</h1>
        <p className="mt-2 max-w-3xl text-slate-300">
          A local-first command center. Real tasks run when your backend is connected, your workspace
          is saved on this device, and risky actions still need your approval.
        </p>
        <p className="mt-2 text-xs text-slate-500">
          {now.toLocaleDateString()} · {now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </p>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-2 text-sm">
          <span className="opacity-60">Backend</span>
          <StatusBadge status={backendStatus} />
        </div>
        <button
          onClick={onCheckBackend}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-300 px-5 py-3 font-bold text-slate-950 shadow-lg transition hover:scale-[1.02]"
        >
          <GlobeIcon size={18} /> Check Backend
        </button>
        <button
          onClick={onToggleRunning}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 font-bold text-slate-950 shadow-lg transition hover:scale-[1.02]"
        >
          {running ? <PauseIcon size={18} /> : <PlayIcon size={18} />}
          {running ? "Pause Agents" : "Start Agents"}
        </button>
      </div>
    </div>
  );
}

function StatsBar({ stats, waitingApprovals, backendStatus }) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
      <StatTile label="Total tasks" value={stats.total} />
      <StatTile label="Done" value={stats.done} accent="text-emerald-300" />
      <StatTile label="Failed / Cancelled" value={stats.failed} accent="text-red-300" />
      <StatTile label="Awaiting approval" value={waitingApprovals + stats.waiting} accent="text-amber-300" />
      <StatTile label="Backend" value={backendStatus} accent={backendStatus === "Connected" ? "text-emerald-300" : "text-red-300"} />
    </div>
  );
}

function AgentRoom({ running, selectedName, activeAgentName, onSelect }) {
  // Memoize keyframe arrays so framer-motion doesn't restart animation each render.
  const keyframes = useMemo(
    () =>
      agents.map((agent) => ({
        left: agent.x.map((n) => `${n}%`),
        top: agent.y.map((n) => `${n}%`),
      })),
    []
  );

  return (
    <div className="rounded-[2rem] border border-white/10 bg-slate-900 p-4 shadow-2xl">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black">Agent Room</h2>
          <p className="text-sm text-slate-400">Agents move while your workspace is active. Click an agent to inspect skills.</p>
        </div>
        <div className="rounded-full bg-emerald-400/10 px-3 py-1 text-sm font-bold text-emerald-200">
          {running ? "Live" : "Paused"}
        </div>
      </div>
      <div className="relative h-[500px] overflow-hidden rounded-[1.5rem] border border-white/10 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,.28),transparent_35%),radial-gradient(circle_at_78%_65%,rgba(16,185,129,.20),transparent_28%),linear-gradient(135deg,#0f172a,#111827)]">
        <div className="absolute inset-6 rounded-[1.25rem] border border-white/10 bg-white/[0.03]" />
        <div className="absolute left-8 top-8 rounded-2xl border border-white/10 bg-black/20 p-4 backdrop-blur">
          <p className="text-xs uppercase tracking-[.25em] text-slate-400">Control Desk</p>
          <p className="mt-1 font-bold">Approvals + Reports</p>
        </div>
        <div className="absolute bottom-8 left-8 rounded-2xl border border-white/10 bg-black/20 p-4 backdrop-blur">
          <p className="text-xs uppercase tracking-[.25em] text-slate-400">Sales Board</p>
          <p className="mt-1 font-bold">Leads + Replies</p>
        </div>
        <div className="absolute right-8 top-8 rounded-2xl border border-white/10 bg-black/20 p-4 backdrop-blur">
          <p className="text-xs uppercase tracking-[.25em] text-slate-400">Content Lab</p>
          <p className="mt-1 font-bold">Posts + Scripts</p>
        </div>
        <div className="absolute bottom-8 right-8 rounded-2xl border border-white/10 bg-black/20 p-4 backdrop-blur">
          <p className="text-xs uppercase tracking-[.25em] text-slate-400">Ops Table</p>
          <p className="mt-1 font-bold">Calendar + Sheets</p>
        </div>
        {agents.map((agent, index) => {
          const Icon = agent.icon;
          const isActive = activeAgentName === agent.name;
          const isSelected = selectedName === agent.name;
          return (
            <motion.button
              key={agent.name}
              onClick={() => onSelect(agent.name)}
              animate={running ? keyframes[index] : { left: `${agent.x[0]}%`, top: `${agent.y[0]}%` }}
              transition={{ duration: 14 + index * 2, repeat: running ? Infinity : 0, ease: "easeInOut" }}
              className={`absolute z-10 -translate-x-1/2 -translate-y-1/2 rounded-3xl border p-3 text-left shadow-2xl backdrop-blur transition ${
                isSelected
                  ? "border-emerald-300 bg-emerald-300/20"
                  : "border-white/15 bg-white/10 hover:bg-white/15"
              } ${isActive ? "animate-pulseRing" : ""}`}
              style={{ left: `${agent.x[0]}%`, top: `${agent.y[0]}%` }}
              aria-label={`Select ${agent.name}`}
            >
              <div className="flex items-center gap-3">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white text-slate-950">
                  <Icon size={24} />
                </div>
                <div>
                  <p className="font-black">{agent.name}</p>
                  <p className={`text-xs ${isActive ? "text-emerald-200" : "text-slate-300"}`}>
                    {isActive ? "Running task..." : "Ready"}
                  </p>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

function SelectedAgentCard({ selected }) {
  const Icon = selected.icon;
  return (
    <div className="rounded-[2rem] border border-white/10 bg-white/5 p-5 shadow-2xl">
      <div className="flex items-start gap-3">
        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white text-slate-950">
          <Icon size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-black">{selected.name}</h2>
          <p className="mt-1 text-sm text-slate-300">{selected.role}</p>
        </div>
      </div>
      <div className="mt-5 flex flex-wrap gap-2">
        {selected.skills.map((skill) => (
          <span
            key={skill}
            className="rounded-full border border-white/10 bg-slate-950/60 px-3 py-1 text-xs font-bold text-slate-300"
          >
            {skill}
          </span>
        ))}
      </div>
    </div>
  );
}

function SafetyBanner() {
  return (
    <div className="rounded-[2rem] border border-amber-400/20 bg-amber-400/10 p-5">
      <div className="flex gap-3">
        <AlertIcon className="mt-1 text-amber-200" size={22} />
        <div>
          <h3 className="font-black text-amber-100">Safety Rule</h3>
          <p className="mt-1 text-sm text-amber-50/80">
            Agents can research and create drafts. They still need your approval before sending,
            posting, buying, deleting, or changing accounts.
          </p>
        </div>
      </div>
    </div>
  );
}

function SystemStatus({ backendStatus, waitingApprovals, activeTask, onCancel }) {
  return (
    <div className="rounded-[2rem] border border-white/10 bg-white/5 p-5 shadow-2xl">
      <h2 className="mb-3 text-xl font-black">System Status</h2>
      <div className="space-y-3 text-sm">
        <div className="flex items-center justify-between rounded-2xl bg-slate-950/50 p-3">
          <span>Backend</span>
          <StatusBadge status={backendStatus} />
        </div>
        <div className="flex items-center justify-between rounded-2xl bg-slate-950/50 p-3">
          <span>Approvals waiting</span>
          <span className="font-black text-white">{waitingApprovals}</span>
        </div>
        <div className="flex items-center justify-between rounded-2xl bg-slate-950/50 p-3">
          <span>Active task</span>
          {activeTask ? (
            <button
              onClick={onCancel}
              className="inline-flex items-center gap-1 rounded-full bg-red-300 px-3 py-1 text-xs font-black text-slate-950"
            >
              <StopIcon size={14} /> Cancel
            </button>
          ) : (
            <span className="text-xs text-slate-500">none</span>
          )}
        </div>
      </div>
    </div>
  );
}

function TaskRunner({ taskInput, setTaskInput, backendStatus, onAdd, onAddAndRun, activeTask, templates }) {
  return (
    <div className="rounded-[2rem] border border-white/10 bg-white/5 p-5 shadow-2xl">
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
        <div>
          <h2 className="text-2xl font-black">Run a Backend Task</h2>
          <p className="mt-1 text-sm text-slate-300">
            Sends your command to <span className="font-mono text-blue-200">/api/agent-task</span>. If
            the backend is offline, the task is blocked instead of showing fake output.
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Tip: press <kbd className="rounded border border-white/15 bg-slate-950 px-1.5 py-0.5">Cmd/Ctrl</kbd>+<kbd className="rounded border border-white/15 bg-slate-950 px-1.5 py-0.5">Enter</kbd> to run.
          </p>
        </div>
        <StatusBadge status={backendStatus} />
      </div>
      <div className="mt-5 flex flex-col gap-3 lg:flex-row">
        <input
          value={taskInput}
          onChange={(event) => setTaskInput(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              onAddAndRun();
            } else if (event.key === "Escape") {
              setTaskInput("");
            }
          }}
          placeholder="Tell your agents what to do..."
          className="flex-1 rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm outline-none placeholder:text-slate-500 focus:border-blue-300"
        />
        <button
          onClick={onAdd}
          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/10 px-5 py-3 font-bold text-white shadow-lg transition hover:scale-[1.02]"
        >
          <ClipboardIcon size={18} /> Add Task
        </button>
        <button
          onClick={onAddAndRun}
          disabled={Boolean(activeTask)}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-300 px-5 py-3 font-bold text-slate-950 shadow-lg transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <PlayIcon size={18} /> Run Agent Task
        </button>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {templates.map((template) => (
          <button
            key={template}
            onClick={() => setTaskInput(template)}
            className="rounded-full border border-white/10 bg-slate-950/50 px-3 py-2 text-xs font-bold text-slate-300 transition hover:bg-white/10"
          >
            {template}
          </button>
        ))}
      </div>
    </div>
  );
}

function TaskQueue({
  tasks,
  allCount,
  taskFilter,
  setTaskFilter,
  taskSearch,
  setTaskSearch,
  activeTaskId,
  onRun,
  onCancel,
  onDelete,
}) {
  return (
    <div className="rounded-[2rem] border border-white/10 bg-white/5 p-5 shadow-2xl">
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-black">Task Queue</h2>
          <p className="text-xs text-slate-500">
            {tasks.length} of {allCount} task{allCount === 1 ? "" : "s"}
          </p>
        </div>
        <input
          value={taskSearch}
          onChange={(event) => setTaskSearch(event.target.value)}
          placeholder="Search tasks..."
          className="rounded-2xl border border-white/10 bg-slate-950 px-3 py-2 text-xs outline-none focus:border-blue-300"
        />
      </div>
      <div className="mb-3 flex flex-wrap gap-1">
        {TASK_FILTERS.map((filter) => (
          <button
            key={filter}
            onClick={() => setTaskFilter(filter)}
            className={`rounded-full border px-3 py-1 text-xs font-bold transition ${
              taskFilter === filter
                ? "border-blue-300 bg-blue-300 text-slate-950"
                : "border-white/10 bg-slate-950/50 text-slate-300 hover:bg-white/10"
            }`}
          >
            {filter}
          </button>
        ))}
      </div>
      <div className="space-y-3">
        {tasks.length === 0 && <EmptyState>No matching tasks. Run one above or change the filter.</EmptyState>}
        {tasks.map((task) => (
          <div key={task.id} className="rounded-2xl border border-white/10 bg-slate-950/50 p-4">
            <div className="flex flex-col justify-between gap-2 md:flex-row md:items-center">
              <div>
                <p className="font-black text-white">{task.command}</p>
                <p className="mt-1 text-xs text-slate-500">
                  {task.agentName} · {task.type.replaceAll("_", " ")} · {task.createdAt}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge status={task.status} />
                {task.id === activeTaskId ? (
                  <button
                    onClick={onCancel}
                    className="inline-flex items-center gap-1 rounded-full bg-red-300 px-3 py-1 text-xs font-black text-slate-950"
                  >
                    <StopIcon size={14} /> Stop
                  </button>
                ) : ["Queued", "Failed", "Cancelled"].includes(task.status) ? (
                  <button
                    onClick={() => onRun(task)}
                    className="rounded-full bg-blue-300 px-3 py-1 text-xs font-black text-slate-950"
                  >
                    Run
                  </button>
                ) : null}
                <button
                  onClick={() => onDelete(task.id)}
                  aria-label="Delete task"
                  className="grid h-7 w-7 place-items-center rounded-full border border-white/10 bg-slate-950 text-slate-300 transition hover:border-red-300 hover:text-red-300"
                >
                  <TrashIcon size={14} />
                </button>
              </div>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-blue-300 transition-all"
                style={{ width: `${task.progress}%` }}
              />
            </div>
            <div className="mt-3 grid gap-2 md:grid-cols-2">
              {task.steps.map((step) => (
                <div key={step.label} className="flex items-center gap-2 text-xs text-slate-400">
                  {step.done ? <CheckIcon size={15} className="text-emerald-300" /> : <ClockIcon size={15} />}
                  {step.label}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function OutputsPanel({ outputs, onCopy, onExport }) {
  return (
    <div className="rounded-[2rem] border border-white/10 bg-white/5 p-5 shadow-2xl">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-black">Agent Outputs</h2>
        {outputs.length > 0 && (
          <button
            onClick={onExport}
            className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-slate-950 px-3 py-1 text-xs font-bold text-slate-300 hover:bg-white/10"
          >
            <DownloadIcon size={14} /> Export JSON
          </button>
        )}
      </div>
      <div className="space-y-4">
        {outputs.length === 0 && <EmptyState>Backend outputs will appear here after a task runs.</EmptyState>}
        {outputs.map((output) => (
          <div key={output.id} className="rounded-2xl border border-white/10 bg-slate-950/50 p-4">
            <div className="mb-3 flex flex-col justify-between gap-2 md:flex-row md:items-start">
              <div>
                <p className="text-xs uppercase tracking-[.2em] text-slate-500">
                  {output.agentName} · {output.createdAt}
                </p>
                <h3 className="mt-1 font-black text-white">{output.command}</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onCopy(output)}
                  className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-slate-950 px-3 py-1 text-xs font-bold text-slate-300 hover:bg-white/10"
                >
                  <CopyIcon size={14} /> Copy
                </button>
                <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-bold text-emerald-200">Done</span>
              </div>
            </div>
            <p className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-3 text-sm text-emerald-100">
              {output.summary}
            </p>
            <div className="mt-3 space-y-2">
              {output.results.length === 0 && (
                <p className="text-sm text-slate-400">Backend returned no result rows.</p>
              )}
              {output.results.map((result, index) => (
                <div key={`${result.title}-${index}`} className="rounded-2xl border border-white/10 bg-white/5 p-3">
                  <div className="flex flex-col justify-between gap-2 md:flex-row md:items-start">
                    <div>
                      <p className="font-bold text-white">{result.title}</p>
                      <p className="mt-1 text-sm text-slate-400">{result.snippet}</p>
                    </div>
                    <div className="flex flex-col items-start gap-1 md:items-end">
                      <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-slate-300">
                        {result.source}
                      </span>
                      {typeof result.score !== "undefined" && (
                        <span className="text-xs text-emerald-200">Score {result.score}</span>
                      )}
                    </div>
                  </div>
                  {result.url && (
                    <a
                      href={result.url}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 inline-block text-xs font-bold text-blue-200 underline underline-offset-4"
                    >
                      Open source
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ApprovalCenter({ approvals, onApprove, onReject }) {
  return (
    <div className="rounded-[2rem] border border-white/10 bg-white/5 p-5 shadow-2xl">
      <h2 className="mb-4 text-xl font-black">Approval Center</h2>
      <div className="space-y-3">
        {approvals.length === 0 && (
          <EmptyState>No approvals yet. Tasks involving sending, posting, scheduling, or account changes appear here.</EmptyState>
        )}
        {approvals.map((approval) => (
          <div key={approval.id} className="rounded-2xl border border-amber-400/20 bg-amber-400/10 p-4">
            <div className="flex flex-col justify-between gap-2 md:flex-row md:items-start">
              <div>
                <p className="text-xs uppercase tracking-[.2em] text-amber-200/70">{approval.agentName}</p>
                <h3 className="font-black text-amber-50">{approval.title}</h3>
                <p className="mt-1 text-sm text-amber-50/80">{approval.detail}</p>
              </div>
              <StatusBadge status={approval.status} />
            </div>
            {approval.draft.length > 0 && (
              <div className="mt-3 rounded-2xl border border-white/10 bg-slate-950/40 p-3 text-xs text-slate-300">
                {approval.draft.slice(0, 5).map((line, index) => (
                  <p key={`${line}-${index}`} className="mb-1">• {line}</p>
                ))}
                {approval.draft.length > 5 && <p>• +{approval.draft.length - 5} more</p>}
              </div>
            )}
            {approval.status === "Waiting" && (
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  onClick={() => onApprove(approval.id)}
                  className="rounded-full bg-emerald-300 px-4 py-2 text-xs font-black text-slate-950"
                >
                  Approve
                </button>
                <button
                  onClick={() => onReject(approval.id)}
                  className="rounded-full bg-white/10 px-4 py-2 text-xs font-black text-white"
                >
                  Reject
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function ChatPanel({ messages, chatInput, setChatInput, onSend, messagesEndRef }) {
  return (
    <div className="rounded-[2rem] border border-white/10 bg-white/5 p-5 shadow-2xl">
      <h2 className="mb-3 text-xl font-black">Chat With The Team</h2>
      <div className="h-72 overflow-auto rounded-2xl border border-white/10 bg-slate-950/60 p-4">
        {messages.map((message) => {
          const isYou = message.sender === "You";
          return (
            <div
              key={message.id}
              className={`mb-3 max-w-[90%] rounded-2xl p-3 text-sm ${
                isYou
                  ? "ml-auto bg-blue-300/15 text-blue-100"
                  : "bg-white/5 text-slate-200"
              }`}
            >
              <p className="text-[11px] uppercase tracking-[.2em] text-slate-500">
                {message.sender}
                {message.time ? ` · ${message.time}` : ""}
              </p>
              <p className="mt-1 whitespace-pre-wrap">{message.text}</p>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
      <div className="mt-3 flex gap-2">
        <input
          value={chatInput}
          onChange={(event) => setChatInput(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              onSend();
            }
          }}
          placeholder="Ask: what can you do for me?"
          className="flex-1 rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm outline-none placeholder:text-slate-500 focus:border-emerald-300"
        />
        <button
          onClick={onSend}
          className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-300 text-slate-950 shadow-lg transition hover:scale-105"
          aria-label="Send message"
        >
          <SendIcon size={18} />
        </button>
      </div>
    </div>
  );
}

function RoutesPanel({ backendRoutes }) {
  return (
    <div className="rounded-[2rem] border border-white/10 bg-white/5 p-5 shadow-2xl">
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
        <div>
          <h2 className="text-2xl font-black">Required Backend Routes</h2>
          <p className="mt-1 text-sm text-slate-300">These are the server routes your localhost app expects.</p>
        </div>
        <div className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-sm font-bold text-emerald-200">
          {backendRoutes.length} routes
        </div>
      </div>
      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {backendRoutes.map((item) => (
          <div key={item.route} className="rounded-2xl border border-white/10 bg-slate-950/50 p-4">
            <p className="font-mono text-sm font-black text-blue-200">{item.route}</p>
            <p className="mt-2 text-sm text-slate-400">{item.purpose}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function StackPanel() {
  return (
    <div className="rounded-[2rem] border border-white/10 bg-white/5 p-5 shadow-2xl">
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
        <div>
          <h2 className="text-2xl font-black">Automation Stack</h2>
          <p className="mt-1 text-sm text-slate-300">The exact stack you asked for.</p>
        </div>
        <div className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-sm font-bold text-emerald-200">
          {techStack.length} layers
        </div>
      </div>
      <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {techStack.map((item) => (
          <StackCard key={item.name} item={item} />
        ))}
      </div>
    </div>
  );
}

function UseModeCard({ onClear }) {
  return (
    <div className="rounded-[2rem] border border-white/10 bg-white/5 p-5 text-sm text-slate-300">
      <div className="flex items-center gap-2 font-bold text-white">
        <BotIcon size={18} /> Real Use Mode
      </div>
      <p className="mt-2">
        This UI blocks fake task results. It normalizes old saved data, persists your workspace, and
        keeps API keys and account permissions on the backend only.
      </p>
      <button
        onClick={onClear}
        className="mt-4 inline-flex items-center gap-1 rounded-full border border-red-400/30 bg-red-400/10 px-4 py-2 text-xs font-black text-red-100 transition hover:bg-red-400/20"
      >
        <TrashIcon size={14} /> Clear Workspace
      </button>
    </div>
  );
}

function SelfTestPanel({ results, passed }) {
  return (
    <div className="rounded-[2rem] border border-white/10 bg-slate-900 p-5 text-sm text-slate-300">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="font-black text-white">Built-in Self Tests</h2>
          <p className="mt-1">These verify routing, normalization, payload handling, and chat behavior.</p>
        </div>
        <div className="rounded-full bg-emerald-400/10 px-3 py-1 font-bold text-emerald-200">
          {passed}/{results.length} passed
        </div>
      </div>
      <div className="mt-4 grid gap-2 md:grid-cols-2">
        {results.map((result) => (
          <div
            key={result.name}
            className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 p-3"
          >
            {result.pass ? (
              <CheckIcon className="text-emerald-300" size={18} />
            ) : (
              <AlertIcon className="text-amber-300" size={18} />
            )}
            <span>{result.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ActivityLogPanel({ activityLog }) {
  return (
    <div className="rounded-[2rem] border border-white/10 bg-white/5 p-5 shadow-2xl">
      <h2 className="mb-4 text-xl font-black">Activity Log</h2>
      <div className="grid gap-2 md:grid-cols-2">
        {activityLog.map((item) => {
          const tone =
            item.level === "error"
              ? "text-red-200"
              : item.level === "warn"
              ? "text-amber-200"
              : item.level === "ok"
              ? "text-emerald-200"
              : "text-slate-300";
          return (
            <div
              key={item.id}
              className="rounded-2xl border border-white/10 bg-slate-950/50 p-3 text-sm"
            >
              <span className="text-slate-500">{item.time}</span>{" "}
              <span className={tone}>— {item.text}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Footer({ now }) {
  return (
    <div className="pt-4 text-center text-xs text-slate-500">
      AI Agent Command Room · workspace persists locally · {now.getFullYear()}
    </div>
  );
}
