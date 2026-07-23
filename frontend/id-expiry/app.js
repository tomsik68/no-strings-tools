const KEY = "id-expiry";
let items = JSON.parse(localStorage.getItem(KEY) || "[]");
const save = () => localStorage.setItem(KEY, JSON.stringify(items));
const esc = (t) => { const d = document.createElement("div"); d.textContent = t ?? ""; return d.innerHTML; };
const today = () => new Date().toISOString().slice(0, 10);
const days = (a, b) => Math.round((new Date(b + "T00:00:00") - new Date(a + "T00:00:00")) / 86400000);
const fmt = (s) => new Date(s + "T00:00:00").toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });

function badge(exp) {
  const d = days(today(), exp);
  if (d < 0) return { cls: "w3-red", text: `Expired ${-d}d ago` };
  if (d <= 30) return { cls: "w3-red", text: `${d}d left` };
  if (d <= 90) return { cls: "w3-orange", text: `${d}d left` };
  if (d <= 180) return { cls: "w3-amber", text: `${d}d left` };
  return { cls: "w3-green", text: `${d}d left` };
}

function render() {
  const list = document.getElementById("list");
  if (!items.length) {
    list.innerHTML = '<p class="w3-text-grey w3-center">No documents yet.</p>';
    return;
  }
  const sorted = [...items].sort((a, b) => a.exp.localeCompare(b.exp));
  list.innerHTML = sorted.map((it) => {
    const b = badge(it.exp);
    return `<div class="w3-panel w3-white w3-round w3-border" style="padding:12px 14px;margin:0 0 8px;display:flex;gap:10px;align-items:flex-start;">
      <div style="flex:1;min-width:0;">
        <div style="font-weight:600;">${esc(it.name)}</div>
        <div class="w3-text-grey w3-small">Expires ${esc(fmt(it.exp))}${it.note ? " · " + esc(it.note) : ""}</div>
      </div>
      <span class="w3-tag w3-round ${b.cls}">${b.text}</span>
      <button class="w3-button w3-small w3-text-grey del" data-id="${it.id}" aria-label="Delete">×</button>
    </div>`;
  }).join("");
}

document.getElementById("list").addEventListener("click", (e) => {
  const btn = e.target.closest(".del");
  if (!btn) return;
  items = items.filter((x) => x.id !== btn.dataset.id);
  save();
  render();
});

document.getElementById("add").addEventListener("click", () => {
  const name = document.getElementById("name").value.trim();
  const exp = document.getElementById("exp").value;
  const note = document.getElementById("note").value.trim();
  if (!name || !exp) return;
  items.push({ id: crypto.randomUUID(), name, exp, note });
  save();
  render();
  document.getElementById("name").value = "";
  document.getElementById("note").value = "";
  document.getElementById("name").focus();
});

document.getElementById("name").addEventListener("keydown", (e) => {
  if (e.key === "Enter") document.getElementById("add").click();
});
document.getElementById("name").focus();
render();
