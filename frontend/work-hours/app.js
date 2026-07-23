const KEY = "work-hours";
let data = JSON.parse(localStorage.getItem(KEY) || '{"entries":[],"open":null}');
if (!data.entries) data = { entries: [], open: null };

const save = () => localStorage.setItem(KEY, JSON.stringify(data));
const esc = (t) => { const d = document.createElement("div"); d.textContent = t; return d.innerHTML; };

function pad(n) { return String(n).padStart(2, "0"); }

function fmtDuration(ms) {
  if (ms < 0) ms = 0;
  const m = Math.floor(ms / 60000);
  const h = Math.floor(m / 60);
  return `${h}:${pad(m % 60)}`;
}

function weekStart(d = new Date()) {
  const x = new Date(d);
  const day = (x.getDay() + 6) % 7; // Monday = 0
  x.setHours(0, 0, 0, 0);
  x.setDate(x.getDate() - day);
  return x;
}

function entryMs(e) {
  return new Date(e.end).getTime() - new Date(e.start).getTime();
}

function weekTotalMs() {
  const start = weekStart().getTime();
  let total = data.entries.reduce((s, e) => {
    if (new Date(e.start).getTime() >= start) return s + entryMs(e);
    return s;
  }, 0);
  if (data.open) {
    const openStart = new Date(data.open).getTime();
    if (openStart >= start) total += Date.now() - openStart;
  }
  return total;
}

function fmtWhen(iso) {
  const d = new Date(iso);
  return d.toLocaleString(undefined, { weekday: "short", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

function fmtDay(iso) {
  return new Date(iso).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
}

function render() {
  document.getElementById("week-total").textContent = fmtDuration(weekTotalMs());
  const btn = document.getElementById("clock-btn");
  const status = document.getElementById("status-line");

  if (data.open) {
    btn.textContent = "Clock Out";
    btn.className = "w3-button w3-red w3-round w3-large";
    status.textContent = `In since ${fmtWhen(data.open)} · ${fmtDuration(Date.now() - new Date(data.open).getTime())}`;
  } else {
    btn.textContent = "Clock In";
    btn.className = "w3-button w3-blue w3-round w3-large";
    status.textContent = "Not clocked in";
  }

  const list = document.getElementById("entry-list");
  const recent = [...data.entries].sort((a, b) => b.start.localeCompare(a.start)).slice(0, 30);
  if (!recent.length) {
    list.innerHTML = '<p class="w3-text-grey w3-center">No entries yet.</p>';
    return;
  }
  list.innerHTML = recent.map((e) => `
    <div class="w3-panel w3-white w3-round w3-border" style="padding: 10px 14px; margin: 0 0 8px; display: flex; align-items: center; gap: 10px;">
      <div style="flex: 1; min-width: 0;">
        <div style="font-weight: 600;">${esc(fmtDay(e.start))}</div>
        <div class="w3-text-grey w3-small">${esc(new Date(e.start).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" }))} – ${esc(new Date(e.end).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" }))}</div>
      </div>
      <div style="font-weight: 700;">${fmtDuration(entryMs(e))}</div>
      <button class="w3-button w3-small w3-text-grey" data-id="${e.id}" aria-label="Delete" style="padding: 4px 8px;">×</button>
    </div>`).join("");
}

document.getElementById("clock-btn").addEventListener("click", () => {
  if (data.open) {
    data.entries.push({ id: crypto.randomUUID(), start: data.open, end: new Date().toISOString() });
    data.open = null;
  } else {
    data.open = new Date().toISOString();
  }
  save();
  render();
});

document.getElementById("entry-list").addEventListener("click", (ev) => {
  const btn = ev.target.closest("[data-id]");
  if (!btn) return;
  data.entries = data.entries.filter((e) => e.id !== btn.dataset.id);
  save();
  render();
});

document.getElementById("man-date").value = new Date().toISOString().slice(0, 10);

document.getElementById("man-add").addEventListener("click", () => {
  const date = document.getElementById("man-date").value;
  const start = document.getElementById("man-start").value;
  const end = document.getElementById("man-end").value;
  if (!date || !start || !end) return;
  const s = new Date(`${date}T${start}:00`);
  const e = new Date(`${date}T${end}:00`);
  if (e <= s) { e.setDate(e.getDate() + 1); }
  data.entries.push({ id: crypto.randomUUID(), start: s.toISOString(), end: e.toISOString() });
  save();
  render();
});

render();
setInterval(() => { if (data.open) render(); }, 30000);
