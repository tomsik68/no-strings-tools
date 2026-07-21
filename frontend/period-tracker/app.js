let periods = JSON.parse(localStorage.getItem('period-tracker')) || [];

function save() { localStorage.setItem('period-tracker', JSON.stringify(periods)); }
function genId() { return Math.random().toString(36).slice(2, 9); }
function todayStr() { return new Date().toISOString().slice(0, 10); }
function daysBetween(from, to) {
  return Math.round((new Date(to + 'T00:00:00') - new Date(from + 'T00:00:00')) / 86400000);
}
function fmtDate(s) {
  return new Date(s + 'T00:00:00').toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' });
}
function fmtShort(s) {
  return new Date(s + 'T00:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

function sorted() {
  return [...periods].sort((a, b) => a.date.localeCompare(b.date));
}

function avgCycleLen() {
  const s = sorted();
  if (s.length < 2) return 28;
  const diffs = s.slice(1).map((p, i) => daysBetween(s[i].date, p.date));
  return Math.round(diffs.reduce((a, b) => a + b, 0) / diffs.length);
}

function render() {
  const today = todayStr();
  const s = sorted();
  const avgLen = avgCycleLen();

  // Status card
  const statusEl = document.getElementById('status-card');
  if (s.length === 0) {
    statusEl.innerHTML = '<div class="status-card"><div class="status-main">Log your first period to get started</div></div>';
  } else {
    const last = s[s.length - 1].date;
    const cycleDay = daysBetween(last, today) + 1;
    const nextDate = (() => {
      const d = new Date(last + 'T00:00:00');
      d.setDate(d.getDate() + avgLen);
      return d.toISOString().slice(0, 10);
    })();
    const daysToNext = daysBetween(today, nextDate);
    let mainText, subText, late = false;
    if (daysToNext > 0) {
      mainText = `Day ${cycleDay} of your cycle`;
      subText = `Next period expected ${fmtDate(nextDate)} (in ${daysToNext} day${daysToNext !== 1 ? 's' : ''})`;
    } else if (daysToNext === 0) {
      mainText = `Period expected today`;
      subText = `Day ${cycleDay} of your cycle`;
    } else {
      mainText = `${-daysToNext} day${-daysToNext !== 1 ? 's' : ''} late`;
      subText = `Expected ${fmtDate(nextDate)} · Day ${cycleDay}`;
      late = true;
    }
    statusEl.innerHTML = `<div class="status-card${late ? ' late' : ''}"><div class="status-main">${mainText}</div><div class="status-sub">${subText}</div></div>`;
  }

  // Stats
  const statsEl = document.getElementById('stats-row');
  if (s.length >= 2) {
    statsEl.innerHTML = `<div class="stats-row">
      <div class="stat"><div class="stat-val">${avgLen}</div><div class="stat-lbl">avg cycle (days)</div></div>
      <div class="stat"><div class="stat-val">${s.length}</div><div class="stat-lbl">periods logged</div></div>
    </div>`;
  } else {
    statsEl.innerHTML = '';
  }

  // History list
  const list = document.getElementById('period-list');
  if (s.length === 0) {
    list.innerHTML = '<div class="empty">No periods logged yet.</div>';
  } else {
    const rev = [...s].reverse();
    list.innerHTML = rev.map((p, i, arr) => {
      const next = arr[i + 1];
      const cycleLen = next ? `${daysBetween(p.date, next.date)}-day cycle` : '';
      return `<div class="period-row">
        <span class="period-date">${fmtShort(p.date)}</span>
        <span class="period-cycle">${cycleLen}</span>
        <button class="del-btn" data-id="${p.id}" title="Remove">×</button>
      </div>`;
    }).join('');
  }

  document.getElementById('period-date').value = today;
}

function logDate(dateStr) {
  if (!dateStr) return;
  if (periods.some(p => p.date === dateStr)) return;
  periods.push({ id: genId(), date: dateStr });
  save(); render();
}

document.getElementById('log-today-btn').addEventListener('click', () => logDate(todayStr()));
document.getElementById('log-date-btn').addEventListener('click', () => logDate(document.getElementById('period-date').value));
document.getElementById('period-list').addEventListener('click', ev => {
  if (!ev.target.classList.contains('del-btn')) return;
  periods = periods.filter(p => p.id !== ev.target.dataset.id);
  save(); render();
});

render();
