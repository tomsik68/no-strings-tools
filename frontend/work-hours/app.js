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

// --- CSV export ---
const exportRange = document.getElementById("export-range");
const exportSingle = document.getElementById("export-single");
const exportRangeFields = document.getElementById("export-range-fields");
const exportDate = document.getElementById("export-date");
const exportStart = document.getElementById("export-start");
const exportEnd = document.getElementById("export-end");

function localDateStr(d = new Date()) {
  const x = new Date(d);
  x.setMinutes(x.getMinutes() - x.getTimezoneOffset());
  return x.toISOString().slice(0, 10);
}

function setMidnight(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function updateExportFields() {
  const today = localDateStr();
  exportDate.value = today;
  const mode = exportRange.value;
  if (mode === "date") {
    exportSingle.style.display = "block";
    exportRangeFields.style.display = "none";
    exportStart.value = exportDate.value;
    exportEnd.value = exportDate.value;
  } else {
    exportSingle.style.display = "none";
    exportRangeFields.style.display = "block";
    const now = new Date();
    let start = new Date();
    let end = new Date();
    if (mode === "today") {
      start = setMidnight(now);
      end = setMidnight(now);
    } else if (mode === "week") {
      const day = (now.getDay() + 6) % 7; // Monday = 0
      start = setMidnight(now);
      start.setDate(start.getDate() - day);
      end = new Date(start);
      end.setDate(end.getDate() + 6);
    } else if (mode === "month") {
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    } else if (mode === "year") {
      start = new Date(now.getFullYear(), 0, 1);
      end = new Date(now.getFullYear(), 11, 31);
    } else {
      start = setMidnight(now);
      end = setMidnight(now);
    }
    exportStart.value = localDateStr(start);
    exportEnd.value = localDateStr(end);
  }
}

exportRange.addEventListener("change", updateExportFields);
exportDate.addEventListener("change", () => {
  exportStart.value = exportDate.value;
  exportEnd.value = exportDate.value;
});
exportStart.addEventListener("change", () => { exportRange.value = "custom"; });
exportEnd.addEventListener("change", () => { exportRange.value = "custom"; });

document.getElementById("export-btn").addEventListener("click", () => {
  const start = exportStart.value;
  const end = exportEnd.value;
  if (!start || !end) return;
  const startMs = setMidnight(new Date(start)).getTime();
  const endMs = setMidnight(new Date(end)).getTime() + 24 * 60 * 60 * 1000 - 1;
  const rows = data.entries
    .filter((e) => {
      const t = new Date(e.start).getTime();
      return t >= startMs && t <= endMs;
    })
    .sort((a, b) => a.start.localeCompare(b.start));
  if (!rows.length) {
    alert("No entries in the selected range.");
    return;
  }
  let csv = "Date,Start,End,Duration (h),Duration (HH:MM)\n";
  let totalMs = 0;
  for (const e of rows) {
    const s = new Date(e.start);
    const en = new Date(e.end);
    const ms = Math.max(0, en.getTime() - s.getTime());
    totalMs += ms;
    const hours = (ms / 3600000).toFixed(2);
    const h = Math.floor(ms / 3600000);
    const m = Math.floor((ms % 3600000) / 60000);
    const date = localDateStr(s);
    const startTime = s.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
    const endTime = en.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
    csv += `${date},${startTime},${endTime},${hours},${h}:${String(m).padStart(2, "0")}\n`;
  }
  const totalH = Math.floor(totalMs / 3600000);
  const totalM = Math.floor((totalMs % 3600000) / 60000);
  csv += `Total,,,${(totalMs / 3600000).toFixed(2)},${totalH}:${String(totalM).padStart(2, "0")}\n`;
  const blob = new Blob([csv], { type: "text/csv" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `work-hours-${start}_to_${end}.csv`;
  a.click();
  URL.revokeObjectURL(a.href);
});

updateExportFields();

render();
setInterval(() => { if (data.open) render(); }, 30000);
