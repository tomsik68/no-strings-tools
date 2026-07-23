const KEY = "invoice-generator";
let state = JSON.parse(localStorage.getItem(KEY) || "null") || {
  from: "", to: "", num: "001", date: new Date().toISOString().slice(0, 10), tax: 21,
  lines: [{ desc: "Services", qty: 1, price: 100 }],
};
const save = () => localStorage.setItem(KEY, JSON.stringify(state));
const esc = (t) => { const d = document.createElement("div"); d.textContent = t ?? ""; return d.innerHTML; };
const money = (n) => (Math.round(n * 100) / 100).toFixed(2);

function bindFields() {
  document.getElementById("from").value = state.from;
  document.getElementById("to").value = state.to;
  document.getElementById("num").value = state.num;
  document.getElementById("date").value = state.date;
  document.getElementById("tax").value = state.tax;
}

function renderLines() {
  document.getElementById("lines").innerHTML = state.lines.map((l, i) => `
    <div style="display:flex;gap:6px;margin-bottom:6px;flex-wrap:wrap;">
      <input class="w3-input w3-border w3-round desc" data-i="${i}" value="${esc(l.desc)}" placeholder="Description" style="flex:2;min-width:120px;" />
      <input type="number" class="w3-input w3-border w3-round qty" data-i="${i}" value="${l.qty}" min="0" step="0.01" style="width:70px;" title="Qty" />
      <input type="number" class="w3-input w3-border w3-round price" data-i="${i}" value="${l.price}" min="0" step="0.01" style="width:90px;" title="Price" />
      <button class="w3-button w3-small del" data-i="${i}" aria-label="Delete">×</button>
    </div>`).join("");
}

function renderPreview() {
  const sub = state.lines.reduce((s, l) => s + (parseFloat(l.qty) || 0) * (parseFloat(l.price) || 0), 0);
  const tax = sub * ((parseFloat(state.tax) || 0) / 100);
  const total = sub + tax;
  const rows = state.lines.map((l) => {
    const line = (parseFloat(l.qty) || 0) * (parseFloat(l.price) || 0);
    return `<tr><td>${esc(l.desc)}</td><td style="text-align:right">${l.qty}</td><td style="text-align:right">${money(l.price)}</td><td style="text-align:right">${money(line)}</td></tr>`;
  }).join("");
  document.getElementById("preview").innerHTML = `
    <div style="display:flex;justify-content:space-between;gap:16px;flex-wrap:wrap;">
      <div><div class="w3-text-grey w3-small">From</div><pre style="margin:0;font-family:inherit;white-space:pre-wrap;">${esc(state.from) || "—"}</pre></div>
      <div style="text-align:right;"><div style="font-size:22px;font-weight:700;">INVOICE</div>
        <div>#${esc(state.num)}</div><div>${esc(state.date)}</div></div>
    </div>
    <div class="w3-margin-top"><div class="w3-text-grey w3-small">Bill to</div><pre style="margin:0;font-family:inherit;white-space:pre-wrap;">${esc(state.to) || "—"}</pre></div>
    <table class="w3-table w3-bordered w3-margin-top" style="width:100%;">
      <thead><tr class="w3-light-grey"><th>Description</th><th style="text-align:right">Qty</th><th style="text-align:right">Price</th><th style="text-align:right">Amount</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
    <div style="text-align:right;margin-top:16px;">
      <div>Subtotal: <strong>${money(sub)}</strong></div>
      <div>Tax (${state.tax}%): <strong>${money(tax)}</strong></div>
      <div style="font-size:20px;margin-top:4px;">Total: <strong>${money(total)}</strong></div>
    </div>`;
}

function render() {
  renderLines();
  renderPreview();
}

["from", "to", "num", "date", "tax"].forEach((id) => {
  document.getElementById(id).addEventListener("input", (e) => {
    state[id] = id === "tax" ? parseFloat(e.target.value) || 0 : e.target.value;
    save();
    renderPreview();
  });
});

document.getElementById("lines").addEventListener("input", (e) => {
  const i = parseInt(e.target.dataset.i, 10);
  if (Number.isNaN(i)) return;
  if (e.target.classList.contains("desc")) state.lines[i].desc = e.target.value;
  if (e.target.classList.contains("qty")) state.lines[i].qty = parseFloat(e.target.value) || 0;
  if (e.target.classList.contains("price")) state.lines[i].price = parseFloat(e.target.value) || 0;
  save();
  renderPreview();
});

document.getElementById("lines").addEventListener("click", (e) => {
  const btn = e.target.closest(".del");
  if (!btn) return;
  state.lines.splice(parseInt(btn.dataset.i, 10), 1);
  if (!state.lines.length) state.lines.push({ desc: "", qty: 1, price: 0 });
  save();
  render();
});

document.getElementById("add-line").addEventListener("click", () => {
  state.lines.push({ desc: "", qty: 1, price: 0 });
  save();
  render();
});

document.getElementById("print-btn").addEventListener("click", () => window.print());

bindFields();
render();
