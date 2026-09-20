const KEY = 'financial-planner';

const defaultState = () => ({ savingsBalance: 0, recurring: [], months: {} });

let state = JSON.parse(localStorage.getItem(KEY) || 'null') || defaultState();
if (!state.months) state.months = {};
if (!state.recurring) state.recurring = [];
if (typeof state.savingsBalance !== 'number') state.savingsBalance = 0;

let viewingKey = thisMonthKey();

function save() { localStorage.setItem(KEY, JSON.stringify(state)); }
function esc(t) { const d = document.createElement('div'); d.textContent = t ?? ''; return d.innerHTML; }
function genId() { return crypto.randomUUID(); }
function money(n) { return (Math.round(n * 100) / 100).toFixed(2); }
function thisMonthKey() { return new Date().toISOString().slice(0, 7); }
function monthLabel(key) {
  const [y, m] = key.split('-').map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
}
function shiftKey(key, delta) {
  const [y, m] = key.split('-').map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function sortedMonthKeys() { return Object.keys(state.months).sort(); }

// Only settled (done) items affect the rolling balance.
function computeEndBalance(key) {
  const m = state.months[key];
  if (!m) return null;
  const start = computeStartBalance(key);
  const delta = m.items.reduce((s, it) => {
    if (it.status !== 'done') return s;
    return s + (it.type === 'income' ? it.amount : -it.amount);
  }, 0);
  return start + delta;
}

// Recompute-on-read: derive from the previous month's live end balance,
// unless the user has explicitly overridden this month's start balance.
function computeStartBalance(key) {
  const m = state.months[key];
  if (m && m.startBalanceOverride !== null && m.startBalanceOverride !== undefined) {
    return m.startBalanceOverride;
  }
  const keys = sortedMonthKeys().filter(k => k < key);
  if (keys.length === 0) return m?.startBalance ?? 0;
  const prevKey = keys[keys.length - 1];
  return computeEndBalance(prevKey);
}

function projectedEndBalance(key) {
  const m = state.months[key];
  if (!m) return null;
  const start = computeStartBalance(key);
  const delta = m.items.reduce((s, it) => s + (it.type === 'income' ? it.amount : -it.amount), 0);
  return start + delta;
}

// Only auto-creates months moving forward past the latest existing one.
function getOrCreateMonth(key) {
  if (state.months[key]) return state.months[key];
  const keys = sortedMonthKeys();
  const latest = keys[keys.length - 1];
  if (latest && key <= latest) return null; // empty gap in the past — don't fabricate
  const items = state.recurring.filter(r => r.active).map(r => ({
    id: genId(), type: r.type, name: r.name, amount: r.amount,
    status: 'planned', fundedBySavings: false, recurringId: r.id,
  }));
  const startBalance = latest ? computeEndBalance(latest) : 0;
  state.months[key] = { startBalance, startBalanceOverride: null, startSavings: state.savingsBalance, items };
  save();
  return state.months[key];
}

function toggleStatus(key, id) {
  const m = state.months[key];
  const it = m.items.find(i => i.id === id);
  if (!it) return;
  it.status = it.status === 'done' ? 'planned' : 'done';
  if (it.status !== 'done' && it.fundedBySavings) {
    // undoing a done+fundedBySavings item must re-credit savings
    state.savingsBalance += it.amount;
    it.fundedBySavings = false;
  }
  save(); render();
}

function toggleFundedBySavings(key, id) {
  const m = state.months[key];
  const it = m.items.find(i => i.id === id);
  if (!it || it.type !== 'payment' || it.status !== 'done') return;
  if (it.fundedBySavings) {
    state.savingsBalance += it.amount;
    it.fundedBySavings = false;
  } else {
    state.savingsBalance -= it.amount;
    it.fundedBySavings = true;
  }
  save(); render();
}

function addItem(type, name, amount, makeRecurring) {
  const m = getOrCreateMonth(viewingKey);
  if (!m) return;
  let recurringId = null;
  if (makeRecurring) {
    const r = { id: genId(), type, name, amount, dayOfMonth: null, active: true };
    state.recurring.push(r);
    recurringId = r.id;
  }
  m.items.push({ id: genId(), type, name, amount, status: 'planned', fundedBySavings: false, recurringId });
  save(); render();
}

function deleteItem(key, id) {
  const m = state.months[key];
  const it = m.items.find(i => i.id === id);
  if (it && it.fundedBySavings && it.status === 'done') state.savingsBalance += it.amount;
  m.items = m.items.filter(i => i.id !== id);
  save(); render();
}

function addRecurring(type, name, amount) {
  state.recurring.push({ id: genId(), type, name, amount, dayOfMonth: null, active: true });
  save(); render();
}

function toggleRecurringActive(id) {
  const r = state.recurring.find(r => r.id === id);
  if (r) r.active = !r.active;
  save(); render();
}

function deleteRecurring(id) {
  state.recurring = state.recurring.filter(r => r.id !== id);
  save(); render();
}

// ---- Sankey money-flow diagram ----

function computeSankeyLayout(items) {
  const W = 700, H = 320, MARGIN = 60, GAP = 6, MIN_H = 6;
  const plotH = H - MARGIN;
  const incomes = items.filter(i => i.type === 'income');
  const payments = items.filter(i => i.type === 'payment');
  const savingsTotal = payments.filter(p => p.fundedBySavings).reduce((s, p) => s + p.amount, 0);

  const left = incomes.map(i => ({ label: i.name, amount: i.amount, kind: 'income' }));
  if (savingsTotal > 0) left.push({ label: 'Savings', amount: savingsTotal, kind: 'savings' });
  const right = payments.map(p => ({ label: p.name, amount: p.amount, kind: 'payment' }));

  const totalIn = left.reduce((s, n) => s + n.amount, 0);
  const totalOut = right.reduce((s, n) => s + n.amount, 0);
  const centerTotal = Math.max(totalIn, totalOut, 0.01);
  const scale = plotH / centerTotal;

  function layoutColumn(nodes) {
    if (nodes.length === 0) return { nodes: [], used: 0 };
    let raw = nodes.map(n => Math.max(n.amount * scale, MIN_H));
    const sum = raw.reduce((a, b) => a + b, 0) + GAP * (nodes.length - 1);
    if (sum > plotH) {
      const atFloor = raw.map(h => h <= MIN_H + 0.01);
      const floorSum = raw.reduce((s, h, i) => s + (atFloor[i] ? h : 0), 0);
      const flexSum = raw.reduce((s, h, i) => s + (atFloor[i] ? 0 : h), 0);
      const budget = Math.max(plotH - GAP * (nodes.length - 1) - floorSum, 0);
      raw = raw.map((h, i) => atFloor[i] ? h : (flexSum > 0 ? h * (budget / flexSum) : h));
    }
    let y = 0;
    const laid = nodes.map((n, i) => {
      const h = raw[i];
      const out = { ...n, y0: y, y1: y + h };
      y += h + GAP;
      return out;
    });
    const used = y - GAP;
    const offset = Math.max((plotH - used) / 2, 0);
    laid.forEach(n => { n.y0 += offset; n.y1 += offset; });
    return { nodes: laid, used };
  }

  const leftLaid = layoutColumn(left).nodes;
  const rightLaid = layoutColumn(right).nodes;
  const centerH = Math.max(centerTotal * scale, MIN_H);
  const centerOffset = Math.max((plotH - centerH) / 2, 0);
  const centerY0 = centerOffset, centerY1 = centerOffset + centerH;

  // Slice the center node's faces to match each column, in order.
  let cy = centerY0;
  const leftFlows = leftLaid.map(n => {
    const h = (n.y1 - n.y0);
    const f = { ...n, cy0: cy, cy1: cy + h };
    cy += h;
    return f;
  });
  const leftShortfall = totalIn < totalOut ? { amount: totalOut - totalIn, cy0: cy, cy1: centerY1 } : null;

  cy = centerY0;
  const rightFlows = rightLaid.map(n => {
    const h = (n.y1 - n.y0);
    const f = { ...n, cy0: cy, cy1: cy + h };
    cy += h;
    return f;
  });
  const rightSurplus = totalOut < totalIn ? { amount: totalIn - totalOut, cy0: cy, cy1: centerY1 } : null;

  return { W, H, MARGIN, plotH, leftFlows, rightFlows, leftShortfall, rightSurplus, centerY0, centerY1, hasAny: items.length > 0 };
}

const KIND_COLOR = { income: '#4CAF50', payment: '#FF9800', savings: '#9C27B0' };

function ribbon(x0, y0a, y0b, x1, y1a, y1b) {
  const xm = (x0 + x1) / 2;
  return `M ${x0} ${y0a} C ${xm} ${y0a}, ${xm} ${y1a}, ${x1} ${y1a} L ${x1} ${y1b} C ${xm} ${y1b}, ${xm} ${y0b}, ${x0} ${y0b} Z`;
}

function renderSankeySVG(layout) {
  const { W, H, MARGIN, leftFlows, rightFlows, leftShortfall, rightSurplus, centerY0, centerY1 } = layout;
  if (!layout.hasAny) return `<p class="w3-text-grey w3-small">Add incomes and payments to see the flow.</p>`;
  const leftX = 40, centerX0 = W / 2 - 30, centerX1 = W / 2 + 30, rightX = W - 40;

  const leftPaths = leftFlows.map(f => {
    const color = KIND_COLOR[f.kind];
    const path = ribbon(leftX, f.y0, f.y1, centerX0, f.cy0, f.cy1);
    const short = f.y1 - f.y0 < 14;
    const label = short ? '' : `<text x="${leftX - 6}" y="${(f.y0 + f.y1) / 2}" text-anchor="end" font-size="11" dy="-2">${esc(f.label)}</text><text x="${leftX - 6}" y="${(f.y0 + f.y1) / 2}" text-anchor="end" font-size="10" fill="#666" dy="10">${money(f.amount)}</text>`;
    return `<path d="${path}" fill="${color}" fill-opacity="0.5"><title>${esc(f.label)}: ${money(f.amount)}</title></path>${label}`;
  }).join('');

  const rightPaths = rightFlows.map(f => {
    const color = KIND_COLOR[f.kind];
    const path = ribbon(centerX1, f.cy0, f.cy1, rightX, f.y0, f.y1);
    const short = f.y1 - f.y0 < 14;
    const label = short ? '' : `<text x="${rightX + 6}" y="${(f.y0 + f.y1) / 2}" text-anchor="start" font-size="11" dy="-2">${esc(f.label)}</text><text x="${rightX + 6}" y="${(f.y0 + f.y1) / 2}" text-anchor="start" font-size="10" fill="#666" dy="10">${money(f.amount)}</text>`;
    return `<path d="${path}" fill="${color}" fill-opacity="0.5"><title>${esc(f.label)}: ${money(f.amount)}</title></path>${label}`;
  }).join('');

  const shortfall = leftShortfall ? `<rect x="${centerX0 - 4}" y="${leftShortfall.cy0}" width="4" height="${leftShortfall.cy1 - leftShortfall.cy0}" fill="#e57373"><title>Shortfall: ${money(leftShortfall.amount)}</title></rect>` : '';
  const surplus = rightSurplus ? `<rect x="${centerX1}" y="${rightSurplus.cy0}" width="4" height="${rightSurplus.cy1 - rightSurplus.cy0}" fill="#bdbdbd"><title>Unallocated: ${money(rightSurplus.amount)}</title></rect>` : '';
  const leftEmpty = leftFlows.length === 0 ? `<text x="${leftX}" y="${H / 2}" font-size="12" font-style="italic" fill="#999">No income yet</text>` : '';
  const rightEmpty = rightFlows.length === 0 ? `<text x="${rightX}" y="${H / 2}" text-anchor="end" font-size="12" font-style="italic" fill="#999">No payments yet</text>` : '';

  return `<svg viewBox="0 0 ${W} ${H}" style="width:100%;height:auto;max-height:340px;">
    <rect x="${centerX0}" y="${centerY0}" width="${centerX1 - centerX0}" height="${Math.max(centerY1 - centerY0, 1)}" fill="#555" />
    <text x="${(centerX0 + centerX1) / 2}" y="${Math.max(centerY0 - 8, 12)}" text-anchor="middle" font-size="11" font-weight="bold">Month Balance</text>
    ${leftPaths}${rightPaths}${shortfall}${surplus}${leftEmpty}${rightEmpty}
  </svg>`;
}

function renderSankey() {
  const m = state.months[viewingKey];
  const items = m ? m.items : [];
  document.getElementById('sankey-container').innerHTML = renderSankeySVG(computeSankeyLayout(items));
}

// ---- Rendering ----

function renderNav() {
  document.getElementById('month-label').textContent = monthLabel(viewingKey);
}

function renderStats() {
  const m = state.months[viewingKey];
  const current = m ? computeEndBalance(viewingKey) : null;
  const projected = m ? projectedEndBalance(viewingKey) : null;
  document.getElementById('stat-current').textContent = current === null ? '—' : money(current);
  document.getElementById('stat-projected').textContent = projected === null ? '—' : money(projected);
  document.getElementById('stat-savings').textContent = money(state.savingsBalance);
}

function renderItems() {
  const m = state.months[viewingKey];
  const list = document.getElementById('items-list');
  if (!m) {
    list.innerHTML = '<div class="w3-text-grey w3-small">No data for this month.</div>';
    return;
  }
  if (m.items.length === 0) {
    list.innerHTML = '<div class="w3-text-grey w3-small">No items yet — add one below.</div>';
    return;
  }
  list.innerHTML = m.items.map(it => `
    <div style="display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid #eee;">
      <input type="checkbox" class="status-cb" data-id="${it.id}" ${it.status === 'done' ? 'checked' : ''} title="Mark done" />
      <span class="w3-tag w3-small ${it.type === 'income' ? 'w3-green' : 'w3-orange'}" style="min-width:60px;text-align:center;">${it.type}</span>
      <span style="flex:1;">${esc(it.name)}${it.recurringId ? ' 🔁' : ''}</span>
      <span>${money(it.amount)}</span>
      ${it.type === 'payment' ? `<label class="w3-small" style="white-space:nowrap;"><input type="checkbox" class="funded-cb" data-id="${it.id}" ${it.fundedBySavings ? 'checked' : ''} ${it.status !== 'done' ? 'disabled' : ''} /> savings</label>` : '<span style="width:70px;"></span>'}
      <button class="w3-button w3-small w3-text-red del-item" data-id="${it.id}">×</button>
    </div>`).join('');
}

function renderRecurring() {
  const list = document.getElementById('recurring-list');
  if (state.recurring.length === 0) {
    list.innerHTML = '<div class="w3-text-grey w3-small">No recurring templates yet.</div>';
    return;
  }
  list.innerHTML = state.recurring.map(r => `
    <div style="display:flex;align-items:center;gap:8px;padding:4px 0;">
      <span class="w3-tag w3-small ${r.type === 'income' ? 'w3-green' : 'w3-orange'}">${r.type}</span>
      <span style="flex:1;">${esc(r.name)}</span>
      <span>${money(r.amount)}</span>
      <label class="w3-small"><input type="checkbox" class="active-cb" data-id="${r.id}" ${r.active ? 'checked' : ''} /> active</label>
      <button class="w3-button w3-small w3-text-red del-recurring" data-id="${r.id}">×</button>
    </div>`).join('');
}

function render() {
  renderNav();
  renderStats();
  renderItems();
  renderRecurring();
  renderSankey();
}

// ---- Event listeners ----

document.getElementById('prev-month').addEventListener('click', () => { viewingKey = shiftKey(viewingKey, -1); render(); });
document.getElementById('next-month').addEventListener('click', () => { getOrCreateMonth(shiftKey(viewingKey, 1)); viewingKey = shiftKey(viewingKey, 1); render(); });
document.getElementById('today-btn').addEventListener('click', () => { viewingKey = thisMonthKey(); getOrCreateMonth(viewingKey); render(); });

document.getElementById('add-item-btn').addEventListener('click', () => {
  const type = document.getElementById('item-type').value;
  const name = document.getElementById('item-name').value.trim();
  const amount = parseFloat(document.getElementById('item-amount').value);
  const makeRecurring = document.getElementById('item-recurring').checked;
  if (!name || isNaN(amount) || amount <= 0) return;
  addItem(type, name, amount, makeRecurring);
  document.getElementById('item-name').value = '';
  document.getElementById('item-amount').value = '';
  document.getElementById('item-recurring').checked = false;
  document.getElementById('item-name').focus();
});

document.getElementById('items-list').addEventListener('click', e => {
  if (e.target.classList.contains('del-item')) deleteItem(viewingKey, e.target.dataset.id);
});
document.getElementById('items-list').addEventListener('change', e => {
  if (e.target.classList.contains('status-cb')) toggleStatus(viewingKey, e.target.dataset.id);
  if (e.target.classList.contains('funded-cb')) toggleFundedBySavings(viewingKey, e.target.dataset.id);
});

document.getElementById('add-recurring-btn').addEventListener('click', () => {
  const type = document.getElementById('recurring-type').value;
  const name = document.getElementById('recurring-name').value.trim();
  const amount = parseFloat(document.getElementById('recurring-amount').value);
  if (!name || isNaN(amount) || amount <= 0) return;
  addRecurring(type, name, amount);
  document.getElementById('recurring-name').value = '';
  document.getElementById('recurring-amount').value = '';
});

document.getElementById('recurring-list').addEventListener('click', e => {
  if (e.target.classList.contains('del-recurring')) deleteRecurring(e.target.dataset.id);
});
document.getElementById('recurring-list').addEventListener('change', e => {
  if (e.target.classList.contains('active-cb')) toggleRecurringActive(e.target.dataset.id);
});

document.getElementById('adjust-savings-btn').addEventListener('click', () => {
  const v = prompt('Set savings balance to:', state.savingsBalance);
  if (v === null) return;
  const n = parseFloat(v);
  if (isNaN(n)) return;
  state.savingsBalance = n;
  save(); render();
});

document.getElementById('adjust-balance-btn').addEventListener('click', () => {
  const m = getOrCreateMonth(viewingKey);
  if (!m) return;
  const v = prompt('Set this month\'s starting balance to:', computeStartBalance(viewingKey));
  if (v === null) return;
  const n = parseFloat(v);
  if (isNaN(n)) return;
  m.startBalanceOverride = n;
  save(); render();
});

function populateMonthYearSelect(monthId, yearId) {
  const monthSel = document.getElementById(monthId);
  const yearSel = document.getElementById(yearId);
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  monthSel.innerHTML = '<option value="">(none)</option>' +
    monthNames.map((n, i) => `<option value="${String(i + 1).padStart(2, '0')}">${n}</option>`).join('');
  const thisYear = new Date().getFullYear();
  const years = [];
  for (let y = thisYear - 10; y <= thisYear + 10; y++) years.push(y);
  yearSel.innerHTML = years.map(y => `<option value="${y}">${y}</option>`).join('');
  yearSel.value = String(thisYear);
}

function monthYearValue(monthId, yearId) {
  const m = document.getElementById(monthId).value;
  if (!m) return '';
  return `${document.getElementById(yearId).value}-${m}`;
}

populateMonthYearSelect('export-from-month', 'export-from-year');
populateMonthYearSelect('export-to-month', 'export-to-year');

document.getElementById('backup-toggle-btn').addEventListener('click', () => {
  const panel = document.getElementById('backup-panel');
  panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
});

document.getElementById('export-btn').addEventListener('click', () => {
  const from = monthYearValue('export-from-month', 'export-from-year');
  const to = monthYearValue('export-to-month', 'export-to-year');
  const months = {};
  Object.keys(state.months).forEach(key => {
    if (from && key < from) return;
    if (to && key > to) return;
    months[key] = state.months[key];
  });
  const exportState = { savingsBalance: state.savingsBalance, recurring: state.recurring, months };
  const data = JSON.stringify(exportState, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const suffix = from || to ? `${from || 'start'}_to_${to || 'end'}` : thisMonthKey();
  a.download = `financial-planner-export-${suffix}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
});

document.getElementById('import-input').addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    let imported;
    try {
      imported = JSON.parse(reader.result);
    } catch (err) {
      alert('That file is not valid JSON.');
      e.target.value = '';
      return;
    }
    if (!imported || typeof imported !== 'object' || !imported.months) {
      alert('That file doesn\'t look like a Financial Planner export.');
      e.target.value = '';
      return;
    }
    if (!confirm('Import will replace all current data. Continue?')) {
      e.target.value = '';
      return;
    }
    state = { ...defaultState(), ...imported };
    if (!state.months) state.months = {};
    if (!state.recurring) state.recurring = [];
    if (typeof state.savingsBalance !== 'number') state.savingsBalance = 0;
    viewingKey = thisMonthKey();
    save();
    getOrCreateMonth(viewingKey);
    render();
    e.target.value = '';
  };
  reader.readAsText(file);
});

getOrCreateMonth(viewingKey);
render();
