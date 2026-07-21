let entries = JSON.parse(localStorage.getItem('sleep-log')) || [];

function save() { localStorage.setItem('sleep-log', JSON.stringify(entries)); }
function genId() { return Math.random().toString(36).slice(2, 9); }
function todayStr() { return new Date().toISOString().slice(0, 10); }

function durationMins(bedtime, waketime) {
  const [bh, bm] = bedtime.split(':').map(Number);
  const [wh, wm] = waketime.split(':').map(Number);
  let mins = (wh * 60 + wm) - (bh * 60 + bm);
  if (mins <= 0) mins += 24 * 60;
  return mins;
}

function fmtDuration(mins) {
  const h = Math.floor(mins / 60), m = mins % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

function durationColor(mins) {
  if (mins < 360) return '#ef5350';
  if (mins < 420) return '#ffa726';
  if (mins <= 540) return '#43a047';
  return '#1976d2';
}

function fmtDate(s) {
  return new Date(s + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
}

function render() {
  const sorted = [...entries].sort((a, b) => b.date.localeCompare(a.date));
  const recent = sorted.slice(0, 7);

  const statsEl = document.getElementById('stats');
  if (recent.length > 0) {
    const avgMins = Math.round(recent.reduce((s, e) => s + durationMins(e.bedtime, e.waketime), 0) / recent.length);
    const color = durationColor(avgMins);
    statsEl.innerHTML = `<div class="stat"><div class="stat-val" style="color:${color}">${fmtDuration(avgMins)}</div><div class="stat-lbl">avg last ${recent.length} night${recent.length !== 1 ? 's' : ''}</div></div>`;
  } else {
    statsEl.innerHTML = '';
  }

  const list = document.getElementById('sleep-list');
  if (entries.length === 0) {
    list.innerHTML = '<div class="empty">No entries yet — log last night below.</div>';
    return;
  }

  list.innerHTML = sorted.map(e => {
    const mins = durationMins(e.bedtime, e.waketime);
    const color = durationColor(mins);
    return `<div class="sleep-row">
      <div class="sleep-date">${fmtDate(e.date)}</div>
      <div class="sleep-times">${e.bedtime} → ${e.waketime}</div>
      <div class="sleep-duration" style="color:${color}">${fmtDuration(mins)}</div>
      <button class="del-btn" data-id="${e.id}" title="Delete">×</button>
    </div>`;
  }).join('');
}

function addEntry() {
  const date = document.getElementById('s-date').value;
  const bedtime = document.getElementById('s-bedtime').value;
  const waketime = document.getElementById('s-waketime').value;
  if (!date || !bedtime || !waketime) return;
  entries.push({ id: genId(), date, bedtime, waketime });
  document.getElementById('s-bedtime').value = '';
  document.getElementById('s-waketime').value = '';
  save(); render();
  document.getElementById('s-bedtime').focus();
}

document.getElementById('add-btn').addEventListener('click', addEntry);
document.getElementById('s-waketime').addEventListener('keydown', e => { if (e.key === 'Enter') addEntry(); });
document.getElementById('sleep-list').addEventListener('click', ev => {
  if (!ev.target.classList.contains('del-btn')) return;
  entries = entries.filter(e => e.id !== ev.target.dataset.id);
  save(); render();
});

document.getElementById('s-date').value = todayStr();
document.getElementById('s-bedtime').focus();
render();
