const KEY = 'workout-log';

let entries = JSON.parse(localStorage.getItem(KEY) || '[]');

const save = () => localStorage.setItem(KEY, JSON.stringify(entries));
const todayStr = () => new Date().toISOString().slice(0, 10);
const esc = (t) => { const d = document.createElement('div'); d.textContent = t ?? ''; return d.innerHTML; };

function fmtDate(d) {
  const dt = new Date(d + 'T00:00:00');
  const today = todayStr();
  const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
  const yStr = yesterday.toISOString().slice(0, 10);
  if (d === today) return 'Today';
  if (d === yStr) return 'Yesterday';
  return dt.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
}

function render() {
  const list = document.getElementById('workout-list');
  if (!entries.length) {
    list.innerHTML = '<div class="empty">No workouts yet. Log your first set below.</div>';
    return;
  }
  const byDate = {};
  for (const e of entries) {
    if (!byDate[e.date]) byDate[e.date] = [];
    byDate[e.date].push(e);
  }
  const dates = Object.keys(byDate).sort((a, b) => b.localeCompare(a));
  list.innerHTML = dates.map(d => {
    const exs = byDate[d];
    const rows = exs.map(e => {
      const weight = e.weight ? ` @ ${e.weight} kg` : '';
      return `<div class="exercise-row">
        <span class="exercise-name">${esc(e.exercise)}</span>
        <span class="exercise-sets">${e.sets}×${e.reps}${weight}</span>
        <button class="del-entry" data-id="${e.id}" aria-label="Delete">×</button>
      </div>`;
    }).join('');
    return `<div class="day-block"><div class="day-heading">${fmtDate(d)}</div>${rows}</div>`;
  }).join('');
}

document.getElementById('workout-list').addEventListener('click', ev => {
  const btn = ev.target.closest('.del-entry');
  if (!btn) return;
  entries = entries.filter(e => e.id !== btn.dataset.id);
  save(); render();
});

document.getElementById('w-date').value = todayStr();

document.getElementById('add-btn').addEventListener('click', () => {
  const exercise = document.getElementById('w-exercise').value.trim();
  const sets = parseInt(document.getElementById('w-sets').value, 10);
  const reps = parseInt(document.getElementById('w-reps').value, 10);
  const weight = parseFloat(document.getElementById('w-weight').value) || 0;
  const date = document.getElementById('w-date').value || todayStr();
  if (!exercise || !sets || !reps) return;
  entries.push({ id: crypto.randomUUID(), date, exercise, sets, reps, weight });
  save(); render();
  document.getElementById('w-exercise').value = '';
  document.getElementById('w-sets').value = '';
  document.getElementById('w-reps').value = '';
  document.getElementById('w-weight').value = '';
  document.getElementById('w-exercise').focus();
});

document.getElementById('w-exercise').addEventListener('keydown', ev => {
  if (ev.key === 'Enter') document.getElementById('add-btn').click();
});

render();
