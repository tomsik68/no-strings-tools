const KEY = "kitchen-timer";
let timers = JSON.parse(localStorage.getItem(KEY) || "null") || [
  { id: crypto.randomUUID(), name: "Pasta", minutes: 10, seconds: 0, endAt: null, remaining: 600 },
];

const save = () => localStorage.setItem(KEY, JSON.stringify(timers.map((t) => ({
  ...t, endAt: t.endAt, // keep running across reload
}))));
const esc = (t) => { const d = document.createElement("div"); d.textContent = t ?? ""; return d.innerHTML; };
const pad = (n) => String(n).padStart(2, "0");

function remainingOf(t) {
  if (t.endAt) return Math.max(0, Math.round((t.endAt - Date.now()) / 1000));
  return t.remaining ?? (t.minutes * 60 + (t.seconds || 0));
}

function fmt(sec) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${pad(s)}`;
}

function beep() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.connect(g); g.connect(ctx.destination);
    o.frequency.value = 880;
    g.gain.value = 0.15;
    o.start();
    setTimeout(() => { o.stop(); ctx.close(); }, 400);
  } catch {}
}

function render() {
  const el = document.getElementById("timers");
  el.innerHTML = timers.map((t) => {
    const rem = remainingOf(t);
    const running = !!t.endAt && rem > 0;
    const done = t.endAt && rem === 0;
    return `<div class="w3-panel w3-white w3-round w3-border" style="padding:14px;margin:0 0 10px;" data-id="${t.id}">
      <div style="display:flex;gap:8px;align-items:center;">
        <input class="w3-input w3-border w3-round name" data-id="${t.id}" value="${esc(t.name)}" style="flex:1;" ${running ? "readonly" : ""} />
        <button class="w3-button w3-small w3-text-grey del" data-id="${t.id}" aria-label="Remove">×</button>
      </div>
      <div style="font-size:40px;font-weight:700;text-align:center;margin:8px 0;font-variant-numeric:tabular-nums;${done ? "color:#c62828;" : ""}">${fmt(rem)}${done ? " ✓" : ""}</div>
      <div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap;">
        ${!running && !done ? `
          <input type="number" min="0" class="w3-input w3-border w3-round mins" data-id="${t.id}" value="${t.minutes}" style="width:70px;" aria-label="Minutes" />
          <span style="align-self:center;">min</span>
          <input type="number" min="0" max="59" class="w3-input w3-border w3-round secs" data-id="${t.id}" value="${t.seconds || 0}" style="width:70px;" aria-label="Seconds" />
          <span style="align-self:center;">sec</span>
          <button class="w3-button w3-blue w3-round start" data-id="${t.id}">Start</button>
        ` : `
          <button class="w3-button w3-red w3-round stop" data-id="${t.id}">${done ? "Reset" : "Stop"}</button>
        `}
      </div>
    </div>`;
  }).join("");
}

document.getElementById("timers").addEventListener("click", (e) => {
  const id = e.target.closest("[data-id]")?.dataset.id;
  if (!id) return;
  const t = timers.find((x) => x.id === id);
  if (!t) return;

  if (e.target.closest(".del")) {
    timers = timers.filter((x) => x.id !== id);
    save();
    render();
    return;
  }
  if (e.target.closest(".start")) {
    const total = (t.minutes || 0) * 60 + (t.seconds || 0);
    if (total <= 0) return;
    t.remaining = total;
    t.endAt = Date.now() + total * 1000;
    save();
    render();
    return;
  }
  if (e.target.closest(".stop")) {
    t.remaining = (t.minutes || 0) * 60 + (t.seconds || 0);
    t.endAt = null;
    save();
    render();
  }
});

document.getElementById("timers").addEventListener("input", (e) => {
  const id = e.target.dataset.id;
  const t = timers.find((x) => x.id === id);
  if (!t || t.endAt) return;
  if (e.target.classList.contains("name")) t.name = e.target.value;
  if (e.target.classList.contains("mins")) t.minutes = Math.max(0, parseInt(e.target.value, 10) || 0);
  if (e.target.classList.contains("secs")) t.seconds = Math.min(59, Math.max(0, parseInt(e.target.value, 10) || 0));
  t.remaining = t.minutes * 60 + (t.seconds || 0);
  save();
});

document.getElementById("add").addEventListener("click", () => {
  if (timers.length >= 4) return;
  timers.push({ id: crypto.randomUUID(), name: "Timer " + (timers.length + 1), minutes: 5, seconds: 0, endAt: null, remaining: 300 });
  save();
  render();
});

// Restore running timers after reload; beep when done
const doneIds = new Set();
setInterval(() => {
  let need = false;
  for (const t of timers) {
    if (!t.endAt) continue;
    const rem = remainingOf(t);
    if (rem === 0 && !doneIds.has(t.id)) {
      doneIds.add(t.id);
      beep();
      need = true;
    }
    if (rem > 0) doneIds.delete(t.id);
    need = true;
  }
  if (need) render();
}, 250);

render();
