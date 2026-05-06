import { useState } from "react";
import { Card, CardHeader } from "../components/Card.jsx";
import Button, { IconButton } from "../components/Button.jsx";
import Icon from "../components/Icon.jsx";
import Field from "../components/Field.jsx";
import { useStore } from "../state/store.jsx";
import { cls, copyToClipboard, downloadText } from "../lib/utils.js";

const CHANNELS = [
  { id: "text", label: "Text message", icon: "phone", desc: "Short, friendly SMS." },
  { id: "email", label: "Email", icon: "mail", desc: "Subject + 4-line cold email." },
  { id: "follow", label: "Follow-up", icon: "message", desc: "Soft-touch follow-up that doesn't feel pushy." },
  { id: "call", label: "Call script", icon: "phone", desc: "Voicemail + opener." },
  { id: "fbdm", label: "Facebook DM", icon: "facebook", desc: "Casual DM that fits FB tone." },
];

const TONES = ["Direct", "Friendly", "Confident", "Witty"];

export default function Outreach() {
  const { state, logRun, addVault } = useStore();
  const [channel, setChannel] = useState("text");
  const [form, setForm] = useState({
    business: "",
    owner: "",
    service: "",
    pain: "",
    result: "",
    tone: "Friendly",
  });
  const [output, setOutput] = useState("");
  const [running, setRunning] = useState(false);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState("");

  const generate = () => {
    setRunning(true);
    setTimeout(() => {
      const out = render(channel, form, state.settings);
      setOutput(out);
      logRun({
        skill: "Outreach Generator",
        summary: `${CHANNELS.find((c) => c.id === channel)?.label} for ${form.business || "lead"}`,
      });
      setRunning(false);
    }, 350);
  };

  const onCopy = async () => {
    const ok = await copyToClipboard(output);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <div className="lg:col-span-2 space-y-4">
        <Card>
          <CardHeader
            title="Channel"
            subtitle="Where will this message live?"
            icon={<Icon name="send" className="h-4 w-4" />}
          />
          <div className="grid grid-cols-2 gap-2">
            {CHANNELS.map((c) => (
              <button
                key={c.id}
                onClick={() => setChannel(c.id)}
                className={cls(
                  "flex flex-col items-start gap-1 rounded-lg border p-3 text-left transition-all",
                  channel === c.id
                    ? "border-flame-500/50 bg-flame-500/10 ring-1 ring-flame-500/30"
                    : "border-ink-700 bg-ink-850 hover:border-ink-600"
                )}
              >
                <div className="flex items-center gap-2">
                  <Icon
                    name={c.icon}
                    className={cls(
                      "h-4 w-4",
                      channel === c.id ? "text-flame-400" : "text-zinc-400"
                    )}
                  />
                  <span className="text-sm font-semibold text-white">{c.label}</span>
                </div>
                <span className="text-[11px] text-zinc-500">{c.desc}</span>
              </button>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader
            title="Inputs"
            subtitle="Personalize for the recipient"
            icon={<Icon name="edit" className="h-4 w-4" />}
          />
          <div className="space-y-3">
            <Field label="Business name" required>
              <input
                value={form.business}
                onChange={(e) => setForm({ ...form, business: e.target.value })}
                placeholder="Lakeside Auto Spa"
              />
            </Field>
            <Field label="Owner first name">
              <input
                value={form.owner}
                onChange={(e) => setForm({ ...form, owner: e.target.value })}
                placeholder="Marcus"
              />
            </Field>
            <Field label="Service you offer">
              <input
                value={form.service}
                onChange={(e) => setForm({ ...form, service: e.target.value })}
                placeholder="AI receptionist for missed calls"
              />
            </Field>
            <Field label="Their pain / hook" hint="Be specific. Specifics convert.">
              <textarea
                rows={3}
                value={form.pain}
                onChange={(e) => setForm({ ...form, pain: e.target.value })}
                placeholder="Saw 3 reviews mentioning unanswered phones during weekends."
              />
            </Field>
            <Field label="Result you deliver">
              <input
                value={form.result}
                onChange={(e) => setForm({ ...form, result: e.target.value })}
                placeholder="Captures 90% of after-hours calls"
              />
            </Field>
            <Field label="Tone">
              <div className="flex flex-wrap gap-1.5">
                {TONES.map((t) => (
                  <button
                    key={t}
                    onClick={() => setForm({ ...form, tone: t })}
                    className={cls(
                      "rounded-md border px-2.5 py-1 text-xs font-semibold",
                      form.tone === t
                        ? "border-flame-500/40 bg-flame-500/10 text-flame-400"
                        : "border-ink-700 bg-ink-850 text-zinc-400 hover:text-white"
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </Field>
            <Button
              onClick={generate}
              disabled={!form.business.trim() || running}
              className="w-full"
              size="lg"
            >
              <Icon name="sparkles" className="h-4 w-4" />
              {running ? "Generating…" : "Generate outreach"}
            </Button>
          </div>
        </Card>
      </div>

      <div className="lg:col-span-3">
        <Card>
          <CardHeader
            title="Output"
            subtitle={CHANNELS.find((c) => c.id === channel)?.label}
            icon={<Icon name="doc" className="h-4 w-4" />}
            action={
              output && (
                <div className="flex items-center gap-1.5">
                  <IconButton onClick={onCopy} title="Copy">
                    <Icon name="copy" className="h-4 w-4" />
                  </IconButton>
                  <IconButton
                    onClick={() => downloadText(`outreach-${channel}.txt`, output)}
                    title="Download"
                  >
                    <Icon name="download" className="h-4 w-4" />
                  </IconButton>
                  <IconButton
                    onClick={() => {
                      addVault({
                        title: `Outreach (${channel}) — ${form.business || "lead"} — ${new Date().toLocaleDateString()}`,
                        category: "Outputs",
                        body: output,
                      });
                      setSaved("Saved to Vault");
                      setTimeout(() => setSaved(""), 1500);
                    }}
                    title="Save to Vault"
                  >
                    <Icon name="save" className="h-4 w-4" />
                  </IconButton>
                </div>
              )
            }
          />
          <div
            className={cls(
              "surface-2 min-h-[420px] whitespace-pre-wrap p-5 font-mono text-[13px] leading-relaxed text-zinc-200",
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
              <div className="text-center">
                <div className="mb-2 text-2xl">✉️</div>
                Pick a channel, fill the inputs, and hit Generate.
              </div>
            )}
          </div>
          {(saved || copied) && (
            <div className="mt-2 text-xs text-flame-400">{saved || "Copied!"}</div>
          )}
        </Card>
      </div>
    </div>
  );
}

function render(channel, f, settings) {
  const owner = (f.owner || "").trim() || "there";
  const sig = `${settings.ownerName || "AB"}, ${settings.businessName}`;
  const phone = settings.phone || "";
  const pain = (f.pain || "").trim();
  const result = (f.result || "").trim();
  const service = (f.service || "your service").trim();
  const biz = f.business?.trim() || "your business";
  const tone = f.tone || "Friendly";

  const opener = {
    Direct: `Cutting straight to it`,
    Friendly: `Hope your week's going well`,
    Confident: `Quick one — high-leverage move for you`,
    Witty: `Promise this isn't another spammy pitch`,
  }[tone];

  if (channel === "text") {
    return [
      `Hey ${owner} — ${opener.toLowerCase()}.`,
      `${pain ? pain : `Saw ${biz} on Maps.`} I help local businesses with ${service}${result ? ` — ${result}.` : `.`}`,
      `Worth a 2-min look?`,
      ``,
      `— ${sig}`,
      `(Reply STOP to opt out.)`,
    ].join("\n");
  }
  if (channel === "email") {
    return [
      `SUBJECT: Quick idea for ${biz}`,
      ``,
      `Hi ${owner},`,
      ``,
      `${pain || `Came across ${biz} and had a quick idea.`} I help local businesses with ${service}${result ? `, and most see ${result}.` : `.`}`,
      ``,
      `Want me to send a 60-second loom showing exactly what I'd do for ${biz}? No meeting needed.`,
      ``,
      `— ${sig}`,
      `${phone ? phone + " · " : ""}${settings.email || ""}`,
    ].join("\n");
  }
  if (channel === "follow") {
    return [
      `Hey ${owner} — circling back, didn't want this to slip.`,
      ``,
      `Last we talked: ${pain || "you mentioned looking for a better way to handle " + service.toLowerCase() + "."}`,
      ``,
      `Want me to send a quick mock so you can see the deliverable on your end? 30 seconds to look, zero pressure either way.`,
      ``,
      `— ${sig}`,
    ].join("\n");
  }
  if (channel === "call") {
    return [
      `(Voicemail script — under 20 seconds)`,
      ``,
      `Hey ${owner}, ${sig}. Quick reason for the call:`,
      `${pain || `noticed ${biz} could use a hand with ${service.toLowerCase()}`}${result ? `, and we usually deliver ${result}` : ""}.`,
      `Best number to text you a 60-second loom is ${phone}. Talk soon.`,
      ``,
      `--- LIVE CALL OPENER ---`,
      `"Hey ${owner}, this is ${settings.ownerName || "AB"} — totally cold call, gonna be 15 seconds. Want me to keep going?"`,
    ].join("\n");
  }
  // FB DM
  return [
    `Hey ${owner}! 👋`,
    ``,
    `Local guy — not selling anything in this DM.`,
    `${pain || `Just spotted ${biz} and thought of a quick win for ${service}`}${result ? ` (clients usually see ${result})` : ""}.`,
    ``,
    `Open to a 2-min explainer or want me to keep moving?`,
    ``,
    `— ${sig}`,
  ].join("\n");
}
