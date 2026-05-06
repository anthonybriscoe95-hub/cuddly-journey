import { useMemo, useState } from "react";
import { Card } from "../components/Card.jsx";
import Button, { IconButton } from "../components/Button.jsx";
import Icon from "../components/Icon.jsx";
import Modal from "../components/Modal.jsx";
import Field from "../components/Field.jsx";
import { useStore } from "../state/store.jsx";
import { cls, copyToClipboard, downloadText, formatDate } from "../lib/utils.js";

const CATEGORIES = ["Raw", "Wiki", "Outputs", "Clients", "Automations"];

export default function Vault() {
  const { state, addVault, updateVault, deleteVault } = useStore();
  const [active, setActive] = useState(null);
  const [editing, setEditing] = useState(null);
  const [draft, setDraft] = useState({ title: "", category: "Outputs", body: "" });
  const [filter, setFilter] = useState("All");
  const [q, setQ] = useState("");
  const [copied, setCopied] = useState(false);

  const isNew = editing === "new";

  const items = useMemo(() => {
    return state.vault.filter((v) => {
      if (filter !== "All" && v.category !== filter) return false;
      if (q) {
        const t = q.toLowerCase();
        return [v.title, v.body, v.category].some((x) =>
          (x || "").toLowerCase().includes(t)
        );
      }
      return true;
    });
  }, [state.vault, filter, q]);

  const counts = useMemo(() => {
    const c = { All: state.vault.length };
    CATEGORIES.forEach((k) => (c[k] = 0));
    state.vault.forEach((v) => (c[v.category] = (c[v.category] || 0) + 1));
    return c;
  }, [state.vault]);

  const startNew = () => {
    setDraft({ title: "", category: "Raw", body: "" });
    setEditing("new");
  };
  const startEdit = (v) => {
    setDraft(v);
    setEditing(v.id);
    setActive(null);
  };
  const close = () => {
    setEditing(null);
    setDraft({ title: "", category: "Raw", body: "" });
  };
  const save = () => {
    if (!draft.title.trim() || !draft.body.trim()) return;
    if (isNew) addVault(draft);
    else updateVault(editing, draft);
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
              placeholder="Search the vault…"
              className="w-full border-0 bg-transparent p-0 text-sm focus:ring-0 focus:shadow-none"
              style={{ outline: "none" }}
            />
          </div>
          <div className="no-scrollbar flex gap-1.5 overflow-x-auto">
            {["All", ...CATEGORIES].map((c) => (
              <button
                key={c}
                onClick={() => setFilter(c)}
                className={cls(
                  "shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
                  filter === c
                    ? "border-flame-500/40 bg-flame-500/10 text-flame-400"
                    : "border-ink-700 bg-ink-850 text-zinc-400 hover:text-white"
                )}
              >
                {c}
                <span className="ml-1.5 text-zinc-500">{counts[c] || 0}</span>
              </button>
            ))}
          </div>
          <Button onClick={startNew}>
            <Icon name="plus" className="h-4 w-4" />
            New file
          </Button>
        </div>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((v) => (
          <button
            key={v.id}
            onClick={() => setActive(v)}
            className="group surface flex flex-col p-5 text-left transition-all hover:-translate-y-0.5 hover:border-flame-500/40 animate-fade-in"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="grid h-9 w-9 place-items-center rounded-lg bg-flame-500/10 text-flame-400 ring-1 ring-flame-500/20">
                <Icon name="doc" className="h-4 w-4" />
              </div>
              <span className="chip bg-ink-800 text-zinc-400 ring-1 ring-ink-700">
                {v.category}
              </span>
            </div>
            <h3 className="mt-3 text-sm font-bold text-white line-clamp-2">{v.title}</h3>
            <p className="mt-1 line-clamp-3 flex-1 text-xs text-zinc-400">
              {v.body}
            </p>
            <div className="mt-3 text-[11px] text-zinc-500">{formatDate(v.createdAt)}</div>
          </button>
        ))}

        {items.length === 0 && (
          <div className="surface col-span-full p-10 text-center text-sm text-zinc-500">
            Vault is empty for this filter. Save a skill output to drop a file here.
          </div>
        )}
      </div>

      {/* View modal */}
      <Modal
        open={!!active}
        onClose={() => setActive(null)}
        title={active?.title || ""}
        subtitle={active && `${active.category} · ${formatDate(active.createdAt)}`}
        size="lg"
        footer={
          <>
            {copied && <span className="mr-auto text-xs text-flame-400">Copied!</span>}
            <Button
              variant="ghost"
              onClick={async () => {
                if (!active) return;
                const ok = await copyToClipboard(active.body);
                if (ok) {
                  setCopied(true);
                  setTimeout(() => setCopied(false), 1400);
                }
              }}
            >
              <Icon name="copy" className="h-4 w-4" />
              Copy
            </Button>
            <Button
              variant="ghost"
              onClick={() => active && downloadText(`${active.title}.txt`, active.body)}
            >
              <Icon name="download" className="h-4 w-4" />
              Download
            </Button>
            <Button onClick={() => active && startEdit(active)}>
              <Icon name="edit" className="h-4 w-4" />
              Edit
            </Button>
          </>
        }
      >
        {active && (
          <div className="surface-2 whitespace-pre-wrap p-4 font-mono text-[13px] leading-relaxed text-zinc-200">
            {active.body}
          </div>
        )}
      </Modal>

      {/* Edit modal */}
      <Modal
        open={editing !== null}
        onClose={close}
        title={isNew ? "New vault file" : "Edit file"}
        size="md"
        footer={
          <>
            {!isNew && (
              <Button
                variant="danger"
                className="mr-auto"
                onClick={() => {
                  if (confirm("Delete this file?")) {
                    deleteVault(editing);
                    close();
                  }
                }}
              >
                <Icon name="trash" className="h-4 w-4" />
                Delete
              </Button>
            )}
            <Button variant="ghost" onClick={close}>Cancel</Button>
            <Button onClick={save}>{isNew ? "Save" : "Update"}</Button>
          </>
        }
      >
        <div className="space-y-3">
          <Field label="Title" required>
            <input
              value={draft.title}
              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
            />
          </Field>
          <Field label="Category">
            <select
              value={draft.category}
              onChange={(e) => setDraft({ ...draft, category: e.target.value })}
            >
              {CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </Field>
          <Field label="Body" required>
            <textarea
              rows={10}
              value={draft.body}
              onChange={(e) => setDraft({ ...draft, body: e.target.value })}
              className="font-mono text-[13px]"
            />
          </Field>
        </div>
      </Modal>
    </div>
  );
}
