let plants = JSON.parse(localStorage.getItem('plant-watering')) || [];

function save() { localStorage.setItem('plant-watering', JSON.stringify(plants)); }
function genId() { return Math.random().toString(36).slice(2, 9); }
function escHtml(t) { const d = document.createElement('div'); d.textContent = t; return d.innerHTML; }
function todayStr() { return new Date().toISOString().slice(0, 10); }

function dueDate(p) {
  const d = new Date(p.lastWatered + 'T00:00:00');
  d.setDate(d.getDate() + p.intervalDays);
  return d.toISOString().slice(0, 10);
}

function daysBetween(from, to) {
  return Math.round((new Date(to + 'T00:00:00') - new Date(from + 'T00:00:00')) / 86400000);
}

function fmtDate(s) {
  return new Date(s + 'T00:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

const INTERVAL_LABELS = {
  1: 'every day', 2: 'every 2 days', 3: 'every 3 days', 5: 'every 5 days',
  7: 'weekly', 14: 'every 2 weeks', 21: 'every 3 weeks', 30: 'monthly',
};

function render() {
  const container = document.getElementById('plants-list');
  if (plants.length === 0) {
    container.innerHTML = '<div class="empty">No plants yet — add one below.</div>';
    return;
  }

  const today = todayStr();
  const sorted = plants.map(p => ({ ...p, due: dueDate(p), days: daysBetween(today, dueDate(p)) }))
    .sort((a, b) => a.days - b.days);

  container.innerHTML = sorted.map(p => {
    let cls, text;
    if (p.days < 0) { cls = 'overdue'; text = `${-p.days} day${-p.days !== 1 ? 's' : ''} overdue`; }
    else if (p.days === 0) { cls = 'soon'; text = 'Water today'; }
    else if (p.days <= 3) { cls = 'soon'; text = `in ${p.days} day${p.days !== 1 ? 's' : ''}`; }
    else { cls = 'ok'; text = `in ${p.days} days`; }

    const interval = INTERVAL_LABELS[p.intervalDays] || `every ${p.intervalDays} days`;
    return `<div class="plant-card">
      <div class="plant-top">
        <span class="plant-icon">🪴</span>
        <div class="plant-name">${escHtml(p.name)}</div>
        <span class="status-badge ${cls}">${text}</span>
        <button class="plant-del" data-id="${p.id}" title="Remove">×</button>
      </div>
      <div class="plant-meta">Last watered: ${fmtDate(p.lastWatered)} · ${interval}</div>
      <button class="water-btn" data-id="${p.id}">💧 Watered today</button>
    </div>`;
  }).join('');
}

document.getElementById('plants-list').addEventListener('click', e => {
  const waterBtn = e.target.closest('.water-btn');
  if (waterBtn) {
    const p = plants.find(p => p.id === waterBtn.dataset.id);
    if (p) { p.lastWatered = todayStr(); save(); render(); }
    return;
  }
  const delBtn = e.target.closest('.plant-del');
  if (delBtn) {
    plants = plants.filter(p => p.id !== delBtn.dataset.id);
    save(); render();
  }
});

function addPlant() {
  const name = document.getElementById('new-name').value.trim();
  const lastWatered = document.getElementById('last-watered').value;
  const intervalDays = parseInt(document.getElementById('interval-select').value, 10);
  if (!name || !lastWatered) return;
  plants.push({ id: genId(), name, lastWatered, intervalDays });
  document.getElementById('new-name').value = '';
  document.getElementById('last-watered').value = '';
  save(); render();
  document.getElementById('new-name').focus();
}

document.getElementById('add-btn').addEventListener('click', addPlant);
document.getElementById('new-name').addEventListener('keydown', e => { if (e.key === 'Enter') document.getElementById('last-watered').focus(); });
document.getElementById('last-watered').addEventListener('keydown', e => { if (e.key === 'Enter') addPlant(); });

document.getElementById('new-name').focus();
render();
