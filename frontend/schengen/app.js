const KEY = "schengen";
let trips = JSON.parse(localStorage.getItem(KEY) || "[]");

const save = () => localStorage.setItem(KEY, JSON.stringify(trips));
const esc = (t) => { const d = document.createElement("div"); d.textContent = t ?? ""; return d.innerHTML; };
const pad = (n) => String(n).padStart(2, "0");

const parse = (s) => new Date(s + "T00:00:00");
const fmtLocal = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const today = () => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; };
const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
const pretty = (d) => d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });

// Set of all days spent in Schengen, clipped at today (future days never count)
function buildSet() {
  const set = new Set();
  const t0 = today();
  for (const tr of trips) {
    if (!tr.entry) continue;
    let d = parse(tr.entry);
    if (isNaN(d)) continue;
    let end = tr.exit ? parse(tr.exit) : t0;
    if (end > t0) end = t0;
    while (d <= end) {
      set.add(fmtLocal(d));
      d = addDays(d, 1);
    }
  }
  return set;
}

// Days inside the 180-day window ending on `day` (inclusive)
function usedOn(day, set) {
  let n = 0;
  for (let i = 0; i < 180; i++) {
    if (set.has(fmtLocal(addDays(day, -i)))) n++;
  }
  return n;
}

// How many more days can be spent continuously, starting today (counting today)
function daysCanStay(set) {
  const t0 = today();
  let n = 0;
  while (n < 200) {
    const day = addDays(t0, n);
    // past trip days in window + assumed stay from today through `day`
    if (usedOn(day, set) + (n + 1) > 90) break;
    n++;
  }
  return n;
}

// First date from which a full 90-day stay is possible (window usage = 0)
function resetDate(set) {
  const t0 = today();
  for (let i = 0; i < 200; i++) {
    const d = addDays(t0, i);
    if (usedOn(d, set) === 0) return d;
  }
  return null;
}

function isInside() {
  const t0 = today();
  return trips.some((tr) => tr.entry && parse(tr.entry) <= t0 && (!tr.exit || parse(tr.exit) >= t0));
}

function render() {
  const set = buildSet();
  const used = usedOn(today(), set);
  const canStay = daysCanStay(set);
  const inside = isInside();
  const pct = Math.min(100, (used / 90) * 100);

  let headline, sub, barCls;
  if (inside && canStay === 0) {
    headline = "0 days left";
    sub = "You've hit the 90-day limit — time to leave.";
    barCls = "w3-red";
  } else if (inside) {
    headline = `${canStay} more day${canStay !== 1 ? "s" : ""}`;
    sub = `You can stay ${canStay} day${canStay !== 1 ? "s" : ""} counting today.`;
    barCls = canStay <= 10 ? "w3-orange" : "w3-green";
  } else {
    headline = `${used} / 90 days used`;
    const reset = resetDate(set);
    sub = canStay >= 90
      ? "Full 90 days available if you enter today."
      : `Enter today → up to ${canStay} day${canStay !== 1 ? "s" : ""}. Full 90 days from ${reset ? pretty(reset) : "—"}.`;
    barCls = used >= 80 ? "w3-orange" : "w3-blue";
  }

  document.getElementById("status").innerHTML = `
    <div class="w3-panel w3-white w3-round w3-border w3-center" style="padding: 20px;">
      <div style="font-size: 30px; font-weight: 700;">${headline}</div>
      <div class="w3-text-grey w3-small" style="margin-top: 4px;">${sub}</div>
      <div class="w3-light-grey w3-round" style="height: 8px; margin: 14px auto 0; max-width: 280px; overflow: hidden;">
        <div class="${barCls}" style="height: 100%; width: ${pct}%;"></div>
      </div>
      <div class="w3-text-grey w3-small" style="margin-top: 6px;">${used} of 90 days used in the current window</div>
    </div>`;

  const list = document.getElementById("trip-list");
  if (!trips.length) {
    list.innerHTML = '<p class="w3-text-grey w3-center">No trips logged yet.</p>';
    return;
  }
  const sorted = [...trips].sort((a, b) => b.entry.localeCompare(a.entry));
  list.innerHTML = sorted.map((tr) => {
    const days = tr.exit
      ? Math.round((parse(tr.exit) - parse(tr.entry)) / 86400000) + 1
      : Math.round((today() - parse(tr.entry)) / 86400000) + 1;
    const range = `${pretty(parse(tr.entry))} → ${tr.exit ? pretty(parse(tr.exit)) : "still inside"}`;
    return `<div class="w3-panel w3-white w3-round w3-border" style="padding: 10px 14px; margin: 0 0 8px; display: flex; align-items: center; gap: 10px;">
      <div style="flex: 1; min-width: 0;">
        <div style="font-weight: 600;">${esc(range)}</div>
        <div class="w3-text-grey w3-small">${days} day${days !== 1 ? "s" : ""}</div>
      </div>
      <button class="w3-button w3-small w3-text-grey del" data-id="${tr.id}" aria-label="Delete">×</button>
    </div>`;
  }).join("");
}

document.getElementById("trip-list").addEventListener("click", (e) => {
  const btn = e.target.closest(".del");
  if (!btn) return;
  trips = trips.filter((t) => t.id !== btn.dataset.id);
  save();
  render();
});

document.getElementById("entry").value = fmtLocal(today());

document.getElementById("add").addEventListener("click", () => {
  const entry = document.getElementById("entry").value;
  const exit = document.getElementById("exit").value;
  if (!entry) return;
  if (exit && exit < entry) return;
  trips.push({ id: crypto.randomUUID(), entry, exit });
  save();
  render();
  document.getElementById("exit").value = "";
  document.getElementById("entry").focus();
});

document.getElementById("entry").focus();
render();
