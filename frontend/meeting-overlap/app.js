const KEY = "meeting-overlap";
const ZONES = Intl.supportedValuesOf
  ? Intl.supportedValuesOf("timeZone")
  : ["UTC", "Europe/Prague", "America/New_York", "America/Los_Angeles", "Asia/Tokyo", "Europe/London", "Australia/Sydney"];

let people = JSON.parse(localStorage.getItem(KEY) || "null") || [
  { id: crypto.randomUUID(), name: "You", tz: Intl.DateTimeFormat().resolvedOptions().timeZone, start: 9, end: 18 },
  { id: crypto.randomUUID(), name: "Them", tz: "America/New_York", start: 9, end: 18 },
];

const save = () => localStorage.setItem(KEY, JSON.stringify(people));
const esc = (t) => { const d = document.createElement("div"); d.textContent = t ?? ""; return d.innerHTML; };

function hourInTz(date, tz) {
  const parts = new Intl.DateTimeFormat("en-GB", { timeZone: tz, hour: "numeric", hourCycle: "h23" }).formatToParts(date);
  return parseInt(parts.find((p) => p.type === "hour").value, 10);
}

function isAwake(hour, start, end) {
  if (start === end) return true;
  if (start < end) return hour >= start && hour < end;
  return hour >= start || hour < end;
}

function renderPeople() {
  const el = document.getElementById("people");
  el.innerHTML = people.map((p) => `
    <div class="w3-panel w3-white w3-round w3-border" style="padding: 12px; margin: 0 0 8px;" data-id="${p.id}">
      <div style="display: flex; gap: 8px; flex-wrap: wrap; align-items: end;">
        <div style="flex: 1; min-width: 100px;">
          <label class="w3-small w3-text-grey">Name</label>
          <input class="w3-input w3-border w3-round name-in" value="${esc(p.name)}" data-id="${p.id}" />
        </div>
        <div style="flex: 2; min-width: 160px;">
          <label class="w3-small w3-text-grey">Timezone</label>
          <select class="w3-select w3-border w3-round tz-in" data-id="${p.id}">
            ${ZONES.map((z) => `<option value="${z}" ${z === p.tz ? "selected" : ""}>${z}</option>`).join("")}
          </select>
        </div>
        <div>
          <label class="w3-small w3-text-grey">Awake</label>
          <div style="display: flex; gap: 4px; align-items: center;">
            <input type="number" min="0" max="23" class="w3-input w3-border w3-round start-in" value="${p.start}" data-id="${p.id}" style="width: 56px;" />
            <span>–</span>
            <input type="number" min="0" max="23" class="w3-input w3-border w3-round end-in" value="${p.end}" data-id="${p.id}" style="width: 56px;" />
          </div>
        </div>
        ${people.length > 2 ? `<button class="w3-button w3-small del" data-id="${p.id}" aria-label="Remove">×</button>` : ""}
      </div>
    </div>`).join("");
}

function renderGrid() {
  const now = new Date();
  now.setMinutes(0, 0, 0);
  const cells = [];
  const good = [];

  for (let i = 0; i < 24; i++) {
    const t = new Date(now.getTime() + i * 3600000);
    const all = people.every((p) => isAwake(hourInTz(t, p.tz), p.start, p.end));
    const some = people.some((p) => isAwake(hourInTz(t, p.tz), p.start, p.end));
    const label = t.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
    const bg = all ? "#c8e6c9" : some ? "#fff9c4" : "#eeeeee";
    cells.push(`<div style="background:${bg}; padding: 8px 4px; text-align: center; border-radius: 4px; font-size: 11px;" title="${label}">${label}</div>`);
    if (all) good.push(t);
  }
  document.getElementById("grid").innerHTML = cells.join("");

  // Collapse consecutive hours into ranges
  const ranges = [];
  for (const t of good) {
    const last = ranges[ranges.length - 1];
    if (last && t - last.end === 3600000) last.end = t;
    else ranges.push({ start: t, end: t });
  }
  const win = document.getElementById("windows");
  if (!ranges.length) {
    win.innerHTML = '<p class="w3-text-grey">No full overlap in the next 24 hours. Widen awake hours or try fewer people.</p>';
    return;
  }
  win.innerHTML = '<div class="w3-text-grey w3-small" style="margin-bottom:6px;">Best windows</div>' +
    ranges.map((r) => {
      const a = r.start.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
      const b = new Date(r.end.getTime() + 3600000).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
      const day = r.start.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
      return `<div class="w3-panel w3-pale-green w3-round" style="padding: 8px 12px; margin: 0 0 6px;"><strong>${a} – ${b}</strong> <span class="w3-text-grey w3-small">${day}</span></div>`;
    }).join("");
}

function render() {
  renderPeople();
  renderGrid();
}

document.getElementById("people").addEventListener("input", (ev) => {
  const id = ev.target.dataset.id;
  const p = people.find((x) => x.id === id);
  if (!p) return;
  if (ev.target.classList.contains("name-in")) p.name = ev.target.value;
  if (ev.target.classList.contains("start-in")) p.start = Math.min(23, Math.max(0, parseInt(ev.target.value, 10) || 0));
  if (ev.target.classList.contains("end-in")) p.end = Math.min(23, Math.max(0, parseInt(ev.target.value, 10) || 0));
  save();
  renderGrid();
});

document.getElementById("people").addEventListener("change", (ev) => {
  const id = ev.target.dataset.id;
  const p = people.find((x) => x.id === id);
  if (!p) return;
  if (ev.target.classList.contains("tz-in")) p.tz = ev.target.value;
  save();
  renderGrid();
});

document.getElementById("people").addEventListener("click", (ev) => {
  const btn = ev.target.closest(".del");
  if (!btn) return;
  people = people.filter((p) => p.id !== btn.dataset.id);
  save();
  render();
});

document.getElementById("add-btn").addEventListener("click", () => {
  if (people.length >= 6) return;
  people.push({ id: crypto.randomUUID(), name: "Person " + (people.length + 1), tz: "UTC", start: 9, end: 18 });
  save();
  render();
});

render();
