let people = JSON.parse(localStorage.getItem('birthday-tracker')) || [];

function save() { localStorage.setItem('birthday-tracker', JSON.stringify(people)); }
function genId() { return Math.random().toString(36).slice(2, 9); }
function escHtml(t) { const d = document.createElement('div'); d.textContent = t; return d.innerHTML; }

function daysUntil(bday) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const [, month, day] = bday.split('-').map(Number);
  const next = new Date(today.getFullYear(), month - 1, day);
  if (next < today) next.setFullYear(today.getFullYear() + 1);
  return Math.round((next - today) / 86400000);
}

function turningAge(bday) {
  const [year] = bday.split('-').map(Number);
  const now = new Date();
  if (year < 1900 || year >= now.getFullYear()) return null;
  const [, month, day] = bday.split('-').map(Number);
  const hadBirthdayThisYear = new Date(now.getFullYear(), month - 1, day) <= now;
  return now.getFullYear() - year + (hadBirthdayThisYear ? 0 : -1) + 1;
}

function formatBday(bday) {
  const [, month, day] = bday.split('-').map(Number);
  return new Date(2000, month - 1, day).toLocaleDateString(undefined, { month: 'long', day: 'numeric' });
}

function countdownHtml(days) {
  if (days === 0) return '<span class="bday-countdown today">🎉 Today!</span>';
  if (days === 1) return '<span class="bday-countdown soon">Tomorrow!</span>';
  if (days <= 14) return `<span class="bday-countdown soon">in ${days} days</span>`;
  return `<span class="bday-countdown future">in ${days} days</span>`;
}

function render() {
  const list = document.getElementById('bday-list');
  if (people.length === 0) {
    list.innerHTML = '<div class="empty">No birthdays yet — add one below.</div>';
    return;
  }

  const sorted = people.map(p => ({ ...p, days: daysUntil(p.bday) }))
    .sort((a, b) => a.days - b.days);

  list.innerHTML = sorted.map(p => {
    const age = turningAge(p.bday);
    const ageLine = age != null ? `<div class="age-badge">turning ${age}</div>` : '';
    return `
      <div class="bday-row">
        <div class="bday-info">
          <div class="bday-name">${escHtml(p.name)}</div>
          <div class="bday-date">${formatBday(p.bday)}</div>
          ${ageLine}
        </div>
        ${countdownHtml(p.days)}
        <button class="bday-del" data-id="${p.id}" title="Remove">×</button>
      </div>`;
  }).join('');
}

function addPerson() {
  const name = document.getElementById('bday-name').value.trim();
  const bday = document.getElementById('bday-date').value;
  if (!name || !bday) return;
  people.push({ id: genId(), name, bday });
  document.getElementById('bday-name').value = '';
  document.getElementById('bday-date').value = '';
  save(); render();
  document.getElementById('bday-name').focus();
}

document.getElementById('add-btn').addEventListener('click', addPerson);
document.getElementById('bday-name').addEventListener('keydown', e => { if (e.key === 'Enter') document.getElementById('bday-date').focus(); });
document.getElementById('bday-date').addEventListener('keydown', e => { if (e.key === 'Enter') addPerson(); });

document.getElementById('bday-list').addEventListener('click', e => {
  if (!e.target.classList.contains('bday-del')) return;
  people = people.filter(p => p.id !== e.target.dataset.id);
  save(); render();
});

document.getElementById('bday-name').focus();
render();
