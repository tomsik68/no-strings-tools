let bills = JSON.parse(localStorage.getItem("trip-bills")) || [];

function save() {
  localStorage.setItem("trip-bills", JSON.stringify(bills));
}

function genId() {
  return Math.random().toString(36).slice(2, 10);
}

function esc(text) {
  const d = document.createElement("div");
  d.textContent = String(text ?? "");
  return d.innerHTML;
}

function billTotal(bill) {
  return bill.items.reduce((s, item) => s + (parseFloat(item.price) || 0), 0);
}

// Collect all known person names for the autocomplete datalist
function updatePeopleList() {
  const people = new Set();
  for (const bill of bills) {
    if (bill.payer) people.add(bill.payer);
    for (const item of bill.items) {
      if (item.buyer) people.add(item.buyer);
    }
  }
  document.getElementById("people-list").innerHTML =
    [...people].sort().map(p => `<option value="${esc(p)}">`).join("");
}

// Greedy minimum-transactions settlement across all bills
function computeSettlement() {
  const bal = {};
  for (const bill of bills) {
    if (!bill.payer) continue;
    for (const item of bill.items) {
      const amt = parseFloat(item.price) || 0;
      if (!amt || !item.buyer || item.buyer === bill.payer) continue;
      bal[bill.payer] = (bal[bill.payer] || 0) + amt;
      bal[item.buyer] = (bal[item.buyer] || 0) - amt;
    }
  }

  const creditors = [], debtors = [];
  for (const [name, b] of Object.entries(bal)) {
    if (b > 0.005) creditors.push({ name, amount: b });
    else if (b < -0.005) debtors.push({ name, amount: -b });
  }
  creditors.sort((a, b) => b.amount - a.amount);
  debtors.sort((a, b) => b.amount - a.amount);

  const txns = [];
  let i = 0, j = 0;
  while (i < creditors.length && j < debtors.length) {
    const amt = Math.min(creditors[i].amount, debtors[j].amount);
    txns.push({ from: debtors[j].name, to: creditors[i].name, amount: amt });
    creditors[i].amount -= amt;
    debtors[j].amount -= amt;
    if (creditors[i].amount < 0.005) i++;
    if (debtors[j].amount < 0.005) j++;
  }
  return txns;
}

function renderSettlement() {
  const el = document.getElementById("settlement-content");
  const hasItems = bills.some(b => b.items.length > 0);
  if (!hasItems) { el.innerHTML = "No bills yet."; return; }

  const grandTotal = bills.reduce((s, b) => s + billTotal(b), 0);
  const txns = computeSettlement();

  const rows = txns.map(t =>
    `<div class="s-row">
      <span>${esc(t.from)} → <strong>${esc(t.to)}</strong></span>
      <strong>$${t.amount.toFixed(2)}</strong>
    </div>`
  ).join("");

  const allGood = txns.length === 0 ? `<div class="all-good">✓ All settled up</div>` : "";
  el.innerHTML = `${rows}${allGood}<div class="grand-total">Grand total: $${grandTotal.toFixed(2)}</div>`;
}

function renderBillCard(bill) {
  const rows = bill.items.map((item, idx) => `
    <tr>
      <td><input type="text" value="${esc(item.description)}" placeholder="Item..."
        data-bill="${bill.id}" data-item="${idx}" data-field="description" /></td>
      <td style="width:100px"><input type="number" step="0.01" min="0" value="${item.price !== "" ? item.price : ""}" placeholder="0.00"
        data-bill="${bill.id}" data-item="${idx}" data-field="price" /></td>
      <td><input type="text" value="${esc(item.buyer)}" placeholder="Name..." list="people-list"
        data-bill="${bill.id}" data-item="${idx}" data-field="buyer" /></td>
      <td style="width:32px"><button class="del item-del" data-bill="${bill.id}" data-item="${idx}" title="Remove">×</button></td>
    </tr>`).join("");

  return `<div class="bill-card" data-bill-id="${bill.id}">
    <div class="bill-header">
      <input type="text" value="${esc(bill.label)}" placeholder="Bill name (e.g. Dinner)..."
        data-bill="${bill.id}" data-field="label" style="flex:1; font-size:15px;" />
      <button class="del bill-del" data-bill="${bill.id}">Delete bill</button>
    </div>
    <div class="bill-payer-row">
      <label>Paid by</label>
      <input type="text" value="${esc(bill.payer)}" placeholder="Name..." list="people-list"
        data-bill="${bill.id}" data-field="payer" />
    </div>
    <table>
      <thead><tr><th>Description</th><th>Price</th><th>Ordered by</th><th></th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
    <div class="bill-footer">
      <button class="w3-button w3-blue w3-round w3-small add-item-btn" data-bill="${bill.id}">+ Add Item</button>
      <span class="subtotal" data-subtotal="${bill.id}">Subtotal: $${billTotal(bill).toFixed(2)}</span>
    </div>
  </div>`;
}

function render() {
  const c = document.getElementById("bills-container");
  c.innerHTML = bills.length === 0
    ? `<p class="w3-text-grey">No bills — click "+ Add Bill" to start.</p>`
    : bills.map(renderBillCard).join("");
  renderSettlement();
  updatePeopleList();
}

// Clicks inside the bills container
document.getElementById("bills-container").addEventListener("click", (e) => {
  if (e.target.classList.contains("bill-del")) {
    const id = e.target.dataset.bill;
    bills = bills.filter(b => b.id !== id);
    save(); render();

  } else if (e.target.classList.contains("item-del")) {
    const id = e.target.dataset.bill;
    const idx = parseInt(e.target.dataset.item);
    const bill = bills.find(b => b.id === id);
    if (bill) { bill.items.splice(idx, 1); save(); render(); }

  } else if (e.target.classList.contains("add-item-btn")) {
    const id = e.target.dataset.bill;
    const bill = bills.find(b => b.id === id);
    if (!bill) return;
    bill.items.push({ description: "", price: "", buyer: "" });
    save(); render();
    setTimeout(() => {
      const card = document.querySelector(`[data-bill-id="${id}"]`);
      if (!card) return;
      const inputs = card.querySelectorAll(`input[data-field="description"]`);
      if (inputs.length) inputs[inputs.length - 1].focus();
    }, 0);
  }
});

// Input changes (no full re-render — only update settlement + subtotal)
document.getElementById("bills-container").addEventListener("input", (e) => {
  const billId = e.target.dataset.bill;
  const field = e.target.dataset.field;
  if (!billId || !field) return;

  const bill = bills.find(b => b.id === billId);
  if (!bill) return;

  const itemIdx = e.target.dataset.item;
  if (itemIdx !== undefined) {
    bill.items[parseInt(itemIdx)][field] = e.target.value;
  } else {
    bill[field] = e.target.value;
  }

  save();
  updatePeopleList();
  const subtotalEl = document.querySelector(`[data-subtotal="${billId}"]`);
  if (subtotalEl) subtotalEl.textContent = `Subtotal: $${billTotal(bill).toFixed(2)}`;
  renderSettlement();
});

// Add bill
document.getElementById("add-bill-btn").addEventListener("click", () => {
  const bill = { id: genId(), label: "", payer: "", items: [] };
  bills.push(bill);
  save(); render();
  setTimeout(() => {
    const card = document.querySelector(`[data-bill-id="${bill.id}"]`);
    if (card) card.querySelector(`input[data-field="label"]`).focus();
  }, 0);
});

// Clear all
document.getElementById("clear-btn").addEventListener("click", () => {
  if (!confirm("Clear all bills and start fresh?")) return;
  bills = [];
  save(); render();
});

// Boot: start with one empty bill containing one empty item
if (bills.length === 0) {
  bills.push({ id: genId(), label: "", payer: "", items: [{ description: "", price: "", buyer: "" }] });
  save();
}
render();
setTimeout(() => document.querySelector(`input[data-field="label"]`)?.focus(), 0);
