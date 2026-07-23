const KEY = 'headache-log';

let entries = JSON.parse(localStorage.getItem(KEY) || '[]');
let severity = 0;

const save = () => localStorage.setItem(KEY, JSON.stringify(entries));
const todayStr = () => new Date().toISOString().slice(0, 10);
const esc = (t) => { const d = document.createElement('div'); d.textContent = t ?? ''; return d.innerHTML; };

const SEV_LABELS = ['', 'Mild', 'Moderate', 'Bad', 'Severe', 'Extreme'];

function perMonth(n) {
  if (!entries.length) return '—';
  const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date));
  const first = new Date(sorted[0].date + 'T00:00:00');
  const months = Math.max(1, (Date.now() - first.getTime()) / (1000 * 60 * 60 * 24 * 30));
  return (entries.length / months).toFixed(1);
}

function avgSev() {
  if (!entries.length) return '—';
  const avg = entries.reduce((s, e) => s + e.severity, 0) / entries.length;
  return avg.toFixed(1);
}

function fmtDate(d) {
  return new Date(d + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
}

function renderStats() {
  document.getElementById('stats').innerHTML = `<div class="stats-row">
    <div class="stat"><div class="stat-val">${entries.length}</div><div class="stat-lbl">Total</div></div>
    <div class="stat"><div class="stat-val">${perMonth()}</div><div class="stat-lbl">Per month</div></div>
    <div class="stat"><div class="stat-val">${avgSev()}</div><div class="stat-lbl">Avg severity</div></div>
  </div>`;
}

function render() {
  renderStats();
  const list = document.getElementById('headache-list');
  if (!entries.length) {
    list.innerHTML = '<div class="empty">No headaches logged.</div>';
    return;
  }
  const sorted = [...entries].sort((a, b) => b.date.localeCompare(a.date) || b.time.localeCompare(a.time));
  list.innerHTML = sorted.map(e => {
    const details = [
      e.duration ? `${e.duration}h` : null,
      e.location ? esc(e.location) : null,
    ].filter(Boolean).join(' · ');
    return `<div class="headache-row">
      <span class="h-severity sev-${e.severity}">${e.severity} — ${SEV_LABELS[e.severity]}</span>
      <div class="h-info">
        <div class="h-date">${fmtDate(e.date)}${e.time ? ' at ' + esc(e.time) : ''}</div>
        ${details ? `<div class="h-details">${details}</div>` : ''}
        ${e.notes ? `<div class="h-notes">${esc(e.notes)}</div>` : ''}
      </div>
      <button class="del-btn" data-id="${e.id}" aria-label="Delete">×</button>
    </div>`;
  }).join('');
}

document.querySelectorAll('.sev-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    severity = parseInt(btn.dataset.sev, 10);
    document.querySelectorAll('.sev-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  });
});

document.getElementById('headache-list').addEventListener('click', ev => {
  const btn = ev.target.closest('.del-btn');
  if (!btn) return;
  entries = entries.filter(e => e.id !== btn.dataset.id);
  save(); render();
});

document.getElementById('h-date').value = todayStr();

document.getElementById('add-btn').addEventListener('click', () => {
  if (!severity) { alert('Please select a severity level.'); return; }
  const date = document.getElementById('h-date').value || todayStr();
  const time = new Date().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  const duration = parseFloat(document.getElementById('h-duration').value) || 0;
  const location = document.getElementById('h-location').value;
  const notes = document.getElementById('h-notes').value.trim();
  entries.push({ id: crypto.randomUUID(), date, time, severity, duration, location, notes });
  save(); render();
  document.getElementById('h-duration').value = '';
  document.getElementById('h-location').value = '';
  document.getElementById('h-notes').value = '';
  document.querySelectorAll('.sev-btn').forEach(b => b.classList.remove('active'));
  severity = 0;
});

render();
