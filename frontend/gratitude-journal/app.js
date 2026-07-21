const KEY = 'gratitude-journal';

let data = JSON.parse(localStorage.getItem(KEY) || '{}');

const save = () => localStorage.setItem(KEY, JSON.stringify(data));

const todayStr = () => new Date().toISOString().slice(0, 10);

function dateLabel(d) {
  return new Date(d + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
}

function renderDots() {
  const grid = document.getElementById('dot-grid');
  const today = todayStr();
  const days = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    days.push(d.toISOString().slice(0, 10));
  }
  grid.innerHTML = days.map(d => {
    const filled = data[d] && data[d].some(s => s.trim());
    const cls = [filled ? 'filled' : '', d === today ? 'today' : ''].filter(Boolean).join(' ');
    const tip = dateLabel(d);
    return `<div class="dot ${cls}" title="${tip}"></div>`;
  }).join('');
}

function renderHistory() {
  const today = todayStr();
  const list = document.getElementById('history-list');
  const past = Object.entries(data)
    .filter(([d, items]) => d !== today && items.some(s => s.trim()))
    .sort(([a], [b]) => b.localeCompare(a))
    .slice(0, 14);
  if (!past.length) { list.innerHTML = ''; return; }
  list.innerHTML = past.map(([d, items]) => `
    <div class="past-entry">
      <div class="past-date">${dateLabel(d)}</div>
      ${items.map((s, i) => s.trim() ? `<div class="past-item"><span class="past-num">${i+1}</span>${s}</div>` : '').join('')}
    </div>`).join('');
}

function loadToday() {
  const today = todayStr();
  const items = data[today] || ['', '', ''];
  document.getElementById('g1').value = items[0] || '';
  document.getElementById('g2').value = items[1] || '';
  document.getElementById('g3').value = items[2] || '';
}

function saveToday() {
  const today = todayStr();
  data[today] = [
    document.getElementById('g1').value,
    document.getElementById('g2').value,
    document.getElementById('g3').value,
  ];
  save();
  renderDots();
  renderHistory();
}

document.getElementById('today-date-label').textContent = dateLabel(todayStr());

['g1', 'g2', 'g3'].forEach(id => {
  document.getElementById(id).addEventListener('input', saveToday);
});

loadToday();
renderDots();
renderHistory();
document.getElementById('g1').focus();
