// Invoice Generator - Phase 1: Data Model Alignment with invoice-xml
// Implements structured data model matching invoice.xsd

let bysquare = null;
import("https://esm.sh/bysquare@2.12.4")
  .then((m) => { bysquare = m; renderPreview(); })
  .catch(() => { bysquare = null; });

const KEY = "invoice-generator-v2";
const META_KEY = "invoice-generator-meta";

// i18n: Core strings for Phase 4 (placeholder structure)
const TRANSLATIONS = {
  en_US: {
    formLabels: {
      invoiceNumber: "Invoice #",
      issueDate: "Issue date",
      deliveryDate: "Delivery date",
      dueDate: "Due date",
      currency: "Currency",
      supplierName: "Supplier name",
      supplierAddress: "Address line",
      supplierEmail: "Email",
      supplierPhone: "Phone",
      customerName: "Customer name",
      customerAddress: "Address line",
      identifierType: "Type (IČO, DIČ, etc.)",
      identifierValue: "Value",
      itemSummary: "Description",
      itemDescription: "Detailed description",
      itemSku: "SKU",
      itemQuantity: "Quantity",
      itemUnit: "Unit",
      itemUnitPrice: "Unit price",
      itemDiscountPercent: "Discount %",
      itemVatRate: "VAT %",
      note: "Note",
      paymentMethod: "Payment method",
      bankName: "Bank name",
      iban: "IBAN",
      swift: "SWIFT",
      variableSymbol: "Variable symbol",
      contactName: "Contact name",
      contactEmail: "Contact email",
      contactPhone: "Contact phone",
    },
    printLabels: {
      invoiceTitle: "INVOICE",
      supplier: "Supplier",
      customer: "Customer",
      issueDate: "Issue date",
      deliveryDate: "Delivery date",
      dueDate: "Due date",
      description: "Description",
      quantity: "Qty",
      unit: "Unit",
      unitPrice: "Unit price",
      total: "Total",
      vatRate: "VAT",
      subtotal: "Subtotal",
      tax: "Tax",
      paymentInfo: "Payment Information",
      scanToPay: "Scan to pay",
    }
  },
  sk_SK: {
    formLabels: {
      invoiceNumber: "Číslo faktúry",
      issueDate: "Dátum vystavenia",
      deliveryDate: "Dátum dodania",
      dueDate: "Dátum splatnosti",
      currency: "Mena",
      supplierName: "Meno dodávateľa",
      supplierAddress: "Adresa",
      supplierEmail: "Email",
      supplierPhone: "Telefón",
      customerName: "Meno odberateľa",
      customerAddress: "Adresa",
      identifierType: "Typ (IČO, DIČ, atď.)",
      identifierValue: "Hodnota",
      itemSummary: "Popis",
      itemDescription: "Detailný popis",
      itemSku: "SKU",
      itemQuantity: "Počet",
      itemUnit: "Jednotka",
      itemUnitPrice: "Jednotková cena",
      itemDiscountPercent: "Zľava %",
      itemVatRate: "DPH %",
      note: "Poznámka",
      paymentMethod: "Spôsob platby",
      bankName: "Banka",
      iban: "IBAN",
      swift: "SWIFT",
      variableSymbol: "Variabilný symbol",
      contactName: "Meno kontaktnej osoby",
      contactEmail: "Email",
      contactPhone: "Telefón",
    },
    printLabels: {
      invoiceTitle: "Faktúra",
      supplier: "Dodávateľ",
      customer: "Odberateľ",
      issueDate: "Dátum vystavenia",
      deliveryDate: "Dátum dodania",
      dueDate: "Dátum splatnosti",
      description: "Popis",
      quantity: "Počet",
      unit: "Jednotka",
      unitPrice: "Jednotková cena",
      total: "Celkom",
      vatRate: "DPH",
      subtotal: "Medzisum",
      tax: "DPH",
      paymentInfo: "Bankové údaje",
      scanToPay: "Zaplatiť na QR",
    }
  }
};

// Translation helper
function t(key, section = 'formLabels') {
  const lang = state.language || 'sk_SK';
  return TRANSLATIONS[lang]?.[section]?.[key] || key;
}

// New structured state model matching invoice.xsd
const stateDefaults = {
  // Invoice metadata
  number: "001",
  language: "sk_SK",
  issuedAt: new Date().toISOString().slice(0, 10),
  deliveredAt: "",
  dueAt: "",

  // Supplier (matches invoice.xsd <supplier>)
  supplier: {
    name: "",
    contactPerson: "",
    identifiers: [], // [{ type: "IČO", value: "123" }, ...]
    address: [], // ["Line 1", "Line 2", ...]
    email: "",
    phone: "",
    web: ""
  },

  // Customer (matches invoice.xsd <customer>)
  customer: {
    name: "",
    identifiers: [],
    address: []
  },

  // Currency
  currency: { code: "EUR", symbol: "€" },

  // Items (matches invoice.xsd <items>)
  items: [
    {
      summary: "Services",
      description: "",
      sku: "",
      quantity: 1,
      unit: "",
      unitPrice: 100,
      discountPercent: 0,
      discountAmount: 0,
      vatRate: 0,
      price: 100
    }
  ],

  // Payment info (matches invoice.xsd <payment-info>)
  paymentInfo: {
    method: "Bankový prevod",
    bankName: "",
    accountNumber: "",
    iban: "",
    swift: "",
    variableSymbol: "",
    constantSymbol: "",
    specificSymbol: "",
    paymentNote: ""
  },

  // Contact (matches invoice.xsd <contact>)
  contact: {
    name: "",
    email: "",
    phone: ""
  },

  // Additional fields
  note: "",
  orderNumber: "",
  contractNumber: "",
  signature: "",

  // VAT flag
  itemsHaveVAT: false
};

// Load state with migration from old format
let state = loadAndMigrateState();

const meta = JSON.parse(localStorage.getItem(META_KEY) || "null") || {
  myDetails: [], clients: [], templates: [], counter: 1,
};

const save = () => localStorage.setItem(KEY, JSON.stringify(state));
const saveMeta = () => localStorage.setItem(META_KEY, JSON.stringify(meta));
const esc = (t) => { const d = document.createElement("div"); d.textContent = t ?? ""; return d.innerHTML; };
const money = (n) => (Math.round(n * 100) / 100).toFixed(2);
const padNum = (n) => String(n).padStart(3, "0");
const el = (id) => document.getElementById(id);

// Migrate from old flat state to new nested structure
function loadAndMigrateState() {
  let state = JSON.parse(localStorage.getItem(KEY) || "null");
  if (state && !state.supplier) {
    // Already new format
    return state;
  }

  // Try to load old format and migrate
  const oldState = JSON.parse(localStorage.getItem("invoice-generator") || "null");
  if (oldState && oldState.from) {
    // Migrate old to new
    const fromLines = oldState.from.split('\n').map(l => l.trim()).filter(Boolean);
    const toLines = oldState.to.split('\n').map(l => l.trim()).filter(Boolean);

    state = { ...stateDefaults };
    state.number = oldState.num || "001";
    state.issuedAt = oldState.date || "";
    state.deliveredAt = oldState.delivery || "";
    state.dueAt = oldState.due || "";

    state.supplier.name = fromLines[0] || "";
    state.supplier.address = fromLines.slice(1);
    state.supplier.email = oldState.email || "";
    state.supplier.phone = oldState.phone || "";
    if (oldState.ico) state.supplier.identifiers.push({ type: "IČO", value: oldState.ico });
    if (oldState.dic) state.supplier.identifiers.push({ type: "DIČ", value: oldState.dic });
    if (oldState.icDph) state.supplier.identifiers.push({ type: "IČ DPH", value: oldState.icDph });

    state.customer.name = toLines[0] || "";
    state.customer.address = toLines.slice(1);
    if (oldState.clientIco) state.customer.identifiers.push({ type: "IČO", value: oldState.clientIco });
    if (oldState.clientDic) state.customer.identifiers.push({ type: "DIČ", value: oldState.clientDic });

    state.currency.symbol = oldState.currency || "€";
    state.currency.code = { "€": "EUR", "$": "USD", "£": "GBP", "Kč": "CZK" }[state.currency.symbol] || "EUR";

    state.paymentInfo.method = oldState.paymentMethod || "Bankový prevod";
    state.paymentInfo.bankName = oldState.bankName || "";
    state.paymentInfo.accountNumber = oldState.account || "";
    state.paymentInfo.iban = oldState.iban || "";
    state.paymentInfo.swift = oldState.swift || "";
    state.paymentInfo.variableSymbol = oldState.num ? oldState.num.replace(/\D/g, "").slice(0, 10) : "";

    state.contact.name = oldState.issuedBy || "";
    state.contact.email = oldState.email || "";
    state.contact.phone = oldState.phone || "";

    state.note = oldState.note || "";
    state.signature = oldState.signature || "";

    state.items = (oldState.lines || [{ desc: "Services", qty: 1, unit: "", price: 100, discount: 0 }]).map(l => ({
      summary: l.desc || "",
      description: "",
      sku: "",
      quantity: l.qty || 1,
      unit: l.unit || "",
      unitPrice: l.price || 0,
      discountPercent: l.discount || 0,
      discountAmount: 0,
      vatRate: oldState.tax || 0,
      price: (l.qty || 1) * (l.price || 0) * (1 - (l.discount || 0) / 100)
    }));

    console.log("Migrated invoice from old format to v2");
    return state;
  }

  // No old data, return defaults
  return { ...stateDefaults };
}

function computeTotals() {
  const sub = state.items.reduce((s, item) => {
    const qty = parseFloat(item.quantity) || 0;
    const price = parseFloat(item.unitPrice) || 0;
    const discPercent = parseFloat(item.discountPercent) || 0;
    return s + qty * price * (1 - discPercent / 100);
  }, 0);

  // VAT: use first item's VAT rate if set
  const vatRate = parseFloat(state.items[0]?.vatRate) || 0;
  const vat = sub * (vatRate / 100);

  return { sub, vat, total: sub + vat };
}

function generatePayQR() {
  if (!bysquare) return null;
  const { total } = computeTotals();
  const iban = (state.paymentInfo.iban || "").replace(/\s/g, "");
  if (!iban || total <= 0 || !state.dueAt) return null;
  if (state.currency.code !== "EUR") return null;

  try {
    return bysquare.encode({
      invoiceId: state.number || undefined,
      payments: [{
        type: bysquare.PaymentOptions.PaymentOrder,
        amount: total,
        currencyCode: bysquare.CurrencyCode.EUR,
        paymentDueDate: state.dueAt,
        variableSymbol: state.paymentInfo.variableSymbol || state.number,
        paymentNote: state.note ? state.note.slice(0, 140) : undefined,
        bankAccounts: [{ iban }],
        beneficiary: {
          name: state.supplier.name || "Invoice issuer",
          street: state.supplier.address[0] || "",
          city: state.supplier.address[1] || ""
        },
      }],
    });
  } catch (e) {
    console.error("Pay by Square encode failed", e);
    return null;
  }
}

function renderItems() {
  el("items-container").innerHTML = state.items.map((item, i) => `
    <div style="display:flex;gap:6px;margin-bottom:6px;flex-wrap:wrap;align-items:flex-start;">
      <input class="w3-input w3-border w3-round summary" data-i="${i}" value="${esc(item.summary)}" placeholder="Summary" style="flex:1.5;min-width:120px;" />
      <input type="number" class="w3-input w3-border w3-round qty" data-i="${i}" value="${item.quantity}" min="0" step="0.01" style="width:55px;" title="Qty" />
      <input class="w3-input w3-border w3-round unit" data-i="${i}" value="${esc(item.unit)}" placeholder="Unit" style="width:60px;" />
      <input type="number" class="w3-input w3-border w3-round unitPrice" data-i="${i}" value="${item.unitPrice}" min="0" step="0.01" style="width:70px;" title="Unit price" />
      <input type="number" class="w3-input w3-border w3-round discPercent" data-i="${i}" value="${item.discountPercent}" min="0" step="0.1" style="width:60px;" title="Disc %" placeholder="Disc%" />
      <input type="number" class="w3-input w3-border w3-round vatRate" data-i="${i}" value="${item.vatRate}" min="0" step="0.1" style="width:50px;" title="VAT %" placeholder="VAT%" />
      <button class="w3-button w3-small w3-text-red del-item" data-i="${i}" aria-label="Delete">×</button>
    </div>`).join("");
}

function renderPreview() {
  const { sub, vat, total } = computeTotals();
  const cur = esc(state.currency.symbol);

  const rows = state.items.map((item) => {
    const qty = parseFloat(item.quantity) || 0;
    const price = parseFloat(item.unitPrice) || 0;
    const discPercent = parseFloat(item.discountPercent) || 0;
    const lineTotal = qty * price * (1 - discPercent / 100);
    const vatStr = item.vatRate ? `<div class="w3-small">${item.vatRate}%</div>` : "";

    return `<tr>
      <td>${esc(item.summary)}</td>
      <td style="text-align:right">${qty}</td>
      <td style="text-align:right">${esc(item.unit) || "—"}</td>
      <td style="text-align:right">${money(price)} ${cur}</td>
      <td style="text-align:right">${discPercent > 0 ? discPercent + "%" : "—"}</td>
      ${item.vatRate ? `<td style="text-align:right">${item.vatRate}%</td>` : ""}
      <td style="text-align:right">${money(lineTotal)} ${cur}</td>
    </tr>`;
  }).join("");

  const supplierIds = state.supplier.identifiers.map(id => `${id.type}: ${esc(id.value)}`).join(" · ");
  const customerIds = state.customer.identifiers.map(id => `${id.type}: ${esc(id.value)}`).join(" · ");

  const qrString = generatePayQR();
  const qr = qrString ? `<div style="margin-top:16px;display:flex;align-items:center;gap:12px;flex-wrap:wrap;"><canvas id="pay-qr" style="width:120px;height:120px;"></canvas><div class="w3-small">${t('scanToPay', 'printLabels')}<br><strong>${money(total)} ${cur}</strong></div></div>` : "";

  const hasVAT = state.items.some(i => parseFloat(i.vatRate) > 0);
  const vatHeader = hasVAT ? `<th style="text-align:right">${t('vatRate', 'printLabels')}</th>` : "";

  el("preview").innerHTML = `
    <div style="display:flex;justify-content:space-between;gap:16px;flex-wrap:wrap;">
      <div>
        <div class="w3-text-grey w3-small">${t('supplier', 'printLabels')}</div>
        <div style="font-weight:600;">${esc(state.supplier.name) || "—"}</div>
        ${supplierIds ? `<div class="w3-small">${supplierIds}</div>` : ""}
        ${state.supplier.address.map(line => `<div class="w3-small">${esc(line)}</div>`).join("")}
      </div>
      <div style="text-align:right;">
        <div style="font-size:22px;font-weight:700;">${t('invoiceTitle', 'printLabels')}</div>
        <div>#${esc(state.number)}</div>
        <div>${t('issueDate', 'printLabels')}: ${esc(state.issuedAt)}</div>
        ${state.deliveredAt ? `<div>${t('deliveryDate', 'printLabels')}: ${esc(state.deliveredAt)}</div>` : ""}
        ${state.dueAt ? `<div>${t('dueDate', 'printLabels')}: ${esc(state.dueAt)}</div>` : ""}
      </div>
    </div>

    <div class="w3-margin-top">
      <div class="w3-text-grey w3-small">${t('customer', 'printLabels')}</div>
      <div style="font-weight:600;">${esc(state.customer.name) || "—"}</div>
      ${customerIds ? `<div class="w3-small">${customerIds}</div>` : ""}
      ${state.customer.address.map(line => `<div class="w3-small">${esc(line)}</div>`).join("")}
    </div>

    <table class="w3-table w3-bordered w3-margin-top" style="width:100%;font-size:13px;">
      <thead><tr class="w3-light-grey">
        <th>${t('description', 'printLabels')}</th>
        <th style="text-align:right;width:50px">${t('quantity', 'printLabels')}</th>
        <th style="text-align:right;width:50px">${t('unit', 'printLabels')}</th>
        <th style="text-align:right;width:70px">${t('unitPrice', 'printLabels')}</th>
        <th style="text-align:right;width:50px">Disc%</th>
        ${vatHeader}
        <th style="text-align:right;width:70px">${t('total', 'printLabels')}</th>
      </tr></thead>
      <tbody>${rows}</tbody>
    </table>

    ${state.note ? `<div style="margin-top:16px;white-space:pre-wrap;font-size:13px;">${esc(state.note)}</div>` : ""}

    <div style="text-align:right;margin-top:16px;font-size:13px;">
      <div>${t('subtotal', 'printLabels')}: <strong>${money(sub)} ${cur}</strong></div>
      ${vat > 0 ? `<div>${t('tax', 'printLabels')}: <strong>${money(vat)} ${cur}</strong></div>` : ""}
      <div style="font-size:16px;margin-top:8px;">${t('total', 'printLabels')}: <strong>${money(total)} ${cur}</strong></div>
    </div>

    ${state.paymentInfo.iban ? `<div style="margin-top:16px;font-size:12px;">
      <div><strong>IBAN:</strong> ${esc(state.paymentInfo.iban)}</div>
      ${state.paymentInfo.swift ? `<div><strong>SWIFT:</strong> ${esc(state.paymentInfo.swift)}</div>` : ""}
      ${state.paymentInfo.variableSymbol ? `<div><strong>Var. symbol:</strong> ${esc(state.paymentInfo.variableSymbol)}</div>` : ""}
    </div>` : ""}

    ${qr}

    ${state.signature ? `<div style="margin-top:16px;"><img src="${esc(state.signature)}" style="max-height:80px;max-width:100%;"></div>` : ""}
  `;

  if (qrString && typeof QRCode !== "undefined") {
    const c = el("pay-qr");
    if (c) QRCode.toCanvas(c, qrString, { width: 120, margin: 1, errorCorrectionLevel: "M" }, (err) => { if (err) console.error("QR render", err); });
  }
}

function render() {
  renderItems();
  renderPreview();
}

// Event listeners for supplier identifiers
el("add-supplier-id").addEventListener("click", () => {
  state.supplier.identifiers.push({ type: "IČO", value: "" });
  save();
  renderSupplierForm();
});

// Event listeners for customer identifiers
el("add-customer-id").addEventListener("click", () => {
  state.customer.identifiers.push({ type: "DIČ", value: "" });
  save();
  renderCustomerForm();
});

// Render supplier form
function renderSupplierForm() {
  const container = el("supplier-ids-container");
  container.innerHTML = state.supplier.identifiers.map((id, i) => `
    <div style="display:flex;gap:6px;margin-bottom:6px;">
      <input class="w3-input w3-border w3-round supplier-id-type" data-i="${i}" value="${esc(id.type)}" placeholder="Type" style="width:80px;" />
      <input class="w3-input w3-border w3-round supplier-id-value" data-i="${i}" value="${esc(id.value)}" placeholder="Value" style="flex:1;" />
      <button class="w3-button w3-small w3-text-red del-supplier-id" data-i="${i}">×</button>
    </div>
  `).join("");
}

function renderCustomerForm() {
  const container = el("customer-ids-container");
  container.innerHTML = state.customer.identifiers.map((id, i) => `
    <div style="display:flex;gap:6px;margin-bottom:6px;">
      <input class="w3-input w3-border w3-round customer-id-type" data-i="${i}" value="${esc(id.type)}" placeholder="Type" style="width:80px;" />
      <input class="w3-input w3-border w3-round customer-id-value" data-i="${i}" value="${esc(id.value)}" placeholder="Value" style="flex:1;" />
      <button class="w3-button w3-small w3-text-red del-customer-id" data-i="${i}">×</button>
    </div>
  `).join("");
}

// Supplier form listeners
el("supplier-name").addEventListener("input", (e) => { state.supplier.name = e.target.value; save(); renderPreview(); });
el("supplier-email").addEventListener("input", (e) => { state.supplier.email = e.target.value; save(); });
el("supplier-phone").addEventListener("input", (e) => { state.supplier.phone = e.target.value; save(); });

el("supplier-ids-container").addEventListener("input", (e) => {
  const i = parseInt(e.target.dataset.i, 10);
  if (Number.isNaN(i)) return;
  if (e.target.classList.contains("supplier-id-type")) state.supplier.identifiers[i].type = e.target.value;
  if (e.target.classList.contains("supplier-id-value")) state.supplier.identifiers[i].value = e.target.value;
  save();
  renderPreview();
});

el("supplier-ids-container").addEventListener("click", (e) => {
  const btn = e.target.closest(".del-supplier-id");
  if (!btn) return;
  state.supplier.identifiers.splice(parseInt(btn.dataset.i, 10), 1);
  save();
  renderSupplierForm();
  renderPreview();
});

// Customer form listeners
el("customer-name").addEventListener("input", (e) => { state.customer.name = e.target.value; save(); renderPreview(); });

el("customer-ids-container").addEventListener("input", (e) => {
  const i = parseInt(e.target.dataset.i, 10);
  if (Number.isNaN(i)) return;
  if (e.target.classList.contains("customer-id-type")) state.customer.identifiers[i].type = e.target.value;
  if (e.target.classList.contains("customer-id-value")) state.customer.identifiers[i].value = e.target.value;
  save();
  renderPreview();
});

el("customer-ids-container").addEventListener("click", (e) => {
  const btn = e.target.closest(".del-customer-id");
  if (!btn) return;
  state.customer.identifiers.splice(parseInt(btn.dataset.i, 10), 1);
  save();
  renderCustomerForm();
  renderPreview();
});

// Invoice metadata
el("inv-number").addEventListener("input", (e) => { state.number = e.target.value; save(); renderPreview(); });
el("inv-issued").addEventListener("input", (e) => { state.issuedAt = e.target.value; save(); renderPreview(); });
el("inv-delivered").addEventListener("input", (e) => { state.deliveredAt = e.target.value; save(); renderPreview(); });
el("inv-due").addEventListener("input", (e) => { state.dueAt = e.target.value; save(); renderPreview(); });
el("inv-language").addEventListener("change", (e) => { state.language = e.target.value; save(); renderForm(); renderPreview(); });

// Currency
el("currency-code").addEventListener("input", (e) => { state.currency.code = e.target.value.toUpperCase(); save(); });
el("currency-symbol").addEventListener("input", (e) => { state.currency.symbol = e.target.value; save(); renderPreview(); });

// Payment info
el("payment-method").addEventListener("input", (e) => { state.paymentInfo.method = e.target.value; save(); });
el("bank-name").addEventListener("input", (e) => { state.paymentInfo.bankName = e.target.value; save(); });
el("iban").addEventListener("input", (e) => { state.paymentInfo.iban = e.target.value; save(); });
el("swift").addEventListener("input", (e) => { state.paymentInfo.swift = e.target.value; save(); });
el("variable-symbol").addEventListener("input", (e) => { state.paymentInfo.variableSymbol = e.target.value; save(); });

// Contact
el("contact-name").addEventListener("input", (e) => { state.contact.name = e.target.value; save(); });
el("contact-email").addEventListener("input", (e) => { state.contact.email = e.target.value; save(); });
el("contact-phone").addEventListener("input", (e) => { state.contact.phone = e.target.value; save(); });

// Items
el("items-container").addEventListener("input", (e) => {
  const i = parseInt(e.target.dataset.i, 10);
  if (Number.isNaN(i)) return;
  if (e.target.classList.contains("summary")) state.items[i].summary = e.target.value;
  if (e.target.classList.contains("qty")) state.items[i].quantity = parseFloat(e.target.value) || 0;
  if (e.target.classList.contains("unit")) state.items[i].unit = e.target.value;
  if (e.target.classList.contains("unitPrice")) state.items[i].unitPrice = parseFloat(e.target.value) || 0;
  if (e.target.classList.contains("discPercent")) state.items[i].discountPercent = parseFloat(e.target.value) || 0;
  if (e.target.classList.contains("vatRate")) state.items[i].vatRate = parseFloat(e.target.value) || 0;
  save();
  renderPreview();
});

el("items-container").addEventListener("click", (e) => {
  const btn = e.target.closest(".del-item");
  if (!btn) return;
  state.items.splice(parseInt(btn.dataset.i, 10), 1);
  if (!state.items.length) state.items.push({ summary: "", description: "", sku: "", quantity: 1, unit: "", unitPrice: 0, discountPercent: 0, discountAmount: 0, vatRate: 0, price: 0 });
  save();
  render();
});

el("add-item").addEventListener("click", () => {
  state.items.push({ summary: "", description: "", sku: "", quantity: 1, unit: "", unitPrice: 0, discountPercent: 0, discountAmount: 0, vatRate: 0, price: 0 });
  save();
  render();
});

// Misc
el("note").addEventListener("input", (e) => { state.note = e.target.value; save(); renderPreview(); });

el("signature").addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const r = new FileReader();
  r.onload = () => { state.signature = r.result; save(); renderPreview(); };
  r.readAsDataURL(file);
});

el("clear-sig").addEventListener("click", () => { state.signature = ""; el("signature").value = ""; save(); renderPreview(); });

el("print-btn").addEventListener("click", () => {
  window.print();
});

function renderForm() {
  // Update form labels based on language
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.dataset.i18n;
    const section = el.dataset.i18nSection || "formLabels";
    el.textContent = t(key, section);
  });
}

// Initialize
renderSupplierForm();
renderCustomerForm();
renderForm();
render();
