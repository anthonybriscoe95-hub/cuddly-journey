import { useEffect, useMemo, useState } from "react";
import Modal from "./Modal.jsx";
import Field from "./Field.jsx";
import Button, { IconButton } from "./Button.jsx";
import Icon from "./Icon.jsx";
import { useStore } from "../state/store.jsx";
import { copyToClipboard, downloadText, cls } from "../lib/utils.js";

const VAULT_CATEGORIES = ["Outputs", "Raw", "Wiki", "Clients", "Automations"];

export default function SkillRunner({ skill, open, onClose }) {
  const { state, logRun, addVault } = useStore();
  const [values, setValues] = useState({});
  const [output, setOutput] = useState("");
  const [running, setRunning] = useState(false);
  const [savedNote, setSavedNote] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!open || !skill) return;
    setValues(
      Object.fromEntries(
        (skill.fields || []).map((f) => [f.name, f.default ?? ""])
      )
    );
    setOutput("");
    setSavedNote("");
    setCopied(false);
  }, [open, skill]);

  const required = useMemo(
    () => (skill?.fields || []).filter((f) => f.required),
    [skill]
  );
  const canRun = required.every((f) => String(values[f.name] || "").trim());

  if (!skill) return null;

  const onRun = () => {
    setRunning(true);
    setTimeout(() => {
      try {
        const out = skill.run(values, { settings: state.settings });
        setOutput(out);
        logRun({
          skill: skill.name,
          summary:
            out.split("\n").find((l) => l.trim().length > 6) || skill.name,
        });
      } catch (e) {
        setOutput(`Error running skill: ${e.message}`);
      } finally {
        setRunning(false);
      }
    }, 350);
  };

  const onCopy = async () => {
    const ok = await copyToClipboard(output);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    }
  };

  const onSaveToVault = (category = "Outputs") => {
    if (!output) return;
    addVault({
      title: `${skill.name} — ${new Date().toLocaleString()}`,
      category,
      body: output,
    });
    setSavedNote(`Saved to Vault → ${category}`);
    setTimeout(() => setSavedNote(""), 1800);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={skill.name}
      subtitle={skill.description}
      size="lg"
      footer={
        <>
          {output && (
            <div className="mr-auto flex items-center gap-2 text-xs">
              {savedNote && (
                <span className="text-emerald-400">{savedNote}</span>
              )}
              {copied && <span className="text-flame-400">Copied!</span>}
            </div>
          )}
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
          <Button onClick={onRun} disabled={!canRun || running}>
            <Icon name="sparkles" className="h-4 w-4" />
            {running ? "Generating…" : output ? "Re-generate" : "Generate"}
          </Button>
        </>
      }
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Inputs
          </div>
          <div className="space-y-3">
            {(skill.fields || []).map((f) => (
              <Field
                key={f.name}
                label={f.label}
                required={f.required}
                hint={f.hint}
              >
                {f.type === "textarea" ? (
                  <textarea
                    rows={3}
                    placeholder={f.placeholder}
                    value={values[f.name] ?? ""}
                    onChange={(e) =>
                      setValues({ ...values, [f.name]: e.target.value })
                    }
                  />
                ) : f.type === "select" ? (
                  <select
                    value={values[f.name] ?? ""}
                    onChange={(e) =>
                      setValues({ ...values, [f.name]: e.target.value })
                    }
                  >
                    {(f.options || []).map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={f.type || "text"}
                    placeholder={f.placeholder}
                    value={values[f.name] ?? ""}
                    onChange={(e) =>
                      setValues({ ...values, [f.name]: e.target.value })
                    }
                  />
                )}
              </Field>
            ))}
          </div>
        </div>

        <div>
          <div className="mb-3 flex items-center justify-between">
            <div className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Output
            </div>
            {output && (
              <div className="flex items-center gap-1.5">
                <IconButton onClick={onCopy} title="Copy">
                  <Icon name="copy" className="h-4 w-4" />
                </IconButton>
                <IconButton
                  onClick={() =>
                    downloadText(`${skill.id}-${Date.now()}.txt`, output)
                  }
                  title="Download"
                >
                  <Icon name="download" className="h-4 w-4" />
                </IconButton>
                <IconButton
                  onClick={() => onSaveToVault("Outputs")}
                  title="Save to Vault"
                >
                  <Icon name="save" className="h-4 w-4" />
                </IconButton>
              </div>
            )}
          </div>

          <div
            className={cls(
              "surface-2 relative min-h-[260px] whitespace-pre-wrap p-4 font-mono text-[13px] leading-relaxed text-zinc-200",
              !output && "grid place-items-center text-zinc-500"
            )}
          >
            {running ? (
              <div className="flex items-center gap-2 text-flame-400">
                <span className="h-2 w-2 animate-pulse rounded-full bg-flame-500" />
                <span className="text-sm font-semibold">Generating…</span>
              </div>
            ) : output ? (
              output
            ) : (
              <span className="text-center">
                Fill in the inputs and hit
                <span className="mx-1 inline-block rounded bg-ink-700 px-1.5 py-0.5 text-flame-400">
                  Generate
                </span>
              </span>
            )}
          </div>

          {output && (
            <div className="mt-3">
              <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                Save to Vault as
              </div>
              <div className="flex flex-wrap gap-1.5">
                {VAULT_CATEGORIES.map((c) => (
                  <button
                    key={c}
                    onClick={() => onSaveToVault(c)}
                    className="rounded-md border border-ink-700 bg-ink-850 px-2.5 py-1 text-xs text-zinc-300 hover:border-flame-500/40 hover:text-flame-400"
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
