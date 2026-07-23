const KEY = 'car-maintenance';

let tasks = JSON.parse(localStorage.getItem(KEY) || '[]');

const save = () => localStorage.setItem(KEY, JSON.stringify(tasks));
const todayStr = () => new Date().toISOString().slice(0, 10);
const esc = (t) => { const d = document.createElement('div'); d.textContent = t ?? ''; return d.innerHTML; };

function addMonths(dateStr, months) {
  const d = new Date(dateStr + 'T00:00:00');
  d.setMonth(d.getMonth() + months);
  return d.toISOString().slice(0, 10);
}

function daysBetween(a, b) {
  return Math.round((new Date(b + 'T00:00:00') - new Date(a + 'T00:00:00')) / 86400000);
}

function classify(task) {
  const due = addMonths(task.lastService, task.intervalMonths);
  const today = todayStr();
  const days = daysBetween(today, due);
  const warningDays = Math.max(7, task.intervalMonths * 9);
  if (days < 0)  return { cls: 'overdue', label: `Overdue ${Math.abs(days)}d`, due };
  if (days <= warningDays) return { cls: 'soon', label: `Due in ${days}d`, due };
  return { cls: 'ok', label: `OK — ${days}d left`, due };
}

function fmtDate(d) {
  return new Date(d + 'T00:00:00').toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

function render() {
  const list = document.getElementById('tasks-list');
  if (!tasks.length) {
    list.innerHTML = '<div class="empty">No tasks yet. Add your first one below.</div>';
    return;
  }
  const sorted = [...tasks].sort((a, b) => {
    const da = addMonths(a.lastService, a.intervalMonths);
    const db = addMonths(b.lastService, b.intervalMonths);
    return da < db ? -1 : da > db ? 1 : 0;
  });
  list.innerHTML = sorted.map(t => {
    const { cls, label, due } = classify(t);
    return `<div class="task-card">
      <div class="task-top">
        <span class="task-name">${esc(t.name)}</span>
        <span class="status-badge ${cls}">${label}</span>
        <button class="task-del" data-id="${t.id}" aria-label="Delete">×</button>
      </div>
      <div class="task-meta">Last: ${fmtDate(t.lastService)} · Due: ${fmtDate(due)} · every ${t.intervalMonths} month${t.intervalMonths !== 1 ? 's' : ''}</div>
      <button class="log-btn" data-id="${t.id}">✓ Log service today</button>
    </div>`;
  }).join('');
}

document.getElementById('tasks-list').addEventListener('click', ev => {
  const logBtn = ev.target.closest('.log-btn');
  if (logBtn) {
    const id = logBtn.dataset.id;
    const t = tasks.find(x => x.id === id);
    if (t) { t.lastService = todayStr(); save(); render(); }
  }
  const delBtn = ev.target.closest('.task-del');
  if (delBtn) {
    tasks = tasks.filter(x => x.id !== delBtn.dataset.id);
    save(); render();
  }
});

document.getElementById('last-done').valueAsDate = new Date();

document.getElementById('add-btn').addEventListener('click', () => {
  const name = document.getElementById('new-name').value.trim();
  const lastService = document.getElementById('last-done').value;
  const intervalMonths = parseInt(document.getElementById('interval-select').value, 10);
  if (!name || !lastService) return;
  tasks.push({ id: crypto.randomUUID(), name, lastService, intervalMonths });
  save(); render();
  document.getElementById('new-name').value = '';
  document.getElementById('new-name').focus();
});

document.getElementById('new-name').addEventListener('keydown', ev => {
  if (ev.key === 'Enter') document.getElementById('add-btn').click();
});

render();
