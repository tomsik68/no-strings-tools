const COLORS = ['#2196f3', '#4caf50', '#ff9800', '#e91e63', '#9c27b0', '#00bcd4', '#ff5722'];
const HISTORY_DAYS = 21;

let habits = JSON.parse(localStorage.getItem('habit-tracker')) || [];

function save() { localStorage.setItem('habit-tracker', JSON.stringify(habits)); }

function genId() { return Math.random().toString(36).slice(2, 9); }

function dateStr(d) { return d.toISOString().slice(0, 10); }

function todayStr() { return dateStr(new Date()); }

function streak(habit) {
  const today = todayStr();
  const d = new Date();
  if (!habit.completions.includes(today)) d.setDate(d.getDate() - 1);
  let s = 0;
  while (habit.completions.includes(dateStr(d))) {
    s++;
    d.setDate(d.getDate() - 1);
  }
  return s;
}

function historyDots(habit) {
  return Array.from({ length: HISTORY_DAYS }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (HISTORY_DAYS - 1 - i));
    return { key: dateStr(d), isToday: i === HISTORY_DAYS - 1 };
  });
}

function escHtml(t) { const d = document.createElement('div'); d.textContent = t; return d.innerHTML; }

function render() {
  const today = todayStr();
  const now = new Date();
  document.getElementById('date-label').textContent = now.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const container = document.getElementById('habits-list');

  if (habits.length === 0) {
    container.innerHTML = '<div class="empty">No habits yet — add one below to get started.</div>';
    return;
  }

  container.innerHTML = habits.map(habit => {
    const done = habit.completions.includes(today);
    const s = streak(habit);
    const streakHtml = s > 0
      ? `<span class="streak on">🔥 ${s}</span>`
      : `<span class="streak off">–</span>`;

    const dots = historyDots(habit).map(({ key, isToday }) => {
      const completed = habit.completions.includes(key);
      const cls = [completed ? 'done' : 'miss', isToday ? 'today' : ''].filter(Boolean).join(' ');
      const bg = completed ? `background:${habit.color}` : '';
      return `<div class="dot ${cls}" style="${bg}" title="${key}"></div>`;
    }).join('');

    return `
      <div class="habit-card" data-id="${habit.id}">
        <div class="habit-top">
          <input type="checkbox" class="habit-checkbox" data-id="${habit.id}" ${done ? 'checked' : ''} style="accent-color:${habit.color}" />
          <span class="habit-name${done ? ' done' : ''}">${escHtml(habit.name)}</span>
          ${streakHtml}
          <button class="habit-del" data-id="${habit.id}" title="Delete habit">×</button>
        </div>
        <div class="dots">${dots}</div>
      </div>`;
  }).join('');
}

// Toggle today
document.getElementById('habits-list').addEventListener('change', e => {
  if (!e.target.classList.contains('habit-checkbox')) return;
  const habit = habits.find(h => h.id === e.target.dataset.id);
  if (!habit) return;
  const today = todayStr();
  if (e.target.checked) {
    if (!habit.completions.includes(today)) habit.completions.push(today);
  } else {
    habit.completions = habit.completions.filter(d => d !== today);
  }
  save(); render();
});

// Delete habit
document.getElementById('habits-list').addEventListener('click', e => {
  if (!e.target.classList.contains('habit-del')) return;
  const habit = habits.find(h => h.id === e.target.dataset.id);
  if (!habit) return;
  if (!confirm(`Delete "${habit.name}" and all its history?`)) return;
  habits = habits.filter(h => h.id !== e.target.dataset.id);
  save(); render();
});

// Add habit
function addHabit() {
  const input = document.getElementById('new-habit');
  const name = input.value.trim();
  if (!name) return;
  const color = COLORS[habits.length % COLORS.length];
  habits.push({ id: genId(), name, color, completions: [] });
  input.value = '';
  save(); render();
  input.focus();
}
document.getElementById('add-btn').addEventListener('click', addHabit);
document.getElementById('new-habit').addEventListener('keydown', e => { if (e.key === 'Enter') addHabit(); });

document.getElementById('new-habit').focus();
render();
