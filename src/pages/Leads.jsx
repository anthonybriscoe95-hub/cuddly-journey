import { useMemo, useState } from "react";
import { Card, CardHeader } from "../components/Card.jsx";
import Chip, { LEAD_STATUSES } from "../components/Chip.jsx";
import Button, { IconButton } from "../components/Button.jsx";
import Icon from "../components/Icon.jsx";
import Modal from "../components/Modal.jsx";
import Field from "../components/Field.jsx";
import { useStore } from "../state/store.jsx";
import { formatDate, formatRelative, cls } from "../lib/utils.js";

const empty = {
  business: "",
  owner: "",
  phone: "",
  email: "",
  location: "",
  service: "",
  status: "New",
  lastContacted: "",
  nextFollowUp: "",
  notes: "",
};

export default function Leads() {
  const { state, addLead, updateLead, deleteLead } = useStore();
  const [editing, setEditing] = useState(null); // null | "new" | id
  const [draft, setDraft] = useState(empty);
  const [filter, setFilter] = useState("All");
  const [q, setQ] = useState("");

  const open = editing !== null;
  const isNew = editing === "new";

  const visible = useMemo(() => {
    return state.leads.filter((l) => {
      if (filter !== "All" && l.status !== filter) return false;
      if (q) {
        const t = q.toLowerCase();
        return [l.business, l.owner, l.email, l.phone, l.location, l.service, l.notes]
          .filter(Boolean)
          .some((v) => v.toLowerCase().includes(t));
      }
      return true;
    });
  }, [state.leads, filter, q]);

  const counts = useMemo(() => {
    const c = { All: state.leads.length };
    LEAD_STATUSES.forEach((s) => (c[s] = 0));
    state.leads.forEach((l) => (c[l.status] = (c[l.status] || 0) + 1));
    return c;
  }, [state.leads]);

  const startNew = () => {
    setDraft(empty);
    setEditing("new");
  };
  const startEdit = (l) => {
    setDraft(l);
    setEditing(l.id);
  };
  const close = () => {
    setEditing(null);
    setDraft(empty);
  };
  const save = () => {
    if (!draft.business.trim()) return;
    if (isNew) addLead(draft);
    else updateLead(editing, draft);
    close();
  };

  return (
    <div className="space-y-6">
      <Card className="!p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="flex items-center gap-2 rounded-lg border border-ink-700 bg-ink-850 px-3 py-2 lg:flex-1">
            <Icon name="search" className="h-4 w-4 text-zinc-500" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search business, owner, service…"
              className="w-full border-0 bg-transparent p-0 text-sm focus:ring-0 focus:shadow-none"
              style={{ outline: "none" }}
            />
          </div>
          <div className="no-scrollbar flex gap-1.5 overflow-x-auto">
            {["All", ...LEAD_STATUSES].map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={cls(
                  "shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
                  filter === s
                    ? "border-flame-500/40 bg-flame-500/10 text-flame-400"
                    : "border-ink-700 bg-ink-850 text-zinc-400 hover:text-white"
                )}
              >
                {s}
                <span className="ml-1.5 text-zinc-500">{counts[s] || 0}</span>
              </button>
            ))}
          </div>
          <Button onClick={startNew}>
            <Icon name="plus" className="h-4 w-4" />
            New lead
          </Button>
        </div>
      </Card>

      <Card className="!p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-ink-850 text-left text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
              <tr>
                <th className="px-4 py-3">Business</th>
                <th className="px-4 py-3">Owner</th>
                <th className="px-4 py-3 hidden md:table-cell">Contact</th>
                <th className="px-4 py-3 hidden lg:table-cell">Location</th>
                <th className="px-4 py-3 hidden lg:table-cell">Service</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 hidden xl:table-cell">Last</th>
                <th className="px-4 py-3 hidden xl:table-cell">Next</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {visible.map((l) => (
                <tr
                  key={l.id}
                  className="table-row-hover border-t border-ink-800"
                >
                  <td className="px-4 py-3">
                    <button
                      onClick={() => startEdit(l)}
                      className="text-left font-semibold text-white hover:text-flame-400"
                    >
                      {l.business}
                    </button>
                    <div className="mt-0.5 text-[11px] text-zinc-500 lg:hidden">
                      {l.service} · {l.location}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-zinc-300">{l.owner || "—"}</td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <div className="text-zinc-300">{l.phone || "—"}</div>
                    <div className="text-xs text-zinc-500">{l.email}</div>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell text-zinc-400">
                    {l.location || "—"}
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell text-zinc-400">
                    {l.service || "—"}
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={l.status}
                      onChange={(e) =>
                        updateLead(l.id, { status: e.target.value })
                      }
                      className="!bg-ink-850 !py-1 !text-xs"
                    >
                      {LEAD_STATUSES.map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3 hidden xl:table-cell text-zinc-400">
                    {l.lastContacted ? formatDate(l.lastContacted) : "—"}
                  </td>
                  <td className="px-4 py-3 hidden xl:table-cell">
                    <span
                      className={cls(
                        "text-zinc-400",
                        l.nextFollowUp && l.nextFollowUp <= new Date().toISOString().slice(0, 10) && "text-flame-400 font-semibold"
                      )}
                    >
                      {l.nextFollowUp ? formatRelative(l.nextFollowUp) : "—"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1.5">
                      <IconButton onClick={() => startEdit(l)} title="Edit">
                        <Icon name="edit" className="h-4 w-4" />
                      </IconButton>
                      <IconButton
                        onClick={() => {
                          if (confirm(`Delete lead "${l.business}"?`)) deleteLead(l.id);
                        }}
                        title="Delete"
                        className="hover:!border-rose-500/40 hover:!text-rose-400"
                      >
                        <Icon name="trash" className="h-4 w-4" />
                      </IconButton>
                    </div>
                  </td>
                </tr>
              ))}
              {visible.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-sm text-zinc-500">
                    No leads match. Add one to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal
        open={open}
        onClose={close}
        title={isNew ? "New lead" : "Edit lead"}
        subtitle={isNew ? "Pull a fresh local prospect into the pipeline" : "Update details and notes"}
        size="md"
        footer={
          <>
            {!isNew && (
              <Button
                variant="danger"
                className="mr-auto"
                onClick={() => {
                  if (confirm("Delete this lead?")) {
                    deleteLead(editing);
                    close();
                  }
                }}
              >
                <Icon name="trash" className="h-4 w-4" />
                Delete
              </Button>
            )}
            <Button variant="ghost" onClick={close}>Cancel</Button>
            <Button onClick={save}>{isNew ? "Add lead" : "Save"}</Button>
          </>
        }
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Business name" required>
            <input
              value={draft.business}
              onChange={(e) => setDraft({ ...draft, business: e.target.value })}
              placeholder="Lakeside Auto Spa"
            />
          </Field>
          <Field label="Owner name">
            <input
              value={draft.owner}
              onChange={(e) => setDraft({ ...draft, owner: e.target.value })}
              placeholder="Marcus Lee"
            />
          </Field>
          <Field label="Phone">
            <input
              value={draft.phone}
              onChange={(e) => setDraft({ ...draft, phone: e.target.value })}
              placeholder="(404) 555-0181"
            />
          </Field>
          <Field label="Email">
            <input
              type="email"
              value={draft.email}
              onChange={(e) => setDraft({ ...draft, email: e.target.value })}
              placeholder="owner@biz.co"
            />
          </Field>
          <Field label="Location">
            <input
              value={draft.location}
              onChange={(e) => setDraft({ ...draft, location: e.target.value })}
              placeholder="Atlanta, GA"
            />
          </Field>
          <Field label="Service needed">
            <input
              value={draft.service}
              onChange={(e) => setDraft({ ...draft, service: e.target.value })}
              placeholder="Pressure washing"
            />
          </Field>
          <Field label="Status">
            <select
              value={draft.status}
              onChange={(e) => setDraft({ ...draft, status: e.target.value })}
            >
              {LEAD_STATUSES.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </Field>
          <Field label="Last contacted">
            <input
              type="date"
              value={draft.lastContacted}
              onChange={(e) => setDraft({ ...draft, lastContacted: e.target.value })}
            />
          </Field>
          <Field label="Next follow-up" className="sm:col-span-2">
            <input
              type="date"
              value={draft.nextFollowUp}
              onChange={(e) => setDraft({ ...draft, nextFollowUp: e.target.value })}
            />
          </Field>
          <Field label="Notes" className="sm:col-span-2">
            <textarea
              rows={3}
              value={draft.notes}
              onChange={(e) => setDraft({ ...draft, notes: e.target.value })}
              placeholder="Decision maker, hooks, what they care about…"
            />
          </Field>
        </div>
      </Modal>
    </div>
  );
}
