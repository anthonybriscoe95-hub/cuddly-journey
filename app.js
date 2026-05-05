// Leftover Chef — calls the Anthropic API directly from the browser.
// API key is stored in localStorage and only sent to api.anthropic.com.

const MODEL = "claude-sonnet-4-6";
const API_URL = "https://api.anthropic.com/v1/messages";
const KEY_STORAGE = "leftover-chef.api-key";
const MAX_BYTES = 5 * 1024 * 1024;
const MAX_DIM = 1568; // Anthropic vision recommended max edge

const $ = (id) => document.getElementById(id);

const state = {
  imageBase64: null,
  imageMediaType: null,
};

// ---------- Settings modal ----------
const modal = $("settings-modal");
const apiKeyInput = $("api-key");

$("settings-btn").addEventListener("click", openSettings);
$("save-key").addEventListener("click", (e) => {
  e.preventDefault();
  const key = apiKeyInput.value.trim();
  if (key) {
    localStorage.setItem(KEY_STORAGE, key);
  }
  modal.close();
});
$("clear-key").addEventListener("click", () => {
  apiKeyInput.value = "";
  localStorage.removeItem(KEY_STORAGE);
});

function openSettings() {
  apiKeyInput.value = localStorage.getItem(KEY_STORAGE) || "";
  modal.showModal();
}

function getApiKey() {
  return localStorage.getItem(KEY_STORAGE) || "";
}

// ---------- File / camera input ----------
const dropzone = $("dropzone");
const fileInput = $("file-input");
const previewWrap = $("preview-wrap");
const previewImg = $("preview-img");
const captureSection = $("capture-section");
const extras = $("extras");

dropzone.addEventListener("click", () => fileInput.click());
dropzone.addEventListener("keydown", (e) => {
  if (e.key === "Enter" || e.key === " ") { e.preventDefault(); fileInput.click(); }
});
["dragenter", "dragover"].forEach((ev) =>
  dropzone.addEventListener(ev, (e) => { e.preventDefault(); dropzone.classList.add("dragover"); })
);
["dragleave", "drop"].forEach((ev) =>
  dropzone.addEventListener(ev, (e) => { e.preventDefault(); dropzone.classList.remove("dragover"); })
);
dropzone.addEventListener("drop", (e) => {
  const f = e.dataTransfer?.files?.[0];
  if (f) handleFile(f);
});
fileInput.addEventListener("change", (e) => {
  const f = e.target.files?.[0];
  if (f) handleFile(f);
});

$("retake-btn").addEventListener("click", () => {
  state.imageBase64 = null;
  state.imageMediaType = null;
  fileInput.value = "";
  previewWrap.classList.add("hidden");
  dropzone.classList.remove("hidden");
  extras.classList.add("hidden");
});

$("cook-btn").addEventListener("click", () => findRecipes());

async function handleFile(file) {
  if (!file.type.startsWith("image/")) {
    showStatus("That doesn't look like an image. Try a JPG or PNG.", true);
    return;
  }
  if (file.size > MAX_BYTES) {
    showStatus("That image is over 5 MB. I'll resize it for you.", false);
  }
  try {
    const { base64, mediaType, dataUrl } = await prepareImage(file);
    state.imageBase64 = base64;
    state.imageMediaType = mediaType;
    previewImg.src = dataUrl;
    dropzone.classList.add("hidden");
    previewWrap.classList.remove("hidden");
    extras.classList.remove("hidden");
    clearStatus();
  } catch (err) {
    console.error(err);
    showStatus("Couldn't read that image. Try another one.", true);
  }
}

// Resize image to a reasonable size, return base64 + media type.
function prepareImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error);
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("decode"));
      img.onload = () => {
        const scale = Math.min(1, MAX_DIM / Math.max(img.width, img.height));
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const canvas = document.createElement("canvas");
        canvas.width = w; canvas.height = h;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, w, h);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
        const base64 = dataUrl.split(",")[1];
        resolve({ base64, mediaType: "image/jpeg", dataUrl });
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

// ---------- Anthropic API call ----------
const SYSTEM_PROMPT = `You are Leftover Chef, a practical kitchen assistant. You look at a photo of someone's fridge or pantry and suggest three real recipes they can make right now using mostly what's visible.

Rules:
- Identify ONLY ingredients you can actually see in the photo. Don't hallucinate items.
- For each ingredient, estimate freshness based on visual cues (color, wilting, packaging, container condition):
  - "fresh" — clearly fine
  - "soon" — should be used within a couple of days
  - "urgent" — visibly wilting, browning, or otherwise needs to be used today
- Suggest exactly three recipes. Rank them so urgent/soon ingredients get used first.
- Each recipe should mostly use visible ingredients. List a small number of "needs" only for common pantry staples (salt, pepper, oil, garlic, vinegar, basic spices, flour, eggs, butter, soy sauce, rice, pasta, stock).
- Keep steps short and concrete (5-8 steps).
- Times should be realistic.

Always respond with a single JSON object, no prose, no markdown fences, with this exact shape:
{
  "ingredients": [
    {"name": "string", "freshness": "fresh" | "soon" | "urgent", "note": "string (optional, brief visual reason)"}
  ],
  "urgencyNote": "string — one short sentence about what's most urgent, or empty string if nothing's urgent",
  "recipes": [
    {
      "title": "string",
      "time": "string e.g. '20 min'",
      "servings": "string e.g. '2 servings'",
      "why": "string — one sentence on why this fits what's in the fridge",
      "uses": ["ingredient names from the photo"],
      "needs": ["pantry staples needed but not visible"],
      "steps": ["short imperative step", "..."]
    }
  ]
}`;

function buildUserPrompt({ diet, time, notes }) {
  const constraints = [];
  if (diet && diet !== "any") constraints.push(`Diet: ${diet}.`);
  if (time && time !== "any") constraints.push(`Time available: ${time}.`);
  if (notes) constraints.push(`User notes: ${notes}`);
  const constraintLine = constraints.length
    ? `Constraints: ${constraints.join(" ")}`
    : "No extra constraints.";
  return `Look at this photo of my fridge/pantry and suggest three recipes I can make.\n\n${constraintLine}\n\nReturn the JSON object only.`;
}

async function findRecipes() {
  const apiKey = getApiKey();
  if (!apiKey) {
    showStatus("Add your Anthropic API key in Settings first.", true);
    openSettings();
    return;
  }
  if (!state.imageBase64) {
    showStatus("Take a photo first.", true);
    return;
  }

  $("cook-btn").disabled = true;
  $("results").classList.add("hidden");
  showStatus(`<span class="spinner"></span>Looking at your fridge…`, false);

  const body = {
    model: MODEL,
    max_tokens: 2048,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: {
              type: "base64",
              media_type: state.imageMediaType,
              data: state.imageBase64,
            },
          },
          {
            type: "text",
            text: buildUserPrompt({
              diet: $("diet").value,
              time: $("time").value,
              notes: $("notes").value.trim(),
            }),
          },
        ],
      },
    ],
  };

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "anthropic-dangerous-direct-browser-access": "true",
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const txt = await res.text();
      let msg = `Request failed (${res.status}).`;
      try {
        const j = JSON.parse(txt);
        if (j?.error?.message) msg = j.error.message;
      } catch {}
      throw new Error(msg);
    }
    const data = await res.json();
    const text = data?.content?.[0]?.text || "";
    const parsed = parseJsonLoose(text);
    if (!parsed || !Array.isArray(parsed.recipes)) {
      throw new Error("The model didn't return valid recipes. Try a clearer photo.");
    }
    renderResults(parsed);
    clearStatus();
  } catch (err) {
    console.error(err);
    showStatus(err.message || "Something went wrong.", true);
  } finally {
    $("cook-btn").disabled = false;
  }
}

// Tolerate stray prose around the JSON.
function parseJsonLoose(text) {
  try { return JSON.parse(text); } catch {}
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start >= 0 && end > start) {
    try { return JSON.parse(text.slice(start, end + 1)); } catch {}
  }
  return null;
}

// ---------- Rendering ----------
function renderResults({ ingredients = [], urgencyNote = "", recipes = [] }) {
  const ingList = $("ingredients-list");
  ingList.innerHTML = "";
  ingredients.forEach((i) => {
    const li = document.createElement("li");
    const name = document.createElement("span");
    name.className = "name";
    name.textContent = i.name + (i.note ? ` — ${i.note}` : "");
    const tag = document.createElement("span");
    const fresh = ["fresh", "soon", "urgent"].includes(i.freshness) ? i.freshness : "fresh";
    tag.className = `tag ${fresh}`;
    tag.textContent = fresh;
    li.appendChild(name);
    li.appendChild(tag);
    ingList.appendChild(li);
  });
  $("urgency-note").textContent = urgencyNote || "";

  const recipesEl = $("recipes");
  recipesEl.innerHTML = "";
  recipes.forEach((r) => recipesEl.appendChild(renderRecipe(r)));

  $("results").classList.remove("hidden");
  $("results").scrollIntoView({ behavior: "smooth", block: "start" });
}

function renderRecipe(r) {
  const el = document.createElement("article");
  el.className = "recipe";

  const header = document.createElement("div");
  header.className = "recipe-header";
  const h = document.createElement("h3");
  h.className = "recipe-title";
  h.textContent = r.title || "Untitled";
  const meta = document.createElement("div");
  meta.className = "recipe-meta";
  meta.textContent = [r.time, r.servings].filter(Boolean).join(" · ");
  header.appendChild(h);
  header.appendChild(meta);
  el.appendChild(header);

  if (r.why) {
    const why = document.createElement("p");
    why.className = "recipe-why";
    why.textContent = r.why;
    el.appendChild(why);
  }

  if (Array.isArray(r.uses) && r.uses.length) {
    el.appendChild(sectionTitle("Uses from your photo"));
    const ul = document.createElement("ul");
    r.uses.forEach((u) => {
      const li = document.createElement("li");
      li.className = "uses";
      li.textContent = u;
      ul.appendChild(li);
    });
    el.appendChild(ul);
  }

  if (Array.isArray(r.needs) && r.needs.length) {
    el.appendChild(sectionTitle("Plus pantry staples"));
    const ul = document.createElement("ul");
    r.needs.forEach((n) => {
      const li = document.createElement("li");
      li.className = "needs";
      li.textContent = n;
      ul.appendChild(li);
    });
    el.appendChild(ul);
  }

  if (Array.isArray(r.steps) && r.steps.length) {
    el.appendChild(sectionTitle("Steps"));
    const ol = document.createElement("ol");
    r.steps.forEach((s) => {
      const li = document.createElement("li");
      li.textContent = s;
      ol.appendChild(li);
    });
    el.appendChild(ol);
  }

  return el;
}

function sectionTitle(text) {
  const d = document.createElement("div");
  d.className = "recipe-section-title";
  d.textContent = text;
  return d;
}

// ---------- Status ----------
function showStatus(html, isError) {
  const s = $("status");
  s.innerHTML = html;
  s.classList.remove("hidden");
  s.classList.toggle("error", !!isError);
}
function clearStatus() {
  const s = $("status");
  s.innerHTML = "";
  s.classList.add("hidden");
  s.classList.remove("error");
}

// First-run hint.
if (!getApiKey()) {
  // Defer slightly so the modal opens after first paint.
  window.addEventListener("load", () => setTimeout(openSettings, 400));
}
