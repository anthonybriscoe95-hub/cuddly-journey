"use client";

import { useMemo, useState } from "react";
import { useStore, updateLead } from "@/lib/store";
import { PageHeader, ScoreBadge, typeLabel } from "@/components/ui";

const MAPS_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

// Nearest-neighbor ordering — a solid, fast approximation for daily routes.
function planRoute(stops) {
  if (stops.length < 2) return stops;
  const remaining = [...stops];
  const route = [remaining.shift()];
  while (remaining.length) {
    const last = route[route.length - 1];
    let best = 0;
    let bestD = Infinity;
    remaining.forEach((s, i) => {
      const d = (s.lat - last.lat) ** 2 + (s.lng - last.lng) ** 2;
      if (d < bestD) {
        bestD = d;
        best = i;
      }
    });
    route.push(remaining.splice(best, 1)[0]);
  }
  return route;
}

function MapView({ stops }) {
  if (!stops.length)
    return (
      <div className="flex h-full items-center justify-center p-8 text-center text-sm text-slate-400">
        Select saved leads on the left to plot your route.
      </div>
    );

  if (MAPS_KEY) {
    const origin = `${stops[0].lat},${stops[0].lng}`;
    const dest = `${stops[stops.length - 1].lat},${stops[stops.length - 1].lng}`;
    const waypoints = stops.slice(1, -1).map((s) => `${s.lat},${s.lng}`).join("|");
    const src =
      stops.length === 1
        ? `https://www.google.com/maps/embed/v1/place?key=${MAPS_KEY}&q=${origin}`
        : `https://www.google.com/maps/embed/v1/directions?key=${MAPS_KEY}&origin=${origin}&destination=${dest}${waypoints ? `&waypoints=${encodeURIComponent(waypoints)}` : ""}&mode=driving`;
    return <iframe title="Route map" className="h-full w-full rounded-xl" loading="lazy" src={src} allowFullScreen />;
  }

  // Built-in map: plots stops proportionally by coordinates.
  const lats = stops.map((s) => s.lat);
  const lngs = stops.map((s) => s.lng);
  const pad = 0.02;
  const minLat = Math.min(...lats) - pad, maxLat = Math.max(...lats) + pad;
  const minLng = Math.min(...lngs) - pad, maxLng = Math.max(...lngs) + pad;
  const X = (lng) => ((lng - minLng) / (maxLng - minLng || 1)) * 90 + 5;
  const Y = (lat) => (1 - (lat - minLat) / (maxLat - minLat || 1)) * 86 + 7;

  return (
    <div className="relative h-full w-full rounded-xl bg-gradient-to-br from-harbor-50 to-harbor-100 p-2">
      <svg viewBox="0 0 100 100" className="h-full w-full">
        <polyline
          points={stops.map((s) => `${X(s.lng)},${Y(s.lat)}`).join(" ")}
          fill="none" stroke="#1f7def" strokeWidth="0.7" strokeDasharray="2 1.2"
        />
        {stops.map((s, i) => (
          <g key={s.id}>
            <circle cx={X(s.lng)} cy={Y(s.lat)} r="3" fill="#1765dc" />
            <text x={X(s.lng)} y={Y(s.lat) + 1.1} fontSize="3" fill="white" fontWeight="700" textAnchor="middle">{i + 1}</text>
            <text x={X(s.lng)} y={Y(s.lat) - 4} fontSize="2.8" fill="#152c55" fontWeight="600" textAnchor="middle">{s.name.slice(0, 18)}</text>
          </g>
        ))}
      </svg>
      <div className="absolute bottom-2 left-2 rounded bg-white/80 px-2 py-1 text-[10px] text-slate-500">
        Add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY for live Google Maps
      </div>
    </div>
  );
}

export default function RoutePlanner() {
  const { leads } = useStore();
  const [selected, setSelected] = useState([]);
  const [hood, setHood] = useState("all");

  const mappable = leads.filter((l) => l.saved && l.lat && l.lng);
  const hoods = [...new Set(mappable.map((l) => l.neighborhood || l.city).filter(Boolean))];
  const visible = mappable.filter((l) => hood === "all" || (l.neighborhood || l.city) === hood);

  const stops = useMemo(
    () => planRoute(visible.filter((l) => selected.includes(l.id))),
    [visible, selected]
  );

  const gmapsUrl =
    stops.length >= 1
      ? `https://www.google.com/maps/dir/${stops.map((s) => encodeURIComponent(`${s.lat},${s.lng}`)).join("/")}`
      : null;

  const toggle = (id) =>
    setSelected((sel) => (sel.includes(id) ? sel.filter((x) => x !== id) : [...sel, id]));

  return (
    <div>
      <PageHeader title="Route Planner" subtitle="Organize saved leads by neighborhood and plan an efficient day on the road.">
        {gmapsUrl && stops.length > 1 && (
          <a className="btn-primary" href={gmapsUrl} target="_blank" rel="noreferrer">
            🧭 Open Route in Google Maps
          </a>
        )}
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <div className="mb-3 flex flex-wrap gap-2">
            <button className={`btn text-xs ${hood === "all" ? "bg-harbor-600 text-white" : "btn-secondary"}`} onClick={() => setHood("all")}>
              All neighborhoods
            </button>
            {hoods.map((h) => (
              <button key={h} className={`btn text-xs ${hood === h ? "bg-harbor-600 text-white" : "btn-secondary"}`} onClick={() => setHood(h)}>
                📍 {h}
              </button>
            ))}
          </div>

          <div className="card divide-y divide-slate-50">
            {visible.length === 0 && (
              <div className="p-6 text-center text-sm text-slate-400">
                No saved leads with locations{hood !== "all" ? ` in ${hood}` : ""}. Save leads in the Lead Finder first.
              </div>
            )}
            {visible.map((l) => {
              const idx = stops.findIndex((s) => s.id === l.id);
              return (
                <label key={l.id} className="flex cursor-pointer items-center gap-3 p-3 hover:bg-harbor-50/40">
                  <input type="checkbox" className="h-4 w-4 accent-harbor-600" checked={selected.includes(l.id)} onChange={() => toggle(l.id)} />
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-semibold text-slate-700">{l.name}</div>
                    <div className="text-xs text-slate-400">
                      {typeLabel(l.type)} · {l.neighborhood || l.city}, {l.city}
                    </div>
                  </div>
                  <ScoreBadge score={l.score} />
                  {idx >= 0 && <span className="badge bg-harbor-600 text-white">Stop {idx + 1}</span>}
                </label>
              );
            })}
          </div>

          {stops.length > 0 && (
            <div className="card mt-4 p-4">
              <h3 className="mb-2 font-extrabold text-harbor-950">Today&apos;s route ({stops.length} stops)</h3>
              <ol className="space-y-1.5 text-sm">
                {stops.map((s, i) => (
                  <li key={s.id} className="flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-harbor-600 text-[10px] font-bold text-white">{i + 1}</span>
                    <span className="font-semibold text-slate-700">{s.name}</span>
                    <span className="text-xs text-slate-400">· {s.neighborhood || s.city}</span>
                    <button
                      className="ml-auto text-xs font-semibold text-harbor-600 hover:underline"
                      onClick={() => updateLead(s.id, { status: "contacted" })}
                    >
                      Mark contacted
                    </button>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>

        <div className="card h-[520px] overflow-hidden p-2 lg:col-span-3">
          <MapView stops={stops.length ? stops : visible.filter((l) => selected.includes(l.id))} />
        </div>
      </div>
    </div>
  );
}
