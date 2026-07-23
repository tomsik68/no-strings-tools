const KEY = "wishlist";
let items = JSON.parse(localStorage.getItem(KEY) || "[]");

const save = () => localStorage.setItem(KEY, JSON.stringify(items));
const esc = (t) => { const d = document.createElement("div"); d.textContent = t; return d.innerHTML; };

function render() {
  const open = items.filter((i) => !i.done);
  const total = open.reduce((s, i) => s + (i.price || 0), 0);
  const summary = document.getElementById("summary");
  if (items.length) {
    summary.innerHTML = `<div class="w3-panel w3-white w3-round w3-border" style="padding: 12px 16px; margin: 0;">
      <strong>${open.length}</strong> open${total ? ` · <strong>${total.toFixed(2)}</strong> total` : ""}
    </div>`;
  } else {
    summary.innerHTML = "";
  }

  const list = document.getElementById("item-list");
  if (!items.length) {
    list.innerHTML = '<p class="w3-text-grey w3-center">Nothing on the list yet.</p>';
    return;
  }

  const sorted = [...items].sort((a, b) => Number(a.done) - Number(b.done));
  list.innerHTML = sorted.map((it) => `
    <div class="w3-panel w3-white w3-round w3-border" style="padding: 10px 14px; margin: 0 0 8px; display: flex; align-items: center; gap: 10px;">
      <input type="checkbox" class="done-cb" data-id="${it.id}" ${it.done ? "checked" : ""} style="width: 18px; height: 18px; cursor: pointer;" aria-label="Got it" />
      <div style="flex: 1; min-width: 0;">
        <div style="font-weight: 600; ${it.done ? "text-decoration: line-through; color: #999;" : ""}">${esc(it.name)}</div>
        <div class="w3-text-grey w3-small">
          ${it.price != null ? esc(it.price.toFixed(2)) : ""}
          ${it.price != null && it.url ? " · " : ""}
          ${it.url ? `<a href="${esc(it.url)}" target="_blank" rel="noopener" class="w3-text-blue">link</a>` : ""}
        </div>
      </div>
      <button class="w3-button w3-small w3-text-grey del-btn" data-id="${it.id}" aria-label="Delete" style="padding: 0 6px;">×</button>
    </div>`).join("");
}

document.getElementById("item-list").addEventListener("change", (ev) => {
  if (!ev.target.classList.contains("done-cb")) return;
  const it = items.find((x) => x.id === ev.target.dataset.id);
  if (it) { it.done = ev.target.checked; save(); render(); }
});

document.getElementById("item-list").addEventListener("click", (ev) => {
  const btn = ev.target.closest(".del-btn");
  if (!btn) return;
  items = items.filter((x) => x.id !== btn.dataset.id);
  save();
  render();
});

function addItem() {
  const name = document.getElementById("item-name").value.trim();
  if (!name) return;
  const priceRaw = document.getElementById("item-price").value;
  const price = priceRaw === "" ? null : parseFloat(priceRaw);
  const url = document.getElementById("item-url").value.trim();
  items.push({ id: crypto.randomUUID(), name, price: Number.isFinite(price) ? price : null, url, done: false });
  save();
  render();
  document.getElementById("item-name").value = "";
  document.getElementById("item-price").value = "";
  document.getElementById("item-url").value = "";
  document.getElementById("item-name").focus();
}

document.getElementById("add-btn").addEventListener("click", addItem);
document.getElementById("item-name").addEventListener("keydown", (e) => {
  if (e.key === "Enter") addItem();
});

document.getElementById("item-name").focus();
render();
