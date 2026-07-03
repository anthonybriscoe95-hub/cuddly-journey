export const COMPANY = {
  name: "Harbor Glass Window Cleaning",
  shortName: "Harbor Glass",
  phone: "302-494-9680",
  phoneHref: "tel:+13024949680",
  email: "harborglasscleaning@gmail.com",
  website: "harborglasswindowcleaning.com",
  websiteHref: "https://harborglasswindowcleaning.com",
  tagline: "Streak-free windows. Free estimates.",
  serviceArea: "Delaware — New Castle, Kent & Sussex counties",
};

export const SERVICES = [
  { id: "residential", name: "Residential Window Cleaning", desc: "Inside & out, sills and frames wiped, streak-free finish for your home.", basePrice: 8, unit: "per pane" },
  { id: "commercial", name: "Commercial Window Cleaning", desc: "Storefronts, offices, and low/mid-rise buildings on a schedule that fits.", basePrice: 4, unit: "per pane" },
  { id: "screen", name: "Screen Cleaning", desc: "Screens removed, washed, and reinstalled looking like new.", basePrice: 4, unit: "per screen" },
  { id: "track", name: "Track Cleaning", desc: "Window tracks vacuumed and detailed so windows glide again.", basePrice: 5, unit: "per track" },
  { id: "mirror", name: "Mirror Cleaning", desc: "Spotless, streak-free mirrors for homes, gyms, and salons.", basePrice: 6, unit: "per mirror" },
  { id: "skylight", name: "Skylight Cleaning", desc: "Hard-to-reach skylights cleaned safely with pure-water poles.", basePrice: 25, unit: "per skylight" },
  { id: "glass-doors", name: "Glass Doors", desc: "Sliders, storm doors, and shower glass polished crystal clear.", basePrice: 10, unit: "per door" },
];

export const LEAD_TYPES = [
  { id: "homeowner", label: "Homeowner" },
  { id: "business", label: "Storefront / Business" },
  { id: "realtor", label: "Realtor" },
  { id: "property_manager", label: "Property Manager" },
  { id: "airbnb", label: "Airbnb Host" },
];

// Legitimate lead channels. Social channels are for leads you spot yourself
// while participating in those communities — the app never scrapes them.
export const LEAD_SOURCES = [
  "Google Maps",
  "Website Inquiry",
  "Facebook Group (manual)",
  "Nextdoor (manual)",
  "Reddit (manual)",
  "Referral",
  "Door Knock",
  "Business Directory",
];

export const PIPELINE_STAGES = [
  { id: "new", label: "New Leads", color: "bg-harbor-500" },
  { id: "contacted", label: "Contacted", color: "bg-sky-400" },
  { id: "estimate", label: "Estimate Scheduled", color: "bg-amber-400" },
  { id: "quoted", label: "Quote Sent", color: "bg-violet-400" },
  { id: "won", label: "Won Jobs", color: "bg-emerald-500" },
  { id: "lost", label: "Lost Jobs", color: "bg-slate-400" },
];

export const money = (n) =>
  (Number(n) || 0).toLocaleString("en-US", { style: "currency", currency: "USD" });
