let bysquare = null;
import("https://esm.sh/bysquare@2.12.4")
  .then((m) => { bysquare = m; renderPreview(); })
  .catch(() => { bysquare = null; });

const KEY = "invoice-generator";
const META_KEY = "invoice-generator-meta";

const stateDefaults = {
  from: "", to: "", phone: "", email: "",
  ico: "", dic: "", icDph: "", clientIco: "", clientDic: "",
  num: "001", date: new Date().toISOString().slice(0, 10),
  delivery: "", due: "", tax: 21, currency: "€",
  iban: "", account: "", bankName: "", swift: "",
  paymentMethod: "Bankový prevod", issuedBy: "", note: "", signature: "",
  lines: [{ desc: "Services", qty: 1, unit: "", price: 100, discount: 0 }],
};
let state = JSON.parse(localStorage.getItem(KEY) || "null") || { ...stateDefaults };
Object.keys(stateDefaults).forEach((k) => { if (state[k] === undefined) state[k] = stateDefaults[k]; });
state.lines.forEach((l) => { l.discount ??= 0; l.unit ??= ""; });
const meta = JSON.parse(localStorage.getItem(META_KEY) || "null") || {
  myDetails: [], clients: [], templates: [], counter: 1,
};

const save = () => localStorage.setItem(KEY, JSON.stringify(state)),
  saveMeta = () => localStorage.setItem(META_KEY, JSON.stringify(meta));
const esc = (t) => { const d = document.createElement("div"); d.textContent = t ?? ""; return d.innerHTML; };
const money = (n) => (Math.round(n * 100) / 100).toFixed(2);
const padNum = (n) => String(n).padStart(3, "0");
const el = (id) => document.getElementById(id);

const fieldMap = {
  from: "from", to: "to", phone: "phone", email: "email",
  ico: "ico", dic: "dic", "ic-dph": "icDph",
  "client-ico": "clientIco", "client-dic": "clientDic",
  num: "num", date: "date", delivery: "delivery", due: "due",
  iban: "iban", account: "account", "bank-name": "bankName", swift: "swift",
  "payment-method": "paymentMethod", "issued-by": "issuedBy", note: "note",
};
const templateFields = ["from", "to", "phone", "email", "ico", "dic", "icDph", "clientIco", "clientDic",
  "tax", "currency", "iban", "account", "bankName", "swift", "paymentMethod", "issuedBy", "note"];
const currencyISO = { "€": "EUR", "$": "USD", "£": "GBP", "Kč": "CZK" };
function bindFields() {
  Object.entries(fieldMap).forEach(([id, key]) => { el(id).value = state[key]; });
  el("tax").value = state.tax;
  el("currency").value = state.currency;
  el("counter").value = meta.counter;
  const sig = el("sig-preview");
  sig.src = state.signature || "";
  sig.style.display = state.signature ? "block" : "none";
}

function renderSavedSelects() {
  const opt = (label, items, fn) => `<option value="">${label}</option>` + items.map((x, i) => `<option value="${i}">${esc(fn(x))}</option>`).join("");
  el("from-saved").innerHTML = opt("Saved details", meta.myDetails, (d) => d.split("\n")[0] || "Details");
  el("to-saved").innerHTML = opt("Saved clients", meta.clients, (c) => c.split("\n")[0] || "Client");
  el("template-saved").innerHTML = opt("Load a saved template", meta.templates, (t) => t.name);
  el("delete-template").style.display = meta.templates.length ? "inline-block" : "none";
}

function renderLines() {
  el("lines").innerHTML = state.lines.map((l, i) => `
    <div style="display:flex;gap:6px;margin-bottom:6px;flex-wrap:wrap;">
      <input class="w3-input w3-border w3-round desc" data-i="${i}" value="${esc(l.desc)}" placeholder="Description" style="flex:2;min-width:120px;" />
      <input type="number" class="w3-input w3-border w3-round qty" data-i="${i}" value="${l.qty}" min="0" step="0.01" style="width:55px;" title="Qty" />
      <input class="w3-input w3-border w3-round unit" data-i="${i}" value="${esc(l.unit)}" placeholder="Unit" style="width:60px;" title="Unit" />
      <input type="number" class="w3-input w3-border w3-round price" data-i="${i}" value="${l.price}" min="0" step="0.01" style="width:75px;" title="Price" />
      <input type="number" class="w3-input w3-border w3-round discount" data-i="${i}" value="${l.discount}" min="0" step="0.1" style="width:60px;" title="Discount %" placeholder="Disc." />
      <button class="w3-button w3-small del" data-i="${i}" aria-label="Delete">×</button>
    </div>`).join("");
}

function computeTotals() {
  const sub = state.lines.reduce((s, l) => s + (parseFloat(l.qty) || 0) * (parseFloat(l.price) || 0) * (1 - (parseFloat(l.discount) || 0) / 100), 0);
  const tax = sub * ((parseFloat(state.tax) || 0) / 100);
  return { sub, tax, total: sub + tax };
}

function generatePayQR() {
  if (!bysquare) return null;
  const { total } = computeTotals();
  const iban = (state.iban || "").replace(/\s/g, "");
  if (!iban || total <= 0 || !state.due) return null;
  const cur = currencyISO[state.currency] || "EUR";
  if (cur !== "EUR") return null; // Pay by Square is Slovak/EUR only
  const f = state.from.split("\n").map((l) => l.trim()).filter(Boolean);
  try {
    return bysquare.encode({
      invoiceId: state.num || undefined,
      payments: [{
        type: bysquare.PaymentOptions.PaymentOrder,
        amount: total,
        currencyCode: bysquare.CurrencyCode.EUR,
        paymentDueDate: state.due,
        variableSymbol: state.num ? state.num.replace(/\D/g, "").slice(0, 10) : undefined,
        paymentNote: state.note ? state.note.slice(0, 140) : undefined,
        bankAccounts: [{ iban }],
        beneficiary: { name: f[0] || "Invoice issuer", street: f[1] || "", city: f[2] || "" },
      }],
    });
  } catch (e) {
    console.error("Pay by Square encode failed", e);
    return null;
  }
}

function idBlock(prefix, vals) {
  const parts = vals.map(([label, v]) => v ? `${label}: ${esc(v)}` : "").filter(Boolean);
  return parts.length ? `<div class="w3-small" style="margin-top:4px;">${parts.join(" · ")}</div>` : "";
}

function renderPreview() {
  const { sub, tax, total } = computeTotals();
  const cur = esc(state.currency);
  const hasDisc = state.lines.some((l) => (parseFloat(l.discount) || 0) > 0);

  const rows = state.lines.map((l) => {
    const d = parseFloat(l.discount) || 0;
    const line = (parseFloat(l.qty) || 0) * (parseFloat(l.price) || 0) * (1 - d / 100);
    const discCell = hasDisc ? `<td style="text-align:right">${d > 0 ? d + "%" : "—"}</td>` : "";
    return `<tr><td>${esc(l.desc)}</td><td style="text-align:right">${l.qty}</td><td style="text-align:right">${esc(l.unit) || "—"}</td><td style="text-align:right">${money(l.price)} ${cur}</td>${discCell}<td style="text-align:right">${money(line)} ${cur}</td></tr>`;
  }).join("");

  const contact = (state.phone || state.email) ? `<div class="w3-small" style="margin-top:4px;">${[esc(state.phone), esc(state.email)].filter(Boolean).join(" · ")}</div>` : "";
  const sellerIds = idBlock("", [["IČO", state.ico], ["DIČ", state.dic], ["IČ DPH", state.icDph]]);
  const buyerIds = idBlock("", [["IČO", state.clientIco], ["DIČ", state.clientDic]]);
  const note = state.note ? `<div style="margin-top:16px;white-space:pre-wrap;">${esc(state.note)}</div>` : "";
  const bankParts = [[state.bankName, state.account], ["IBAN", state.iban], ["SWIFT", state.swift]].filter(([a, b]) => (a || b));
  const bank = bankParts.length || state.paymentMethod
    ? `<div class="w3-small" style="margin-top:16px;">${bankParts.map(([a, b]) => a && b ? `${esc(a)} ${esc(b)}` : esc(a || b)).join(" · ")}${state.paymentMethod ? ` · Payment: ${esc(state.paymentMethod)}` : ""}</div>`
    : "";
  const issued = state.issuedBy ? `<div style="margin-top:16px;" class="w3-small">Vystavil: ${esc(state.issuedBy)}</div>` : "";
  const sig = state.signature ? `<div style="margin-top:16px;"><img src="${esc(state.signature)}" style="max-height:80px;max-width:100%;"></div>` : "";
  const qrString = generatePayQR();
  const qr = qrString ? `<div style="margin-top:16px;display:flex;align-items:center;gap:12px;flex-wrap:wrap;"><canvas id="pay-qr" style="width:120px;height:120px;"></canvas><div class="w3-small">Scan to pay<br><strong>${money(total)} ${cur}</strong></div></div>` : "";
  const discHead = hasDisc ? '<th style="text-align:right">Discount</th>' : "";

  el("preview").innerHTML = `
    <div style="display:flex;justify-content:space-between;gap:16px;flex-wrap:wrap;">
      <div>
        <div class="w3-text-grey w3-small">From</div>
        <pre style="margin:0;font-family:inherit;white-space:pre-wrap;">${esc(state.from) || "—"}</pre>
        ${contact}${sellerIds}
      </div>
      <div style="text-align:right;">
        <div style="font-size:22px;font-weight:700;">INVOICE</div>
        <div>#${esc(state.num)}</div>
        <div>Issue: ${esc(state.date)}</div>
        ${state.delivery ? `<div>Delivery: ${esc(state.delivery)}</div>` : ""}
        ${state.due ? `<div>Due: ${esc(state.due)}</div>` : ""}
      </div>
    </div>
    <div class="w3-margin-top">
      <div class="w3-text-grey w3-small">Bill to</div>
      <pre style="margin:0;font-family:inherit;white-space:pre-wrap;">${esc(state.to) || "—"}</pre>
      ${buyerIds}
    </div>
    <table class="w3-table w3-bordered w3-margin-top" style="width:100%;">
      <thead><tr class="w3-light-grey"><th>Description</th><th style="text-align:right">Qty</th><th style="text-align:right">Unit</th><th style="text-align:right">Price</th>${discHead}<th style="text-align:right">Amount</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
    ${note}
    <div style="text-align:right;margin-top:16px;">
      <div>Subtotal: <strong>${money(sub)} ${cur}</strong></div>
      <div>Tax (${state.tax}%): <strong>${money(tax)} ${cur}</strong></div>
      <div style="font-size:20px;margin-top:4px;">Total: <strong>${money(total)} ${cur}</strong></div>
    </div>
    ${bank}${issued}${sig}${qr}`;

  if (qrString && typeof QRCode !== "undefined") {
    const c = el("pay-qr");
    if (c) QRCode.toCanvas(c, qrString, { width: 120, margin: 1, errorCorrectionLevel: "M" }, (err) => { if (err) console.error("QR render", err); });
  }
}

function render() {
  renderLines();
  renderSavedSelects();
  renderPreview();
}

Object.entries(fieldMap).forEach(([id, key]) => {
  el(id).addEventListener("input", (e) => {
    state[key] = e.target.value;
    save();
    renderPreview();
  });
});

el("tax").addEventListener("input", (e) => { state.tax = parseFloat(e.target.value) || 0; save(); renderPreview(); });
el("currency").addEventListener("change", (e) => { state.currency = e.target.value; save(); renderPreview(); });

el("lines").addEventListener("input", (e) => {
  const i = parseInt(e.target.dataset.i, 10);
  if (Number.isNaN(i)) return;
  if (e.target.classList.contains("desc")) state.lines[i].desc = e.target.value;
  if (e.target.classList.contains("unit")) state.lines[i].unit = e.target.value;
  if (e.target.classList.contains("qty")) state.lines[i].qty = parseFloat(e.target.value) || 0;
  if (e.target.classList.contains("price")) state.lines[i].price = parseFloat(e.target.value) || 0;
  if (e.target.classList.contains("discount")) state.lines[i].discount = parseFloat(e.target.value) || 0;
  save();
  renderPreview();
});

el("lines").addEventListener("click", (e) => {
  const btn = e.target.closest(".del");
  if (!btn) return;
  state.lines.splice(parseInt(btn.dataset.i, 10), 1);
  if (!state.lines.length) state.lines.push({ desc: "", qty: 1, unit: "", price: 0, discount: 0 });
  save();
  render();
});

el("add-line").addEventListener("click", () => { state.lines.push({ desc: "", qty: 1, unit: "", price: 0, discount: 0 }); save(); render(); });

function loadSaved(key, field) {
  const i = el(`${key}-saved`).value;
  if (i === "") return;
  state[field] = meta[key === "from" ? "myDetails" : "clients"][i];
  save();
  bindFields();
  renderPreview();
  el(`${key}-saved`).value = "";
}

el("from-saved").addEventListener("change", () => loadSaved("from", "from"));
el("to-saved").addEventListener("change", () => loadSaved("to", "to"));

function saveToList(key, field) {
  const text = el(field).value.trim();
  if (!text) return;
  const arr = meta[key];
  if (!arr.includes(text)) arr.push(text);
  saveMeta();
  renderSavedSelects();
}

el("save-from").addEventListener("click", () => saveToList("myDetails", "from"));
el("save-to").addEventListener("click", () => saveToList("clients", "to"));

el("save-template").addEventListener("click", () => {
  const name = prompt("Template name?");
  if (!name || !name.trim()) return;
  const snap = { name: name.trim(), lines: state.lines.map((l) => ({ ...l })) };
  templateFields.forEach((f) => snap[f] = state[f]);
  const idx = meta.templates.findIndex((t) => t.name === snap.name);
  idx >= 0 ? meta.templates[idx] = snap : meta.templates.push(snap);
  saveMeta();
  renderSavedSelects();
});

el("template-saved").addEventListener("change", (e) => {
  const i = e.target.value;
  if (i === "") return;
  const t = meta.templates[i];
  templateFields.forEach((f) => state[f] = f === "tax" ? (t[f] ?? 21) : (t[f] || (f === "currency" ? "€" : "")));
  state.lines = (t.lines || []).map((l) => ({ desc: l.desc || "", qty: l.qty || 0, unit: l.unit || "", price: l.price || 0, discount: l.discount || 0 }));
  save();
  bindFields();
  render();
  e.target.value = "";
});

el("delete-template").addEventListener("click", () => {
  const sel = el("template-saved");
  const i = sel.value;
  if (i === "") return;
  if (confirm(`Delete template "${meta.templates[i].name}"?`)) {
    meta.templates.splice(parseInt(i, 10), 1);
    saveMeta();
    renderSavedSelects();
    sel.value = "";
  }
});

el("counter").addEventListener("change", (e) => { meta.counter = Math.max(1, parseInt(e.target.value, 10) || 1); saveMeta(); bindFields(); });
el("counter-minus").addEventListener("click", () => { meta.counter = Math.max(1, meta.counter - 1); saveMeta(); bindFields(); });
el("counter-plus").addEventListener("click", () => { meta.counter += 1; saveMeta(); bindFields(); });
el("counter-use").addEventListener("click", () => { state.num = padNum(meta.counter++); save(); saveMeta(); bindFields(); renderPreview(); });

el("signature").addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const r = new FileReader();
  r.onload = () => { state.signature = r.result; save(); bindFields(); renderPreview(); };
  r.readAsDataURL(file);
});

el("clear-sig").addEventListener("click", () => { state.signature = ""; el("signature").value = ""; save(); bindFields(); renderPreview(); });

el("print-btn").addEventListener("click", () => {
  const current = parseInt(state.num, 10);
  if (!Number.isNaN(current) && current >= meta.counter) { meta.counter = current + 1; saveMeta(); bindFields(); }
  window.print();
});

bindFields();
render();