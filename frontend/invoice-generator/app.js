// Invoice Generator v2 - Data model strictly follows invoice.xsd

let bysquare = null;
import("https://esm.sh/bysquare@2.12.4")
  .then((m) => { bysquare = m; renderPreview(); })
  .catch(() => { bysquare = null; });

const KEY = "invoice-generator-v2";

const TRANSLATIONS = {
  en_US: {
    invoiceTitle: "Invoice",
    supplier: "Supplier",
    customer: "Customer",
    issueDate: "Issue date",
    deliveryDate: "Delivery date",
    dueDate: "Due date",
    description: "Description",
    quantity: "Qty",
    unit: "Unit",
    unitPrice: "Price",
    discount: "Discount",
    vatRate: "VAT%",
    total: "Total",
    bank: "Bank",
    account: "Account",
    iban: "IBAN",
    swift: "SWIFT",
    variableSymbol: "Variable symbol",
    constantSymbol: "Constant symbol",
    specificSymbol: "Specific symbol",
    method: "Method",
    payBySquare: "Pay by square",
    issuedByLabel: "Issued by",
  },
  sk_SK: {
    invoiceTitle: "Faktúra",
    supplier: "Dodávateľ",
    customer: "Odberateľ",
    issueDate: "Dátum vystavenia",
    deliveryDate: "Dátum dodania",
    dueDate: "Dátum splatnosti",
    description: "Názov a popis",
    quantity: "Počet",
    unit: "Jednotka",
    unitPrice: "Jednotková cena",
    discount: "Zľava",
    vatRate: "Sadzba DPH",
    total: "Celkom",
    bank: "Banka",
    account: "Číslo účtu",
    iban: "IBAN",
    swift: "SWIFT",
    variableSymbol: "Variabilný symbol",
    constantSymbol: "Konštantný symbol",
    specificSymbol: "Špecifický symbol",
    method: "Spôsob úhrady",
    payBySquare: "Pay by Square",
    issuedByLabel: "Vystavil",
  },
  cs_CZ: {
    invoiceTitle: "Faktura",
    supplier: "Dodavatel",
    customer: "Odběratel",
    issueDate: "Datum vystavení",
    deliveryDate: "Datum dodání",
    dueDate: "Datum splatnosti",
    description: "Název a popis",
    quantity: "Počet",
    unit: "Jednotka",
    unitPrice: "Jednotková cena",
    discount: "Sleva",
    vatRate: "Sazba DPH",
    total: "Celkem",
    bank: "Banka",
    account: "Číslo účtu",
    iban: "IBAN",
    swift: "SWIFT",
    variableSymbol: "Variabilní symbol",
    constantSymbol: "Konstantní symbol",
    specificSymbol: "Specifický symbol",
    method: "Způsob úhrady",
    payBySquare: "Pay by Square",
    issuedByLabel: "Vystavil",
  },
};

function t(key) {
  const lang = TRANSLATIONS[state.language] ? state.language : "en_US";
  return TRANSLATIONS[lang][key] ?? TRANSLATIONS.en_US[key] ?? key;
}

const newParty = () => ({ name: "", contactPerson: "", identifiers: [], address: [], email: "", phone: "", web: "" });
const newItem = () => ({ summary: "", description: "", sku: "", quantity: 1, unit: "", unitPrice: 0, discountPercent: undefined, discountAmount: undefined, vatRate: undefined, price: 0 });

const stateDefaults = () => ({
  number: "001",
  issuedBy: "",
  language: "sk_SK",
  issuedAt: new Date().toISOString().slice(0, 10),
  deliveredAt: "",
  dueAt: "",
  currency: { code: "EUR", symbol: "€" },
  supplier: newParty(),
  customer: newParty(),
  items: [{ ...newItem(), summary: "Services", quantity: 1, unitPrice: 100, price: 100 }],
  note: "",
  orderNumber: "",
  contractNumber: "",
  paymentInfo: { method: "Bankový prevod", bankName: "", accountNumber: "", iban: "", swift: "", variableSymbol: "", constantSymbol: "", specificSymbol: "", paymentNote: "" },
  contact: { name: "", email: "", phone: "" },
  signature: ""
});

let state = loadAndMigrateState();

const TEMPLATES_KEY = "invoice-generator-v2-templates";
let templates = JSON.parse(localStorage.getItem(TEMPLATES_KEY) || "null") || {};

const save = () => localStorage.setItem(KEY, JSON.stringify(state));
const saveTemplates = () => localStorage.setItem(TEMPLATES_KEY, JSON.stringify(templates));
const esc = (t) => { const d = document.createElement("div"); d.textContent = t ?? ""; return d.innerHTML; };
const money = (n) => (Math.round(n * 100) / 100).toFixed(2);
const el = (id) => document.getElementById(id);

const TEMPLATE_EXCLUDED_FIELDS = ["number", "issuedAt", "deliveredAt", "dueAt"];

function saveAsTemplate(name) {
  const snapshot = JSON.parse(JSON.stringify(state));
  TEMPLATE_EXCLUDED_FIELDS.forEach((f) => delete snapshot[f]);
  templates[name] = snapshot;
  saveTemplates();
}

function loadTemplate(name) {
  const tpl = templates[name];
  if (!tpl) return;
  const defaults = stateDefaults();
  state = { ...defaults, ...JSON.parse(JSON.stringify(tpl)) };
  save();
  render();
}

function deleteTemplate(name) {
  delete templates[name];
  saveTemplates();
}

function loadAndMigrateState() {
  const saved = JSON.parse(localStorage.getItem(KEY) || "null");
  if (saved && Array.isArray(saved.supplier?.identifiers)) return saved;

  const defaults = stateDefaults();
  // Migrate from the earlier free-text v2 shape (supplier.text / customer.text)
  if (saved && typeof saved.supplier?.text === "string") {
    const parseParty = (text) => {
      const lines = (text || "").split("\n").map((l) => l.trim()).filter(Boolean);
      const party = newParty();
      party.name = lines[0] || "";
      party.address = lines.slice(1);
      return party;
    };
    const migrated = { ...defaults, ...saved };
    migrated.supplier = parseParty(saved.supplier.text);
    migrated.customer = parseParty(saved.customer.text);
    migrated.items = (saved.items || defaults.items).map((it) => ({ ...newItem(), ...it }));
    console.log("Migrated invoice from free-text v2 format");
    return migrated;
  }

  return defaults;
}

function computeTotals() {
  const total = state.items.reduce((s, item) => {
    const qty = parseFloat(item.quantity) || 0;
    const price = parseFloat(item.unitPrice) || 0;
    const discPercent = parseFloat(item.discountPercent) || 0;
    const discAmount = parseFloat(item.discountAmount) || 0;
    const lineBase = qty * price * (1 - discPercent / 100) - discAmount;
    return s + lineBase;
  }, 0);
  return { total };
}

let lastQrError = "";
function generatePayQR() {
  if (!bysquare) { lastQrError = "bysquare library not loaded"; return null; }
  const { total } = computeTotals();
  const iban = (state.paymentInfo.iban || "").replace(/\s/g, "");
  if (!iban) { lastQrError = "no IBAN entered"; return null; }
  if (total <= 0) { lastQrError = "total is zero"; return null; }
  if (!state.dueAt) { lastQrError = "no due date set"; return null; }
  if (state.currency.code !== "EUR") { lastQrError = "currency is not EUR"; return null; }

  try {
    const qr = bysquare.encode({
      invoiceId: state.number || undefined,
      payments: [{
        type: bysquare.PaymentOptions.PaymentOrder,
        amount: total,
        currencyCode: bysquare.CurrencyCode.EUR,
        paymentDueDate: state.dueAt,
        variableSymbol: state.paymentInfo.variableSymbol || state.number,
        bankAccounts: [{ iban }],
        beneficiary: { name: state.supplier.name || "Invoice issuer", street: state.supplier.address[0] || "", city: state.supplier.address[1] || "" },
      }],
    });
    lastQrError = "";
    return qr;
  } catch (e) {
    lastQrError = e?.message || String(e);
    console.error("Pay by Square encode failed", e);
    return null;
  }
}

function renderIdentifiers(party, containerId) {
  el(containerId).innerHTML = party.identifiers.map((idf, i) => `
    <div class="id-item" data-i="${i}">
      <input class="w3-input w3-border w3-round id-type" value="${esc(idf.type)}" placeholder="Type (e.g. IČO)" style="flex:1;" />
      <input class="w3-input w3-border w3-round id-value" value="${esc(idf.value)}" placeholder="Value" style="flex:1.5;" />
      <button class="w3-button w3-small w3-text-red del-id">×</button>
    </div>`).join("");
}

function renderParties() {
  el("supplier-name").value = state.supplier.name;
  el("supplier-contact-person").value = state.supplier.contactPerson;
  el("supplier-address").value = state.supplier.address.join("\n");
  el("supplier-email").value = state.supplier.email;
  el("supplier-phone").value = state.supplier.phone;
  el("supplier-web").value = state.supplier.web;
  renderIdentifiers(state.supplier, "supplier-ids-container");

  el("customer-name").value = state.customer.name;
  el("customer-contact-person").value = state.customer.contactPerson;
  el("customer-address").value = state.customer.address.join("\n");
  el("customer-email").value = state.customer.email;
  el("customer-phone").value = state.customer.phone;
  el("customer-web").value = state.customer.web;
  renderIdentifiers(state.customer, "customer-ids-container");
}

function renderItems() {
  const hasVat = state.items.some((it) => parseFloat(it.vatRate) > 0);
  el("items-container").innerHTML = state.items.map((item, i) => `
    <div style="border:1px solid #e0e0e0;border-radius:6px;padding:6px;margin-bottom:6px;">
      <div style="display:flex;gap:6px;flex-wrap:wrap;align-items:flex-start;">
        <input class="w3-input w3-border w3-round summary" data-i="${i}" value="${esc(item.summary)}" placeholder="Description" style="flex:1.5;min-width:120px;" />
        <input type="number" class="w3-input w3-border w3-round qty" data-i="${i}" value="${item.quantity}" min="0" step="0.01" style="width:55px;" title="Qty" />
        <input class="w3-input w3-border w3-round unit" data-i="${i}" value="${esc(item.unit)}" placeholder="Unit" style="width:60px;" />
        <input type="number" class="w3-input w3-border w3-round unitPrice" data-i="${i}" value="${item.unitPrice}" min="0" step="0.01" style="width:70px;" title="Unit price" />
        <input type="number" class="w3-input w3-border w3-round discPercent" data-i="${i}" value="${item.discountPercent ?? ""}" min="0" step="0.1" style="width:60px;" title="Discount %" placeholder="Disc%" />
        <input type="number" class="w3-input w3-border w3-round vatRate" data-i="${i}" value="${item.vatRate ?? ""}" min="0" step="0.1" style="width:60px;" title="VAT %" placeholder="VAT%" />
        <button class="w3-button w3-small w3-text-red del-item" data-i="${i}">×</button>
      </div>
      <input class="w3-input w3-border w3-round description" data-i="${i}" value="${esc(item.description)}" placeholder="Additional description (optional)" style="margin-top:6px;font-size:13px;" />
    </div>`).join("");
}

function renderPreview() {
  const { total } = computeTotals();
  const cur = esc(state.currency.symbol);

  const hasDiscount = state.items.some((item) => (parseFloat(item.discountPercent) || 0) > 0 || (parseFloat(item.discountAmount) || 0) > 0);
  const hasVat = state.items.some((item) => (parseFloat(item.vatRate) || 0) > 0);

  const rows = state.items.map((item) => {
    const qty = parseFloat(item.quantity) || 0;
    const price = parseFloat(item.unitPrice) || 0;
    const discPercent = parseFloat(item.discountPercent) || 0;
    const discAmount = parseFloat(item.discountAmount) || 0;
    const vatRate = parseFloat(item.vatRate) || 0;
    const lineNet = qty * price * (1 - discPercent / 100) - discAmount;
    const lineTotal = lineNet * (1 + vatRate / 100);
    const discLabel = discPercent > 0 ? discPercent + "%" : (discAmount > 0 ? money(discAmount) + " " + cur : "—");
    return `<tr>
      <td>${esc(item.summary)}${item.description ? `<br><span class="item-desc">${esc(item.description)}</span>` : ""}</td>
      <td style="text-align:right">${qty}</td>
      <td style="text-align:right">${esc(item.unit) || "—"}</td>
      <td style="text-align:right">${money(price)} ${cur}</td>
      ${hasDiscount ? `<td style="text-align:right">${discLabel}</td>` : ""}
      ${hasVat ? `<td style="text-align:right">${vatRate > 0 ? vatRate + "%" : "—"}</td>` : ""}
      <td style="text-align:right">${money(lineTotal)} ${cur}</td>
    </tr>`;
  }).join("");

  const qrString = generatePayQR();
  const qr = qrString ? `<canvas id="pay-qr" width="110" height="110"></canvas><div>${t("payBySquare")}</div>`
    : (state.paymentInfo.iban ? `<div class="w3-small w3-text-red no-print" style="max-width:140px;">QR not shown: ${esc(lastQrError)}</div>` : "");

  const paymentRows = [
    state.paymentInfo.bankName && `<div><strong>${t("bank")}:</strong> ${esc(state.paymentInfo.bankName)}</div>`,
    state.paymentInfo.accountNumber && `<div><strong>${t("account")}:</strong> ${esc(state.paymentInfo.accountNumber)}</div>`,
    state.paymentInfo.iban && `<div><strong>${t("iban")}:</strong> ${esc(state.paymentInfo.iban)}</div>`,
    state.paymentInfo.swift && `<div><strong>${t("swift")}:</strong> ${esc(state.paymentInfo.swift)}</div>`,
    state.paymentInfo.variableSymbol && `<div><strong>${t("variableSymbol")}:</strong> ${esc(state.paymentInfo.variableSymbol)}</div>`,
    state.paymentInfo.constantSymbol && `<div><strong>${t("constantSymbol")}:</strong> ${esc(state.paymentInfo.constantSymbol)}</div>`,
    state.paymentInfo.specificSymbol && `<div><strong>${t("specificSymbol")}:</strong> ${esc(state.paymentInfo.specificSymbol)}</div>`,
    state.paymentInfo.method && `<div><strong>${t("method")}:</strong> ${esc(state.paymentInfo.method)}</div>`,
  ].filter(Boolean).join("");

  const hasPaymentInfo = paymentRows || qr;

  const issuedByParts = [state.contact.name, state.contact.email, state.contact.phone].filter(Boolean).map(esc);
  const issuedByLine = issuedByParts.length ? `${t("issuedByLabel")}: ${issuedByParts.join(" · ")}` : "";

  const partyBlock = (party) => {
    const idLines = party.identifiers.filter((i) => i.type && i.value).map((i) => `${esc(i.type)}: ${esc(i.value)}`);
    const lines = [party.name, ...party.address, ...idLines].filter(Boolean);
    const contactLine = [party.email, party.phone, party.web].filter(Boolean).map(esc).join(" · ");
    return `<pre>${lines.map(esc).join("\n") || "—"}</pre>${contactLine ? `<div class="w3-small" style="margin-top:6px;">${contactLine}</div>` : ""}`;
  };

  el("preview").innerHTML = `
    <div class="inv-header">
      <div class="inv-supplier-name">${esc(state.supplier.name) || "&nbsp;"}</div>
      <div class="inv-title">${t("invoiceTitle")} <span class="inv-number">#${esc(state.number)}</span></div>
    </div>

    <div class="parties">
      <div class="party-box">
        <div class="party-label">${t("supplier")}</div>
        ${partyBlock(state.supplier)}
      </div>
      <div class="party-box">
        <div class="party-label">${t("customer")}</div>
        ${partyBlock(state.customer)}
      </div>
    </div>

    <div class="dates-box">
      <div>${t("issueDate")}: <strong>${esc(state.issuedAt) || "—"}</strong></div>
      <div>${t("deliveryDate")}: <strong>${esc(state.deliveredAt) || "—"}</strong></div>
      <div>${t("dueDate")}: <strong>${esc(state.dueAt) || "—"}</strong></div>
    </div>

    <table class="items">
      <thead><tr>
        <th>${t("description")}</th>
        <th style="text-align:right;width:50px">${t("quantity")}</th>
        <th style="text-align:right;width:50px">${t("unit")}</th>
        <th style="text-align:right;width:70px">${t("unitPrice")}</th>
        ${hasDiscount ? `<th style="text-align:right;width:60px">${t("discount")}</th>` : ""}
        ${hasVat ? `<th style="text-align:right;width:50px">${t("vatRate")}</th>` : ""}
        <th style="text-align:right;width:70px">${t("total")}</th>
      </tr></thead>
      <tbody>${rows}</tbody>
    </table>

    ${state.note ? `<div class="vat-note">${esc(state.note)}</div>` : ""}

    <div class="totals">
      <div class="grand">${t("total")}: ${money(total)} ${cur}</div>
    </div>

    ${hasPaymentInfo ? `<div class="payment-box">
      <div class="payment-details">${paymentRows}</div>
      ${qr ? `<div class="payment-qr">${qr}</div>` : ""}
    </div>` : ""}

    ${state.signature ? `<div class="signature-block"><img src="${esc(state.signature)}"><br><span class="sig-name">${esc(state.contact.name) || "&nbsp;"}</span></div>` : ""}

    ${issuedByLine ? `<div class="issued-by-footer">${issuedByLine}</div>` : ""}
  `;

  if (qrString && typeof QRCode !== "undefined") {
    const c = el("pay-qr");
    if (c) QRCode.toCanvas(c, qrString, { width: 110, margin: 1, errorCorrectionLevel: "M" }, (err) => { if (err) console.error("QR render", err); });
  }
}

function renderTemplateOptions() {
  const names = Object.keys(templates).sort();
  el("template-select").innerHTML = `<option value="">Load a saved template…</option>` + names.map((n) => `<option value="${esc(n)}">${esc(n)}</option>`).join("");
  el("delete-template-btn").style.display = names.length ? "inline-block" : "none";
}

function render() {
  renderParties();
  renderItems();
  renderPreview();
  renderTemplateOptions();
}

// ---- XML export/import (invoice.xsd) ----

function xmlEsc(s) {
  return String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" }[c]));
}

function partyToXml(tag, party) {
  const idBlock = party.identifiers.filter((i) => i.type && i.value).length
    ? `<identifiers>${party.identifiers.filter((i) => i.type && i.value).map((i) => `<identifier><type>${xmlEsc(i.type)}</type><value>${xmlEsc(i.value)}</value></identifier>`).join("")}</identifiers>`
    : "";
  const addrBlock = party.address.length ? `<address>${party.address.map((l) => `<line>${xmlEsc(l)}</line>`).join("")}</address>` : "";
  return `<${tag}>
    <name>${xmlEsc(party.name)}</name>
    ${party.contactPerson ? `<contact-person>${xmlEsc(party.contactPerson)}</contact-person>` : ""}
    ${idBlock}
    ${addrBlock}
    ${party.email ? `<email>${xmlEsc(party.email)}</email>` : ""}
    ${party.phone ? `<phone>${xmlEsc(party.phone)}</phone>` : ""}
    ${party.web ? `<web>${xmlEsc(party.web)}</web>` : ""}
  </${tag}>`;
}

function exportXML() {
  const { total } = computeTotals();
  const hasVat = state.items.some((it) => (parseFloat(it.vatRate) || 0) > 0);
  const itemsXml = state.items.map((item) => {
    const qty = parseFloat(item.quantity) || 0;
    const price = parseFloat(item.unitPrice) || 0;
    const discPercent = parseFloat(item.discountPercent) || 0;
    const discAmount = parseFloat(item.discountAmount) || 0;
    const vatRate = parseFloat(item.vatRate) || 0;
    const lineTotal = (qty * price * (1 - discPercent / 100) - discAmount) * (1 + vatRate / 100);
    return `<item>
      <summary>${xmlEsc(item.summary)}</summary>
      ${item.description ? `<description>${xmlEsc(item.description)}</description>` : ""}
      ${item.sku ? `<sku>${xmlEsc(item.sku)}</sku>` : ""}
      <quantity>${qty}</quantity>
      <unit>${xmlEsc(item.unit)}</unit>
      <unit-price>${price.toFixed(2)}</unit-price>
      ${discPercent ? `<discount-percent>${discPercent}</discount-percent>` : ""}
      ${discAmount ? `<discount-amount>${discAmount.toFixed(2)}</discount-amount>` : ""}
      ${vatRate ? `<vat-rate>${vatRate}</vat-rate>` : ""}
      <price>${lineTotal.toFixed(2)}</price>
    </item>`;
  }).join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<invoice>
  <number>${xmlEsc(state.number)}</number>
  <issued-by>${xmlEsc(state.contact.name)}</issued-by>
  <language>${xmlEsc(state.language)}</language>
  <issued-at>${xmlEsc(state.issuedAt)}</issued-at>
  <delivered-at>${xmlEsc(state.deliveredAt)}</delivered-at>
  <due-at>${xmlEsc(state.dueAt)}</due-at>
  <currency>
    <code>${xmlEsc(state.currency.code)}</code>
    <symbol>${xmlEsc(state.currency.symbol)}</symbol>
  </currency>
  ${partyToXml("supplier", state.supplier)}
  ${partyToXml("customer", state.customer)}
  <items>
    ${itemsXml}
    <vat>${hasVat}</vat>
  </items>
  ${state.note ? `<note>${xmlEsc(state.note)}</note>` : ""}
  ${state.orderNumber ? `<order-number>${xmlEsc(state.orderNumber)}</order-number>` : ""}
  ${state.contractNumber ? `<contract-number>${xmlEsc(state.contractNumber)}</contract-number>` : ""}
  <total>${total.toFixed(2)}</total>
  <payment-info>
    <method>${xmlEsc(state.paymentInfo.method)}</method>
    ${state.paymentInfo.bankName ? `<bank-name>${xmlEsc(state.paymentInfo.bankName)}</bank-name>` : ""}
    ${state.paymentInfo.accountNumber ? `<account-number>${xmlEsc(state.paymentInfo.accountNumber)}</account-number>` : ""}
    <iban>${xmlEsc(state.paymentInfo.iban)}</iban>
    ${state.paymentInfo.swift ? `<swift>${xmlEsc(state.paymentInfo.swift)}</swift>` : ""}
    <variable-symbol>${xmlEsc(state.paymentInfo.variableSymbol)}</variable-symbol>
    ${state.paymentInfo.constantSymbol ? `<constant-symbol>${xmlEsc(state.paymentInfo.constantSymbol)}</constant-symbol>` : ""}
    ${state.paymentInfo.specificSymbol ? `<specific-symbol>${xmlEsc(state.paymentInfo.specificSymbol)}</specific-symbol>` : ""}
    ${state.paymentInfo.paymentNote ? `<payment-note>${xmlEsc(state.paymentInfo.paymentNote)}</payment-note>` : ""}
  </payment-info>
  <contact>
    <name>${xmlEsc(state.contact.name)}</name>
    <email>${xmlEsc(state.contact.email)}</email>
    <phone>${xmlEsc(state.contact.phone)}</phone>
  </contact>
</invoice>
`;
  return xml;
}

function downloadXML() {
  const xml = exportXML();
  const blob = new Blob([xml], { type: "application/xml" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `invoice-${state.number || "export"}.xml`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function textOf(parent, tag) {
  const node = parent?.querySelector(tag);
  return node ? node.textContent : "";
}

function partyFromXml(node) {
  const party = newParty();
  if (!node) return party;
  party.name = textOf(node, "name");
  party.contactPerson = textOf(node, "contact-person");
  party.identifiers = Array.from(node.querySelectorAll("identifiers > identifier")).map((idNode) => ({
    type: textOf(idNode, "type"),
    value: textOf(idNode, "value"),
  }));
  party.address = Array.from(node.querySelectorAll("address > line")).map((l) => l.textContent);
  party.email = textOf(node, "email");
  party.phone = textOf(node, "phone");
  party.web = textOf(node, "web");
  return party;
}

function importXML(xmlString) {
  const doc = new DOMParser().parseFromString(xmlString, "application/xml");
  if (doc.querySelector("parsererror")) throw new Error("Invalid XML file");
  const inv = doc.querySelector("invoice");
  if (!inv) throw new Error("No <invoice> root element found");

  const next = stateDefaults();
  next.number = textOf(inv, "number") || next.number;
  next.language = textOf(inv, "language") || next.language;
  next.issuedAt = textOf(inv, "issued-at") || next.issuedAt;
  next.deliveredAt = textOf(inv, "delivered-at");
  next.dueAt = textOf(inv, "due-at");
  next.currency.code = textOf(inv.querySelector("currency"), "code") || next.currency.code;
  next.currency.symbol = textOf(inv.querySelector("currency"), "symbol") || next.currency.symbol;
  next.supplier = partyFromXml(inv.querySelector(":scope > supplier"));
  next.customer = partyFromXml(inv.querySelector(":scope > customer"));

  const itemsNode = inv.querySelector(":scope > items");
  const itemNodes = itemsNode ? Array.from(itemsNode.querySelectorAll(":scope > item")) : [];
  next.items = itemNodes.length ? itemNodes.map((itNode) => {
    const item = newItem();
    item.summary = textOf(itNode, "summary");
    item.description = textOf(itNode, "description");
    item.sku = textOf(itNode, "sku");
    item.quantity = parseFloat(textOf(itNode, "quantity")) || 0;
    item.unit = textOf(itNode, "unit");
    item.unitPrice = parseFloat(textOf(itNode, "unit-price")) || 0;
    const dp = textOf(itNode, "discount-percent");
    const da = textOf(itNode, "discount-amount");
    const vr = textOf(itNode, "vat-rate");
    item.discountPercent = dp ? parseFloat(dp) : undefined;
    item.discountAmount = da ? parseFloat(da) : undefined;
    item.vatRate = vr ? parseFloat(vr) : undefined;
    item.price = parseFloat(textOf(itNode, "price")) || 0;
    return item;
  }) : next.items;

  next.note = textOf(inv, "note");
  next.orderNumber = textOf(inv, "order-number");
  next.contractNumber = textOf(inv, "contract-number");

  const pi = inv.querySelector(":scope > payment-info");
  if (pi) {
    next.paymentInfo.method = textOf(pi, "method") || next.paymentInfo.method;
    next.paymentInfo.bankName = textOf(pi, "bank-name");
    next.paymentInfo.accountNumber = textOf(pi, "account-number");
    next.paymentInfo.iban = textOf(pi, "iban");
    next.paymentInfo.swift = textOf(pi, "swift");
    next.paymentInfo.variableSymbol = textOf(pi, "variable-symbol");
    next.paymentInfo.constantSymbol = textOf(pi, "constant-symbol");
    next.paymentInfo.specificSymbol = textOf(pi, "specific-symbol");
    next.paymentInfo.paymentNote = textOf(pi, "payment-note");
  }

  const contactNode = inv.querySelector(":scope > contact");
  if (contactNode) {
    next.contact.name = textOf(contactNode, "name") || textOf(inv, "issued-by");
    next.contact.email = textOf(contactNode, "email");
    next.contact.phone = textOf(contactNode, "phone");
  } else {
    next.contact.name = textOf(inv, "issued-by");
  }

  state = next;
  save();
  render();
}

// ---- Event listeners ----

function bindPartyField(id, party, field) {
  el(id).addEventListener("input", (e) => { party[field] = e.target.value; save(); renderPreview(); });
}
bindPartyField("supplier-name", state.supplier, "name");
bindPartyField("supplier-contact-person", state.supplier, "contactPerson");
bindPartyField("supplier-email", state.supplier, "email");
bindPartyField("supplier-phone", state.supplier, "phone");
bindPartyField("supplier-web", state.supplier, "web");
el("supplier-address").addEventListener("input", (e) => { state.supplier.address = e.target.value.split("\n").map((l) => l.trim()).filter(Boolean); save(); renderPreview(); });

bindPartyField("customer-name", state.customer, "name");
bindPartyField("customer-contact-person", state.customer, "contactPerson");
bindPartyField("customer-email", state.customer, "email");
bindPartyField("customer-phone", state.customer, "phone");
bindPartyField("customer-web", state.customer, "web");
el("customer-address").addEventListener("input", (e) => { state.customer.address = e.target.value.split("\n").map((l) => l.trim()).filter(Boolean); save(); renderPreview(); });

function bindIdentifierEvents(party, containerId, addBtnId) {
  el(containerId).addEventListener("input", (e) => {
    const row = e.target.closest(".id-item");
    if (!row) return;
    const i = parseInt(row.dataset.i, 10);
    if (e.target.classList.contains("id-type")) party.identifiers[i].type = e.target.value;
    if (e.target.classList.contains("id-value")) party.identifiers[i].value = e.target.value;
    save();
    renderPreview();
  });
  el(containerId).addEventListener("click", (e) => {
    const btn = e.target.closest(".del-id");
    if (!btn) return;
    const row = btn.closest(".id-item");
    party.identifiers.splice(parseInt(row.dataset.i, 10), 1);
    save();
    renderIdentifiers(party, containerId);
    renderPreview();
  });
  el(addBtnId).addEventListener("click", () => {
    party.identifiers.push({ type: "", value: "" });
    save();
    renderIdentifiers(party, containerId);
  });
}
bindIdentifierEvents(state.supplier, "supplier-ids-container", "add-supplier-id");
bindIdentifierEvents(state.customer, "customer-ids-container", "add-customer-id");

el("inv-number").addEventListener("input", (e) => { state.number = e.target.value; save(); renderPreview(); });
el("inv-issued").addEventListener("input", (e) => { state.issuedAt = e.target.value; save(); renderPreview(); });
el("inv-delivered").addEventListener("input", (e) => { state.deliveredAt = e.target.value; save(); renderPreview(); });
el("inv-due").addEventListener("input", (e) => { state.dueAt = e.target.value; save(); renderPreview(); });
el("inv-language").addEventListener("change", (e) => { state.language = e.target.value; save(); renderPreview(); });
el("inv-order-number").addEventListener("input", (e) => { state.orderNumber = e.target.value; save(); renderPreview(); });
el("inv-contract-number").addEventListener("input", (e) => { state.contractNumber = e.target.value; save(); renderPreview(); });

el("currency-code").addEventListener("input", (e) => { state.currency.code = e.target.value.toUpperCase(); save(); renderPreview(); });
el("currency-symbol").addEventListener("input", (e) => { state.currency.symbol = e.target.value; save(); renderPreview(); });

el("payment-method").addEventListener("input", (e) => { state.paymentInfo.method = e.target.value; save(); renderPreview(); });
el("bank-name").addEventListener("input", (e) => { state.paymentInfo.bankName = e.target.value; save(); renderPreview(); });
el("iban").addEventListener("input", (e) => { state.paymentInfo.iban = e.target.value; save(); renderPreview(); });
el("swift").addEventListener("input", (e) => { state.paymentInfo.swift = e.target.value; save(); renderPreview(); });
el("variable-symbol").addEventListener("input", (e) => { state.paymentInfo.variableSymbol = e.target.value; save(); renderPreview(); });
el("constant-symbol").addEventListener("input", (e) => { state.paymentInfo.constantSymbol = e.target.value; save(); renderPreview(); });
el("specific-symbol").addEventListener("input", (e) => { state.paymentInfo.specificSymbol = e.target.value; save(); renderPreview(); });
el("payment-note").addEventListener("input", (e) => { state.paymentInfo.paymentNote = e.target.value; save(); });

el("contact-name").addEventListener("input", (e) => { state.contact.name = e.target.value; save(); renderPreview(); });
el("contact-email").addEventListener("input", (e) => { state.contact.email = e.target.value; save(); renderPreview(); });
el("contact-phone").addEventListener("input", (e) => { state.contact.phone = e.target.value; save(); renderPreview(); });

el("items-container").addEventListener("input", (e) => {
  const i = parseInt(e.target.dataset.i, 10);
  if (Number.isNaN(i)) return;
  if (e.target.classList.contains("summary")) state.items[i].summary = e.target.value;
  if (e.target.classList.contains("qty")) state.items[i].quantity = parseFloat(e.target.value) || 0;
  if (e.target.classList.contains("unit")) state.items[i].unit = e.target.value;
  if (e.target.classList.contains("unitPrice")) state.items[i].unitPrice = parseFloat(e.target.value) || 0;
  if (e.target.classList.contains("discPercent")) state.items[i].discountPercent = e.target.value === "" ? undefined : parseFloat(e.target.value);
  if (e.target.classList.contains("vatRate")) state.items[i].vatRate = e.target.value === "" ? undefined : parseFloat(e.target.value);
  if (e.target.classList.contains("description")) state.items[i].description = e.target.value;
  save();
  renderPreview();
});

el("items-container").addEventListener("click", (e) => {
  const btn = e.target.closest(".del-item");
  if (!btn) return;
  state.items.splice(parseInt(btn.dataset.i, 10), 1);
  if (!state.items.length) state.items.push(newItem());
  save();
  render();
});

el("add-item").addEventListener("click", () => {
  state.items.push(newItem());
  save();
  render();
});

el("note").addEventListener("input", (e) => { state.note = e.target.value; save(); renderPreview(); });

el("signature").addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const r = new FileReader();
  r.onload = () => { state.signature = r.result; save(); renderPreview(); };
  r.readAsDataURL(file);
});

el("clear-sig").addEventListener("click", () => { state.signature = ""; el("signature").value = ""; save(); renderPreview(); });

el("print-btn").addEventListener("click", () => { window.print(); });

el("export-xml-btn").addEventListener("click", downloadXML);

el("import-xml-input").addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const r = new FileReader();
  r.onload = () => {
    try {
      importXML(r.result);
    } catch (err) {
      alert("Could not import XML: " + err.message);
    }
    e.target.value = "";
  };
  r.readAsText(file);
});

el("save-template-btn").addEventListener("click", () => {
  const name = prompt("Template name:");
  if (!name) return;
  if (templates[name] && !confirm(`Overwrite existing template "${name}"?`)) return;
  saveAsTemplate(name);
  renderTemplateOptions();
  el("template-select").value = name;
});

el("template-select").addEventListener("change", (e) => {
  if (!e.target.value) return;
  loadTemplate(e.target.value);
});

el("delete-template-btn").addEventListener("click", () => {
  const name = el("template-select").value;
  if (!name) return;
  if (!confirm(`Delete template "${name}"?`)) return;
  deleteTemplate(name);
  renderTemplateOptions();
});

render();
