const KEY = "fridge-expiry";
let items = JSON.parse(localStorage.getItem(KEY) || "[]");
const save = () => localStorage.setItem(KEY, JSON.stringify(items));
const esc = (t) => { const d = document.createElement("div"); d.textContent = t ?? ""; return d.innerHTML; };
const today = () => new Date().toISOString().slice(0, 10);
const days = (a, b) => Math.round((new Date(b + "T00:00:00") - new Date(a + "T00:00:00")) / 86400000);

function badge(exp) {
  const d = days(today(), exp);
  if (d < 0) return { cls: "w3-red", text: `Expired ${-d}d` };
  if (d === 0) return { cls: "w3-orange", text: "Today" };
  if (d <= 3) return { cls: "w3-orange", text: `${d}d left` };
  return { cls: "w3-green", text: `${d}d left` };
}

function render() {
  const list = document.getElementById("list");
  if (!items.length) {
    list.innerHTML = '<p class="w3-text-grey w3-center">Nothing tracked yet.</p>';
    return;
  }
  const sorted = [...items].sort((a, b) => a.exp.localeCompare(b.exp));
  list.innerHTML = sorted.map((it) => {
    const b = badge(it.exp);
    return `<div class="w3-panel w3-white w3-round w3-border" style="padding:10px 14px;margin:0 0 8px;display:flex;align-items:center;gap:10px;">
      <div style="flex:1;min-width:0;">
        <div style="font-weight:600;">${esc(it.name)}</div>
        <div class="w3-text-grey w3-small">${esc(it.where)} · use by ${esc(it.exp)}</div>
      </div>
      <span class="w3-tag w3-round ${b.cls}">${b.text}</span>
      <button class="w3-button w3-small w3-green used" data-id="${it.id}" title="Used up">✓</button>
      <button class="w3-button w3-small w3-text-grey del" data-id="${it.id}" aria-label="Delete">×</button>
    </div>`;
  }).join("");
}

document.getElementById("list").addEventListener("click", (ev) => {
  const id = ev.target.closest("[data-id]")?.dataset.id;
  if (!id) return;
  if (ev.target.closest(".used") || ev.target.closest(".del")) {
    items = items.filter((x) => x.id !== id);
    save();
    render();
  }
});

document.getElementById("exp").value = today();

document.getElementById("add").addEventListener("click", () => {
  const name = document.getElementById("name").value.trim();
  const exp = document.getElementById("exp").value;
  const where = document.getElementById("where").value;
  if (!name || !exp) return;
  items.push({ id: crypto.randomUUID(), name, exp, where });
  save();
  render();
  document.getElementById("name").value = "";
  document.getElementById("name").focus();
});

document.getElementById("name").addEventListener("keydown", (e) => {
  if (e.key === "Enter") document.getElementById("add").click();
});
document.getElementById("name").focus();
render();
