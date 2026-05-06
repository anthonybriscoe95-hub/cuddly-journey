// Skill registry — each skill has metadata, an input schema, and a `run` fn
// that produces a formatted text output. Pure JS, deterministic, no network.

const fmt = (s) => (s || "").toString().trim();
const line = (label, val) => (val ? `${label}: ${val}\n` : "");
const bullet = (s) => `• ${s}`;
const block = (...lines) => lines.filter(Boolean).join("\n");

export const SKILLS = [
  {
    id: "find_local_leads",
    name: "Find Local Leads",
    description:
      "Generate a structured local prospect list and a search playbook for a niche + city.",
    icon: "target",
    accent: "Discovery",
    fields: [
      { name: "niche", label: "Niche / industry", type: "text", required: true, placeholder: "Roofers, HVAC, cafes…" },
      { name: "city", label: "City / area", type: "text", required: true, placeholder: "Decatur, GA" },
      { name: "count", label: "How many leads", type: "number", default: 10 },
      { name: "extra", label: "Filters or notes", type: "textarea", placeholder: "Bad reviews, no website, owner-operated…" },
    ],
    run: (i, ctx) => {
      const n = Math.max(1, Math.min(50, Number(i.count) || 10));
      const archetypes = [
        "Owner-operated, 5-15 reviews",
        "1-2 stars, last review > 30 days",
        "No website / outdated site",
        "Active on FB, dead on Google",
        "Gets calls from 3+ neighborhoods",
        "Listed but missing photos",
        "Service area > 10 miles",
        "Featured snippet opportunity",
      ];
      const sample = Array.from({ length: n }, (_, k) => {
        const idx = k % archetypes.length;
        return bullet(
          `${i.niche} prospect #${k + 1} — ${archetypes[idx]}`
        );
      }).join("\n");
      return block(
        `LOCAL LEAD HUNT — ${i.niche.toUpperCase()} in ${i.city}`,
        "—".repeat(48),
        "",
        "🔎 Search stack",
        block(
          bullet(`Google Maps: "${i.niche} near ${i.city}" — sort by reviews ASC`),
          bullet(`Facebook: groups of "${i.city}" + "recommend ${i.niche}"`),
          bullet(`Yelp: 1-3★ in ${i.city} → easiest "we can fix" pitch`),
          bullet(`BBB / IG hashtags: #${i.niche.replace(/\s+/g, "").toLowerCase()}${i.city.replace(/[^a-z]/gi, "").toLowerCase()}`),
          bullet(`LinkedIn Sales Nav (free): "owner" + "${i.niche}" + "${i.city}"`)
        ),
        "",
        `🎯 Target archetypes (${n})`,
        sample,
        "",
        i.extra ? `🧠 Filters: ${fmt(i.extra)}` : "",
        "",
        "✅ Next move",
        block(
          bullet("Drop names + phone into Leads tab"),
          bullet(`Run "Create Cold Text" on top 5`),
          bullet(`Schedule first follow-up 48h out`)
        ),
        "",
        `— ${ctx.settings.ownerName || "AB"} · ${ctx.settings.businessName}`
      );
    },
  },

  {
    id: "create_cold_text",
    name: "Create Cold Text",
    description: "Short, friendly SMS that gets a reply.",
    icon: "phone",
    accent: "Outreach",
    fields: [
      { name: "businessName", label: "Their business", type: "text", required: true },
      { name: "ownerFirstName", label: "Owner first name", type: "text" },
      { name: "service", label: "Service you offer", type: "text", required: true, placeholder: "Pressure washing, AI receptionist…" },
      { name: "hook", label: "Personal hook", type: "textarea", placeholder: "Saw your storefront on Maps, the lot looks busy…" },
    ],
    run: (i, ctx) => {
      const owner = fmt(i.ownerFirstName) || "there";
      return block(
        `Hey ${owner} — quick one. ${fmt(i.hook) || `Saw ${i.businessName} on Maps.`} ` +
          `I help local spots in your area with ${fmt(i.service)} (no pressure, no pitch). Worth a 2-min look at what we do?`,
        "",
        `— ${ctx.settings.ownerName || "AB"}, ${ctx.settings.businessName}`,
        "",
        "(Reply STOP to opt out.)"
      );
    },
  },

  {
    id: "create_cold_email",
    name: "Create Cold Email",
    description: "Professional cold email — short subject + 4 sentences.",
    icon: "mail",
    accent: "Outreach",
    fields: [
      { name: "businessName", label: "Their business", type: "text", required: true },
      { name: "ownerFirstName", label: "Owner first name", type: "text" },
      { name: "service", label: "Service you offer", type: "text", required: true },
      { name: "result", label: "Specific result you deliver", type: "text", placeholder: "+30% missed calls captured / 12 new bookings" },
      { name: "hook", label: "Personal observation", type: "textarea" },
    ],
    run: (i, ctx) => {
      const owner = fmt(i.ownerFirstName) || "there";
      return block(
        `SUBJECT: Quick idea for ${i.businessName}`,
        "",
        `Hi ${owner},`,
        "",
        `${fmt(i.hook) || `I came across ${i.businessName} and noticed a quick win you could capture.`} I help local businesses with ${fmt(
          i.service
        )} — most clients see ${fmt(i.result) || "more booked jobs within 30 days"}.`,
        "",
        `If it's useful, I'll send a 60-second loom showing exactly what I'd do for ${i.businessName} — no meeting needed.`,
        "",
        `Worth a look?`,
        "",
        `— ${ctx.settings.ownerName || "AB"}`,
        `${ctx.settings.businessName} · ${ctx.settings.phone}`,
        ctx.settings.email
      );
    },
  },

  {
    id: "follow_up_with_leads",
    name: "Follow Up With Leads",
    description: "Soft-touch follow-up that doesn't feel pushy.",
    icon: "message",
    accent: "Outreach",
    fields: [
      { name: "ownerFirstName", label: "Owner first name", type: "text" },
      { name: "businessName", label: "Their business", type: "text", required: true },
      { name: "lastTouchDays", label: "Days since last contact", type: "number", default: 3 },
      { name: "channel", label: "Channel", type: "select", options: ["Text", "Email", "FB DM", "Call"], default: "Text" },
      { name: "context", label: "Last conversation context", type: "textarea" },
    ],
    run: (i, ctx) => {
      const owner = fmt(i.ownerFirstName) || "hey";
      const ch = i.channel || "Text";
      const days = i.lastTouchDays || 3;
      const intros = {
        Text: `Hey ${owner} — circling back, didn't want this to slip.`,
        Email: `Hi ${owner}, bumping this back up — figured ${days} days was enough breathing room.`,
        "FB DM": `Hey ${owner} 👋 catching up here.`,
        Call: `(Voicemail script) Hey ${owner}, ${ctx.settings.ownerName || "AB"} from ${ctx.settings.businessName}.`,
      };
      return block(
        intros[ch],
        "",
        i.context ? `Last we talked: ${fmt(i.context)}.` : "",
        "Want me to send over a quick mock so you can see the deliverable on your end? 30 seconds to look, zero pressure either way.",
        "",
        `— ${ctx.settings.ownerName || "AB"}`
      );
    },
  },

  {
    id: "build_client_offer",
    name: "Build Client Offer",
    description: "One-page service offer with scope, deliverables, and price.",
    icon: "doc",
    accent: "Sales",
    fields: [
      { name: "client", label: "Client name", type: "text", required: true },
      { name: "service", label: "Service / package", type: "text", required: true },
      { name: "outcomes", label: "Outcomes (one per line)", type: "textarea", placeholder: "More inbound calls\nFewer missed leads" },
      { name: "deliverables", label: "Deliverables (one per line)", type: "textarea" },
      { name: "price", label: "Price (USD)", type: "number" },
      { name: "timeline", label: "Timeline", type: "text", default: "14 days" },
    ],
    run: (i, ctx) => {
      const oc = (i.outcomes || "").split(/\n+/).filter(Boolean);
      const dl = (i.deliverables || "").split(/\n+/).filter(Boolean);
      return block(
        `OFFER — ${i.client}`,
        "—".repeat(48),
        `Prepared by: ${ctx.settings.ownerName || "AB"} · ${ctx.settings.businessName}`,
        `Date: ${new Date().toLocaleDateString()}`,
        "",
        `Engagement: ${i.service}`,
        `Investment: $${Number(i.price || 0).toLocaleString()}`,
        `Timeline: ${i.timeline || "14 days"}`,
        "",
        "Outcomes",
        oc.length ? oc.map(bullet).join("\n") : bullet("Defined during kickoff"),
        "",
        "What you get",
        dl.length ? dl.map(bullet).join("\n") : bullet("Custom build per scope above"),
        "",
        "Process",
        block(
          bullet("Kickoff call (30 min) — confirm scope"),
          bullet("Build phase — async updates"),
          bullet("Review + revisions"),
          bullet("Launch + 14-day post-launch support")
        ),
        "",
        `Reply "let's go" to lock the slot. — ${ctx.settings.ownerName || "AB"}`
      );
    },
  },

  {
    id: "generate_flyer",
    name: "Generate Flyer",
    description: "Punchy flyer copy: headline, body, CTA, and design notes.",
    icon: "flyer",
    accent: "Marketing",
    fields: [
      { name: "service", label: "Service to feature", type: "text", required: true },
      { name: "audience", label: "Target audience", type: "text", placeholder: "Homeowners in Decatur" },
      { name: "offer", label: "Special offer", type: "text", placeholder: "$99 driveway wash this week" },
      { name: "cta", label: "Call to action", type: "text", default: "Text TODAY for a free quote" },
    ],
    run: (i, ctx) => {
      return block(
        `FLYER — ${i.service.toUpperCase()}`,
        "—".repeat(48),
        "",
        "🟧 HEADLINE",
        `"${fmt(i.offer) || `Get ${i.service} that actually shows up`}"`,
        "",
        "📝 BODY",
        block(
          `Hey ${fmt(i.audience) || "neighbor"} — tired of waiting on no-shows?`,
          `${ctx.settings.businessName} handles ${fmt(i.service)} fast, clean, and on-schedule.`,
          `Locally owned. Insured. Built by people who pick up the phone.`
        ),
        "",
        "✅ BULLETS",
        block(
          bullet("Same-week scheduling"),
          bullet("Upfront pricing — no surprises"),
          bullet("Satisfaction guaranteed or you don't pay")
        ),
        "",
        "🔥 CTA",
        `${fmt(i.cta) || "Text us today"} → ${ctx.settings.phone}`,
        "",
        "🎨 DESIGN NOTES",
        block(
          bullet(`Background: charcoal #111 with brand orange (${ctx.settings.brandPrimary}) accents`),
          bullet("Headline: heavy weight, all caps, 64-72pt"),
          bullet("Hero photo: real, recent, before/after"),
          bullet("QR code bottom-right linking to booking page")
        )
      );
    },
  },

  {
    id: "make_tiktok_script",
    name: "Make TikTok Script",
    description: "30-45s short-form script: hook, beats, captions, hashtags.",
    icon: "tiktok",
    accent: "Content",
    fields: [
      { name: "topic", label: "Topic / angle", type: "text", required: true, placeholder: "Day in the life of running an AI cleaning business" },
      { name: "audience", label: "Who it's for", type: "text", placeholder: "Local service owners" },
      { name: "tone", label: "Tone", type: "select", options: ["Punchy", "Story", "Educational", "Funny"], default: "Punchy" },
    ],
    run: (i) => {
      const hooks = {
        Punchy: `"You're losing 3 jobs a week. Here's why."`,
        Story: `"6 months ago I drove for DoorDash. Today I run an AI business. Watch."`,
        Educational: `"3 things every local biz owner gets wrong about AI."`,
        Funny: `"POV: your competitor still answers the phone like it's 2009."`,
      };
      return block(
        `TIKTOK SCRIPT — ${i.topic.toUpperCase()}`,
        "—".repeat(48),
        `Tone: ${i.tone || "Punchy"} · Audience: ${fmt(i.audience) || "general"}`,
        "",
        "🎬 0-3s — HOOK",
        hooks[i.tone || "Punchy"],
        "",
        "📍 3-10s — SETUP",
        "Frame the problem in one sentence. Show a quick on-screen text receipt.",
        "",
        "🛠 10-25s — PROOF / VALUE",
        block(
          bullet("Beat 1: The mistake (concrete)"),
          bullet("Beat 2: The fix (in 1 line)"),
          bullet("Beat 3: The result (with a number)")
        ),
        "",
        "🎯 25-40s — CTA",
        `"Comment '${i.topic.split(" ")[0]}' and I'll DM the playbook."`,
        "",
        "📝 CAPTIONS / B-ROLL",
        block(
          bullet("On-screen text every 1.2s"),
          bullet("B-roll: trucks, screens, before/after, owner laughing"),
          bullet("Music: trending non-vocal, 90 BPM-ish")
        ),
        "",
        "🏷️ HASHTAGS",
        "#smallbusiness #localbusiness #aiautomation #entrepreneur #servicebusiness"
      );
    },
  },

  {
    id: "create_invoice",
    name: "Create Invoice",
    description: "Plain-text invoice ready to send.",
    icon: "invoice",
    accent: "Ops",
    fields: [
      { name: "client", label: "Client name", type: "text", required: true },
      { name: "items", label: "Line items (qty | desc | price)", type: "textarea", placeholder: "1 | AI receptionist setup | 1200\n1 | Local SEO monthly | 600", required: true },
      { name: "due", label: "Due date", type: "date" },
      { name: "notes", label: "Notes", type: "textarea" },
    ],
    run: (i, ctx) => {
      const lines = (i.items || "").split(/\n+/).filter(Boolean).map((row) => {
        const [qty = "1", desc = "Service", price = "0"] = row.split("|").map((s) => s.trim());
        return { qty: Number(qty) || 1, desc, price: Number(price) || 0 };
      });
      const subtotal = lines.reduce((s, l) => s + l.qty * l.price, 0);
      const num = Math.floor(Math.random() * 9000) + 1000;
      return block(
        `INVOICE #${num}`,
        "—".repeat(48),
        `From: ${ctx.settings.businessName}`,
        `       ${ctx.settings.email} · ${ctx.settings.phone}`,
        `Bill to: ${i.client}`,
        `Issued: ${new Date().toLocaleDateString()}`,
        i.due ? `Due: ${new Date(i.due).toLocaleDateString()}` : "",
        "",
        "QTY  DESCRIPTION                                PRICE",
        "—".repeat(56),
        ...lines.map((l) => {
          const desc = l.desc.padEnd(40, " ").slice(0, 40);
          return `${String(l.qty).padStart(3, " ")}  ${desc}  $${(l.qty * l.price).toFixed(2).padStart(8, " ")}`;
        }),
        "—".repeat(56),
        `${" ".repeat(46)}TOTAL  $${subtotal.toFixed(2)}`,
        "",
        i.notes ? `Notes: ${fmt(i.notes)}` : "",
        "",
        "Payment: Zelle / ACH / Card (link on request).",
        "Thank you — repeat work always appreciated."
      );
    },
  },

  {
    id: "daily_business_plan",
    name: "Daily Business Plan",
    description: "A focused daily plan: leads, follow-ups, content, money.",
    icon: "list",
    accent: "Planning",
    fields: [
      { name: "focus", label: "Today's primary focus", type: "text", placeholder: "Book 2 demos" },
      { name: "energy", label: "Energy level", type: "select", options: ["Low", "Medium", "High"], default: "Medium" },
      { name: "constraints", label: "Constraints", type: "textarea", placeholder: "Out of pocket 1-3pm" },
    ],
    run: (i, ctx) => {
      const energy = i.energy || "Medium";
      const blocksByEnergy = {
        Low: { o: 8, f: 4, c: 1, p: "single deep work session" },
        Medium: { o: 15, f: 8, c: 2, p: "two outreach sprints + 1 build block" },
        High: { o: 30, f: 15, c: 3, p: "max-volume cold day" },
      };
      const m = blocksByEnergy[energy];
      return block(
        `DAILY BATTLE PLAN — ${new Date().toLocaleDateString()}`,
        "—".repeat(48),
        `Operator: ${ctx.settings.ownerName || "AB"} · Mode: ${energy} (${m.p})`,
        i.focus ? `🎯 Primary: ${fmt(i.focus)}` : "",
        i.constraints ? `🚧 Constraints: ${fmt(i.constraints)}` : "",
        "",
        "🌅 MORNING (1.5h)",
        block(
          bullet(`${m.o} cold messages (text + email mix)`),
          bullet(`${m.f} follow-ups from yesterday`),
          bullet("Inbox zero — only what moves money")
        ),
        "",
        "☀️ MIDDAY (2h)",
        block(
          bullet("Client work — 1 deliverable shipped"),
          bullet(`${m.c} content drops (TikTok / FB / IG)`),
          bullet("Update Leads tab — close stale rows")
        ),
        "",
        "🌙 EVENING (45m)",
        block(
          bullet("Review the day — 1 win, 1 lesson"),
          bullet("Stack tomorrow's first move"),
          bullet("Save winning copy to Vault")
        ),
        "",
        `💰 Money line — push toward weekly goal of $${ctx.settings.weeklyRevenueGoal.toLocaleString()}.`
      );
    },
  },

  {
    id: "client_status_report",
    name: "Client Status Report",
    description: "Friendly weekly update: progress, blockers, next steps.",
    icon: "doc",
    accent: "Ops",
    fields: [
      { name: "client", label: "Client name", type: "text", required: true },
      { name: "wins", label: "Wins this week", type: "textarea" },
      { name: "blockers", label: "Blockers", type: "textarea" },
      { name: "next", label: "Next steps", type: "textarea" },
    ],
    run: (i, ctx) => {
      const list = (s) => (s || "").split(/\n+/).filter(Boolean).map(bullet).join("\n") || bullet("—");
      return block(
        `STATUS UPDATE — ${i.client}`,
        `Week of ${new Date().toLocaleDateString()}`,
        "—".repeat(48),
        "",
        "✅ Wins",
        list(i.wins),
        "",
        "🚧 Blockers",
        list(i.blockers),
        "",
        "➡️ Next",
        list(i.next),
        "",
        `Anything you want me to bump priority on? Just reply.`,
        "",
        `— ${ctx.settings.ownerName || "AB"} · ${ctx.settings.businessName}`
      );
    },
  },
];

export const skillById = (id) => SKILLS.find((s) => s.id === id);
