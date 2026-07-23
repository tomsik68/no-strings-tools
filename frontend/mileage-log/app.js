const KEY = "mileage-log";
let trips = JSON.parse(localStorage.getItem(KEY) || "[]");
const save = () => localStorage.setItem(KEY, JSON.stringify(trips));
const esc = (t) => { const d = document.createElement("div"); d.textContent = t ?? ""; return d.innerHTML; };

function monthKey(d) { return d.slice(0, 7); }
function thisMonth() { return new Date().toISOString().slice(0, 7); }

function render() {
  const m = thisMonth();
  const monthKm = trips.filter((t) => monthKey(t.date) === m).reduce((s, t) => s + t.km, 0);
  document.getElementById("summary").innerHTML = trips.length
    ? `<div class="w3-panel w3-white w3-round w3-border" style="padding:12px 16px;margin:0 0 12px;">
        <strong style="font-size:24px;">${monthKm.toFixed(1)} km</strong>
        <span class="w3-text-grey w3-small"> this month</span></div>`
    : "";

  const list = document.getElementById("list");
  if (!trips.length) {
    list.innerHTML = '<p class="w3-text-grey w3-center">No trips yet.</p>';
    return;
  }
  const sorted = [...trips].sort((a, b) => b.date.localeCompare(a.date));
  list.innerHTML = sorted.slice(0, 50).map((t) => `
    <div class="w3-panel w3-white w3-round w3-border" style="padding:10px 14px;margin:0 0 8px;display:flex;gap:10px;align-items:center;">
      <div style="flex:1;min-width:0;">
        <div style="font-weight:600;">${esc(t.from)} → ${esc(t.to)}</div>
        <div class="w3-text-grey w3-small">${esc(t.date)}${t.purpose ? " · " + esc(t.purpose) : ""}</div>
      </div>
      <strong>${t.km.toFixed(1)} km</strong>
      <button class="w3-button w3-small w3-text-grey del" data-id="${t.id}" aria-label="Delete">×</button>
    </div>`).join("");
}

document.getElementById("list").addEventListener("click", (e) => {
  const btn = e.target.closest(".del");
  if (!btn) return;
  trips = trips.filter((t) => t.id !== btn.dataset.id);
  save();
  render();
});

document.getElementById("date").value = new Date().toISOString().slice(0, 10);

document.getElementById("add").addEventListener("click", () => {
  const date = document.getElementById("date").value;
  const from = document.getElementById("from").value.trim();
  const to = document.getElementById("to").value.trim();
  const km = parseFloat(document.getElementById("km").value);
  const purpose = document.getElementById("purpose").value.trim();
  if (!date || !from || !to || !(km > 0)) return;
  trips.push({ id: crypto.randomUUID(), date, from, to, km, purpose });
  save();
  render();
  document.getElementById("from").value = "";
  document.getElementById("to").value = "";
  document.getElementById("km").value = "";
  document.getElementById("purpose").value = "";
  document.getElementById("from").focus();
});

document.getElementById("from").focus();
render();
