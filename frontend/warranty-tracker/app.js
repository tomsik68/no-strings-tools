const KEY = "warranty-tracker";
let items = JSON.parse(localStorage.getItem(KEY) || "[]");

const save = () => localStorage.setItem(KEY, JSON.stringify(items));
const esc = (t) => { const d = document.createElement("div"); d.textContent = t; return d.innerHTML; };
const todayStr = () => new Date().toISOString().slice(0, 10);

function expiryDate(bought, months) {
  const d = new Date(bought + "T00:00:00");
  d.setMonth(d.getMonth() + months);
  return d.toISOString().slice(0, 10);
}

function daysBetween(a, b) {
  return Math.round((new Date(b + "T00:00:00") - new Date(a + "T00:00:00")) / 86400000);
}

function classify(exp) {
  const days = daysBetween(todayStr(), exp);
  if (days < 0) return { cls: "w3-red", label: `Expired ${Math.abs(days)}d ago` };
  if (days <= 30) return { cls: "w3-orange", label: `${days}d left` };
  if (days <= 90) return { cls: "w3-amber", label: `${days}d left` };
  return { cls: "w3-green", label: `${days}d left` };
}

function fmtDate(s) {
  return new Date(s + "T00:00:00").toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function render() {
  const list = document.getElementById("item-list");
  if (!items.length) {
    list.innerHTML = '<p class="w3-text-grey w3-center">No warranties yet. Add one below.</p>';
    return;
  }
  const sorted = [...items].map((it) => ({ ...it, exp: expiryDate(it.bought, it.months) }))
    .sort((a, b) => a.exp.localeCompare(b.exp));

  list.innerHTML = sorted.map((it) => {
    const { cls, label } = classify(it.exp);
    return `<div class="w3-panel w3-white w3-round w3-border" style="padding: 12px 14px; margin: 0 0 8px;">
      <div style="display: flex; align-items: flex-start; gap: 10px;">
        <div style="flex: 1; min-width: 0;">
          <div style="font-weight: 600;">${esc(it.name)}</div>
          <div class="w3-text-grey w3-small">Bought ${esc(fmtDate(it.bought))} · ${it.months} mo · expires ${esc(fmtDate(it.exp))}</div>
          ${it.note ? `<div class="w3-text-grey w3-small">${esc(it.note)}</div>` : ""}
        </div>
        <span class="w3-tag w3-round ${cls}" style="white-space: nowrap;">${label}</span>
        <button class="w3-button w3-small w3-text-grey" data-id="${it.id}" aria-label="Delete" style="padding: 0 6px;">×</button>
      </div>
    </div>`;
  }).join("");
}

document.getElementById("item-list").addEventListener("click", (ev) => {
  const btn = ev.target.closest("[data-id]");
  if (!btn) return;
  items = items.filter((x) => x.id !== btn.dataset.id);
  save();
  render();
});

document.getElementById("item-bought").value = todayStr();

document.getElementById("add-btn").addEventListener("click", () => {
  const name = document.getElementById("item-name").value.trim();
  const bought = document.getElementById("item-bought").value;
  const months = parseInt(document.getElementById("item-months").value, 10);
  const note = document.getElementById("item-note").value.trim();
  if (!name || !bought || !months || months < 1) return;
  items.push({ id: crypto.randomUUID(), name, bought, months, note });
  save();
  render();
  document.getElementById("item-name").value = "";
  document.getElementById("item-note").value = "";
  document.getElementById("item-name").focus();
});

document.getElementById("item-name").addEventListener("keydown", (e) => {
  if (e.key === "Enter") document.getElementById("add-btn").click();
});

document.getElementById("item-name").focus();
render();
