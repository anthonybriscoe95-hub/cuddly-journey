import { useState } from "react";
import { Card, CardHeader } from "../components/Card.jsx";
import Button, { IconButton } from "../components/Button.jsx";
import Icon from "../components/Icon.jsx";
import Field from "../components/Field.jsx";
import { useStore } from "../state/store.jsx";

export default function Settings() {
  const { state, setSettings, reset } = useStore();
  const s = state.settings;
  const [newService, setNewService] = useState("");
  const [newPrice, setNewPrice] = useState({ name: "", price: "" });

  const update = (patch) => setSettings(patch);

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader
            title="Business"
            subtitle="The basics that go on every output"
            icon={<Icon name="briefcase" className="h-4 w-4" />}
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Business name" className="sm:col-span-2">
              <input
                value={s.businessName}
                onChange={(e) => update({ businessName: e.target.value })}
              />
            </Field>
            <Field label="Owner name">
              <input value={s.ownerName} onChange={(e) => update({ ownerName: e.target.value })} />
            </Field>
            <Field label="Email">
              <input
                type="email"
                value={s.email}
                onChange={(e) => update({ email: e.target.value })}
              />
            </Field>
            <Field label="Phone">
              <input value={s.phone} onChange={(e) => update({ phone: e.target.value })} />
            </Field>
            <Field label="Weekly revenue goal">
              <input
                type="number"
                value={s.weeklyRevenueGoal}
                onChange={(e) =>
                  update({ weeklyRevenueGoal: Number(e.target.value) || 0 })
                }
              />
            </Field>
          </div>
        </Card>

        <Card>
          <CardHeader
            title="Brand"
            subtitle="Tune the operator's accent color"
            icon={<Icon name="sparkles" className="h-4 w-4" />}
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Primary color" hint="Used as your operator accent">
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={s.brandPrimary}
                  onChange={(e) => update({ brandPrimary: e.target.value })}
                  className="h-10 w-14 cursor-pointer p-1"
                />
                <input
                  value={s.brandPrimary}
                  onChange={(e) => update({ brandPrimary: e.target.value })}
                  className="flex-1"
                />
              </div>
            </Field>
            <Field label="Dark base" hint="Background tint for surfaces">
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={s.brandDark}
                  onChange={(e) => update({ brandDark: e.target.value })}
                  className="h-10 w-14 cursor-pointer p-1"
                />
                <input
                  value={s.brandDark}
                  onChange={(e) => update({ brandDark: e.target.value })}
                  className="flex-1"
                />
              </div>
            </Field>
            <div className="surface-2 sm:col-span-2 flex items-center gap-3 p-3">
              <span
                className="h-12 w-12 rounded-xl shadow-glow"
                style={{ background: s.brandPrimary }}
              />
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Preview
                </div>
                <div className="text-sm text-zinc-200">
                  Your brand on a {" "}
                  <span style={{ color: s.brandPrimary }}>signature</span> CTA.
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader
          title="Services"
          subtitle="What you sell — used in skill outputs"
          icon={<Icon name="bolt" className="h-4 w-4" />}
        />
        <form
          className="mb-3 flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            const v = newService.trim();
            if (!v) return;
            update({ services: [...s.services, v] });
            setNewService("");
          }}
        >
          <input
            value={newService}
            onChange={(e) => setNewService(e.target.value)}
            placeholder="Add a service…"
            className="flex-1"
          />
          <Button type="submit" size="sm">
            Add
          </Button>
        </form>
        <div className="flex flex-wrap gap-2">
          {s.services.map((svc, i) => (
            <span
              key={i}
              className="group inline-flex items-center gap-2 rounded-lg border border-ink-700 bg-ink-850 px-3 py-1.5 text-sm text-zinc-200"
            >
              {svc}
              <button
                onClick={() => update({ services: s.services.filter((_, k) => k !== i) })}
                className="text-zinc-500 hover:text-rose-400"
              >
                <Icon name="close" className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      </Card>

      <Card>
        <CardHeader
          title="Pricing"
          subtitle="Use anchors for offers and invoices"
          icon={<Icon name="invoice" className="h-4 w-4" />}
        />
        <form
          className="mb-3 grid grid-cols-12 gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (!newPrice.name.trim() || !newPrice.price) return;
            update({
              pricing: [
                ...s.pricing,
                { name: newPrice.name.trim(), price: Number(newPrice.price) || 0 },
              ],
            });
            setNewPrice({ name: "", price: "" });
          }}
        >
          <input
            value={newPrice.name}
            onChange={(e) => setNewPrice({ ...newPrice, name: e.target.value })}
            placeholder="Item / package"
            className="col-span-7"
          />
          <input
            type="number"
            value={newPrice.price}
            onChange={(e) => setNewPrice({ ...newPrice, price: e.target.value })}
            placeholder="$"
            className="col-span-3"
          />
          <Button type="submit" size="sm" className="col-span-2">
            Add
          </Button>
        </form>
        <ul className="divide-y divide-ink-800">
          {s.pricing.map((p, i) => (
            <li key={i} className="flex items-center gap-3 py-2.5">
              <input
                value={p.name}
                onChange={(e) => {
                  const next = [...s.pricing];
                  next[i] = { ...next[i], name: e.target.value };
                  update({ pricing: next });
                }}
                className="flex-1"
              />
              <input
                type="number"
                value={p.price}
                onChange={(e) => {
                  const next = [...s.pricing];
                  next[i] = { ...next[i], price: Number(e.target.value) || 0 };
                  update({ pricing: next });
                }}
                className="w-28 text-right"
              />
              <IconButton
                onClick={() =>
                  update({ pricing: s.pricing.filter((_, k) => k !== i) })
                }
                className="hover:!border-rose-500/40 hover:!text-rose-400"
              >
                <Icon name="trash" className="h-4 w-4" />
              </IconButton>
            </li>
          ))}
          {s.pricing.length === 0 && (
            <li className="p-5 text-center text-sm text-zinc-500">No pricing yet.</li>
          )}
        </ul>
      </Card>

      <Card>
        <CardHeader
          title="Data"
          subtitle="Everything is stored locally on this device"
          icon={<Icon name="vault" className="h-4 w-4" />}
        />
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="danger"
            onClick={() => {
              if (confirm("Reset ALL data to seed examples? This cannot be undone.")) reset();
            }}
          >
            <Icon name="trash" className="h-4 w-4" />
            Reset all data
          </Button>
          <span className="text-xs text-zinc-500">
            Wipes leads, clients, tasks, vault, settings.
          </span>
        </div>
      </Card>
    </div>
  );
}
