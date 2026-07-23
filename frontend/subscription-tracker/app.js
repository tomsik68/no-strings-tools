const KEY = 'subscription-tracker';

let subs = JSON.parse(localStorage.getItem(KEY) || '[]');

const save = () => localStorage.setItem(KEY, JSON.stringify(subs));
const todayStr = () => new Date().toISOString().slice(0, 10);
const esc = (t) => { const d = document.createElement('div'); d.textContent = t ?? ''; return d.innerHTML; };

function addPeriod(dateStr, cycle) {
  const d = new Date(dateStr + 'T00:00:00');
  if (cycle === 'monthly')   d.setMonth(d.getMonth() + 1);
  if (cycle === 'quarterly') d.setMonth(d.getMonth() + 3);
  if (cycle === 'yearly')    d.setFullYear(d.getFullYear() + 1);
  return d.toISOString().slice(0, 10);
}

function monthlyEquiv(cost, cycle) {
  if (cycle === 'monthly')   return cost;
  if (cycle === 'quarterly') return cost / 3;
  if (cycle === 'yearly')    return cost / 12;
  return cost;
}

function daysBetween(a, b) {
  return Math.round((new Date(b + 'T00:00:00') - new Date(a + 'T00:00:00')) / 86400000);
}

function classify(sub) {
  const today = todayStr();
  const days = daysBetween(today, sub.nextRenewal);
  if (days < 0)  return { cls: 'overdue', label: `Overdue ${Math.abs(days)}d` };
  if (days <= 7) return { cls: 'soon', label: `Renews in ${days}d` };
  return { cls: 'ok', label: `${days}d left` };
}

function fmtDate(d) {
  return new Date(d + 'T00:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

const CYCLE_LABELS = { monthly: 'monthly', quarterly: 'quarterly', yearly: 'yearly' };

function render() {
  const monthly = subs.reduce((s, sub) => s + monthlyEquiv(sub.cost, sub.cycle), 0);
  document.getElementById('summary').innerHTML = subs.length ? `
    <div class="summary-box">
      <div>
        <div class="summary-total">€${monthly.toFixed(2)}</div>
        <div class="summary-label">Per month</div>
      </div>
      <div class="summary-count">${subs.length} subscription${subs.length !== 1 ? 's' : ''}</div>
    </div>` : '';

  const list = document.getElementById('sub-list');
  if (!subs.length) {
    list.innerHTML = '<div class="empty">No subscriptions yet. Add one below.</div>';
    return;
  }
  const sorted = [...subs].sort((a, b) => a.nextRenewal.localeCompare(b.nextRenewal));
  list.innerHTML = sorted.map(s => {
    const { cls, label } = classify(s);
    const meq = monthlyEquiv(s.cost, s.cycle);
    const costStr = `€${s.cost.toFixed(2)} / ${CYCLE_LABELS[s.cycle]}`;
    const meqStr = s.cycle !== 'monthly' ? ` (€${meq.toFixed(2)}/mo)` : '';
    return `<div class="sub-card">
      <div class="sub-info">
        <div class="sub-name">${esc(s.name)}</div>
        <div class="sub-meta">${costStr}${meqStr} · renews ${fmtDate(s.nextRenewal)}</div>
      </div>
      <div class="sub-right">
        <span class="status-badge ${cls}">${label}</span>
        <button class="renew-btn" data-id="${s.id}">↻ Renew</button>
      </div>
      <button class="del-btn" data-id="${s.id}" aria-label="Delete">×</button>
    </div>`;
  }).join('');
}

document.getElementById('sub-list').addEventListener('click', ev => {
  const renew = ev.target.closest('.renew-btn');
  if (renew) {
    const s = subs.find(x => x.id === renew.dataset.id);
    if (s) { s.nextRenewal = addPeriod(s.nextRenewal, s.cycle); save(); render(); }
    return;
  }
  const del = ev.target.closest('.del-btn');
  if (del) {
    subs = subs.filter(x => x.id !== del.dataset.id);
    save(); render();
  }
});

const nextMonthStr = () => {
  const d = new Date(); d.setMonth(d.getMonth() + 1);
  return d.toISOString().slice(0, 10);
};

document.getElementById('sub-renewal').value = nextMonthStr();

document.getElementById('add-btn').addEventListener('click', () => {
  const name = document.getElementById('sub-name').value.trim();
  const cost = parseFloat(document.getElementById('sub-cost').value);
  const cycle = document.getElementById('sub-cycle').value;
  const nextRenewal = document.getElementById('sub-renewal').value;
  if (!name || !cost || !nextRenewal) return;
  subs.push({ id: crypto.randomUUID(), name, cost, cycle, nextRenewal });
  save(); render();
  document.getElementById('sub-name').value = '';
  document.getElementById('sub-cost').value = '';
  document.getElementById('sub-name').focus();
});

document.getElementById('sub-name').addEventListener('keydown', ev => {
  if (ev.key === 'Enter') document.getElementById('add-btn').click();
});

render();
