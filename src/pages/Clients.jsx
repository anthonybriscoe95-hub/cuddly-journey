import { useState } from "react";
import { Card, CardHeader } from "../components/Card.jsx";
import Chip, { CLIENT_STATUSES } from "../components/Chip.jsx";
import Progress from "../components/Progress.jsx";
import Button, { IconButton } from "../components/Button.jsx";
import Icon from "../components/Icon.jsx";
import Modal from "../components/Modal.jsx";
import Field from "../components/Field.jsx";
import { useStore } from "../state/store.jsx";
import { formatRelative, todayISO, usd } from "../lib/utils.js";

const empty = {
  name: "",
  package: "",
  price: 0,
  dueDate: "",
  status: "In Progress",
  notes: "",
  deliverables: [],
};

export default function Clients() {
  const {
    state,
    addClient,
    updateClient,
    deleteClient,
    toggleDeliverable,
    addDeliverable,
  } = useStore();
  const [editing, setEditing] = useState(null);
  const [draft, setDraft] = useState(empty);
  const [activeId, setActiveId] = useState(null);
  const [newDeliv, setNewDeliv] = useState("");

  const isNew = editing === "new";
  const active = state.clients.find((c) => c.id === activeId);

  const startNew = () => {
    setDraft({ ...empty, dueDate: todayISO() });
    setEditing("new");
  };
  const startEdit = (c) => {
    setDraft(c);
    setEditing(c.id);
  };
  const close = () => {
    setEditing(null);
    setDraft(empty);
  };
  const save = () => {
    if (!draft.name.trim()) return;
    if (isNew) addClient(draft);
    else updateClient(editing, draft);
    close();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white">Active clients</h2>
          <p className="text-sm text-zinc-500">
            {state.clients.length} engaged ·{" "}
            {usd(state.clients.reduce((s, c) => s + Number(c.price || 0), 0))} in active book of business
          </p>
        </div>
        <Button onClick={startNew}>
          <Icon name="plus" className="h-4 w-4" />
          New client
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {state.clients.map((c) => {
          const total = c.deliverables.length;
          const done = c.deliverables.filter((d) => d.done).length;
          const pct = total ? (done / total) * 100 : 0;
          return (
            <button
              key={c.id}
              onClick={() => setActiveId(c.id)}
              className="surface group p-5 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-flame-500/40 animate-fade-in"
            >
              <div className="flex items-start justify-between">
                <div className="min-w-0">
                  <h3 className="truncate text-lg font-bold text-white">{c.name}</h3>
                  <p className="mt-0.5 truncate text-sm text-zinc-400">{c.package}</p>
                </div>
                <Chip status={c.status} />
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <div className="text-[11px] uppercase tracking-wider text-zinc-500">Price</div>
                  <div className="font-semibold text-white">{usd(c.price)}</div>
                </div>
                <div>
                  <div className="text-[11px] uppercase tracking-wider text-zinc-500">Due</div>
                  <div className="font-semibold text-white">
                    {c.dueDate ? formatRelative(c.dueDate) : "—"}
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <div className="mb-1.5 flex items-center justify-between text-xs">
                  <span className="text-zinc-400">Deliverables</span>
                  <span className="text-zinc-500">{done}/{total}</span>
                </div>
                <Progress value={pct} accent={pct === 100 ? "emerald" : "flame"} />
              </div>
            </button>
          );
        })}

        {state.clients.length === 0 && (
          <div className="surface p-10 text-center text-sm text-zinc-500 lg:col-span-2 xl:col-span-3">
            No clients yet. Close a deal and they'll show here.
          </div>
        )}
      </div>

      {/* Detail drawer */}
      <Modal
        open={!!active}
        onClose={() => setActiveId(null)}
        title={active?.name || ""}
        subtitle={active?.package}
        size="lg"
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => {
                startEdit(active);
                setActiveId(null);
              }}
            >
              <Icon name="edit" className="h-4 w-4" />
              Edit
            </Button>
            <Button onClick={() => setActiveId(null)}>Done</Button>
          </>
        }
      >
        {active && (
          <div className="space-y-5">
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="surface-2 p-3">
                <div className="text-[11px] uppercase tracking-wider text-zinc-500">Status</div>
                <div className="mt-1">
                  <select
                    value={active.status}
                    onChange={(e) => updateClient(active.id, { status: e.target.value })}
                    className="w-full !bg-ink-800 !py-1.5 !text-sm"
                  >
                    {CLIENT_STATUSES.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="surface-2 p-3">
                <div className="text-[11px] uppercase tracking-wider text-zinc-500">Price</div>
                <div className="mt-1 text-lg font-bold text-white">{usd(active.price)}</div>
              </div>
              <div className="surface-2 p-3">
                <div className="text-[11px] uppercase tracking-wider text-zinc-500">Due</div>
                <div className="mt-1 text-sm font-semibold text-white">
                  {active.dueDate ? formatRelative(active.dueDate) : "—"}
                </div>
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <div className="text-sm font-semibold text-white">Deliverables</div>
                <span className="text-xs text-zinc-500">
                  {active.deliverables.filter((d) => d.done).length}/
                  {active.deliverables.length}
                </span>
              </div>
              <ul className="space-y-1.5">
                {active.deliverables.map((d) => (
                  <li
                    key={d.id}
                    className="flex items-center gap-3 rounded-lg border border-ink-800 bg-ink-850 px-3 py-2"
                  >
                    <button
                      onClick={() => toggleDeliverable(active.id, d.id)}
                      className={`grid h-5 w-5 place-items-center rounded-md border ${
                        d.done
                          ? "border-flame-500 bg-flame-500 text-black"
                          : "border-ink-600 hover:border-flame-500"
                      }`}
                    >
                      {d.done && <Icon name="check" className="h-3 w-3" strokeWidth={3} />}
                    </button>
                    <span className={`flex-1 text-sm ${d.done ? "text-zinc-500 line-through" : "text-zinc-100"}`}>
                      {d.title}
                    </span>
                  </li>
                ))}
              </ul>
              <form
                className="mt-2 flex gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!newDeliv.trim()) return;
                  addDeliverable(active.id, newDeliv.trim());
                  setNewDeliv("");
                }}
              >
                <input
                  value={newDeliv}
                  onChange={(e) => setNewDeliv(e.target.value)}
                  placeholder="Add a deliverable…"
                  className="flex-1"
                />
                <Button size="sm">Add</Button>
              </form>
            </div>

            {active.notes && (
              <div>
                <div className="mb-1 text-sm font-semibold text-white">Notes</div>
                <div className="surface-2 whitespace-pre-wrap p-3 text-sm text-zinc-300">
                  {active.notes}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Edit modal */}
      <Modal
        open={editing !== null}
        onClose={close}
        title={isNew ? "New client" : "Edit client"}
        size="md"
        footer={
          <>
            {!isNew && (
              <Button
                variant="danger"
                className="mr-auto"
                onClick={() => {
                  if (confirm("Delete this client?")) {
                    deleteClient(editing);
                    close();
                  }
                }}
              >
                <Icon name="trash" className="h-4 w-4" />
                Delete
              </Button>
            )}
            <Button variant="ghost" onClick={close}>Cancel</Button>
            <Button onClick={save}>{isNew ? "Create" : "Save"}</Button>
          </>
        }
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Client name" required>
            <input
              value={draft.name}
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              placeholder="Pine Ridge HVAC"
            />
          </Field>
          <Field label="Service package">
            <input
              value={draft.package}
              onChange={(e) => setDraft({ ...draft, package: e.target.value })}
              placeholder="Website Build + SEO Starter"
            />
          </Field>
          <Field label="Price (USD)">
            <input
              type="number"
              value={draft.price}
              onChange={(e) => setDraft({ ...draft, price: Number(e.target.value) })}
            />
          </Field>
          <Field label="Due date">
            <input
              type="date"
              value={draft.dueDate}
              onChange={(e) => setDraft({ ...draft, dueDate: e.target.value })}
            />
          </Field>
          <Field label="Status">
            <select
              value={draft.status}
              onChange={(e) => setDraft({ ...draft, status: e.target.value })}
            >
              {CLIENT_STATUSES.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </Field>
          <Field label="Notes" className="sm:col-span-2">
            <textarea
              rows={3}
              value={draft.notes}
              onChange={(e) => setDraft({ ...draft, notes: e.target.value })}
            />
          </Field>
        </div>
      </Modal>
    </div>
  );
}
