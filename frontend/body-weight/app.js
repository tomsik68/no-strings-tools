let entries = JSON.parse(localStorage.getItem('body-weight')) || [];

function save() { localStorage.setItem('body-weight', JSON.stringify(entries)); }
function genId() { return Math.random().toString(36).slice(2, 9); }
function todayStr() { return new Date().toISOString().slice(0, 10); }
function fmtDate(s) {
  return new Date(s + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
}

function diffHtml(diff) {
  if (diff === null) return '';
  const cls = diff > 0 ? 'up' : diff < 0 ? 'down' : '';
  return ` <span class="diff ${cls}">${diff > 0 ? '+' : ''}${diff.toFixed(1)}</span>`;
}

function render() {
  const sorted = [...entries].sort((a, b) => b.date.localeCompare(a.date));

  const statsEl = document.getElementById('stats');
  if (sorted.length > 0) {
    const latest = sorted[0].weight;
    const prev = sorted.length > 1 ? sorted[1].weight : null;
    const diff = prev !== null ? latest - prev : null;
    statsEl.innerHTML = `<div class="stat"><div class="stat-val">${latest.toFixed(1)}${diffHtml(diff)}</div><div class="stat-lbl">latest</div></div>`;
  } else {
    statsEl.innerHTML = '';
  }

  const list = document.getElementById('weight-list');
  if (entries.length === 0) {
    list.innerHTML = '<div class="empty">No entries yet — log your weight below.</div>';
    return;
  }

  list.innerHTML = sorted.map((e, i, arr) => {
    const prev = arr[i + 1];
    const diff = prev ? e.weight - prev.weight : null;
    return `<div class="weight-row">
      <span class="weight-date">${fmtDate(e.date)}</span>
      <span class="weight-val">${e.weight.toFixed(1)}${diffHtml(diff)}</span>
      <button class="del-btn" data-id="${e.id}" title="Delete">×</button>
    </div>`;
  }).join('');
}

function addEntry() {
  const date = document.getElementById('w-date').value;
  const weight = parseFloat(document.getElementById('w-weight').value);
  if (!date || isNaN(weight) || weight <= 0) return;
  entries.push({ id: genId(), date, weight });
  document.getElementById('w-weight').value = '';
  save(); render();
  document.getElementById('w-weight').focus();
}

document.getElementById('add-btn').addEventListener('click', addEntry);
document.getElementById('w-weight').addEventListener('keydown', e => { if (e.key === 'Enter') addEntry(); });
document.getElementById('weight-list').addEventListener('click', ev => {
  if (!ev.target.classList.contains('del-btn')) return;
  entries = entries.filter(e => e.id !== ev.target.dataset.id);
  save(); render();
});

document.getElementById('w-date').value = todayStr();
document.getElementById('w-weight').focus();
render();
