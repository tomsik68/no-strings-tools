let visits = JSON.parse(localStorage.getItem('doctor-visits')) || [];

function save() { localStorage.setItem('doctor-visits', JSON.stringify(visits)); }
function genId() { return Math.random().toString(36).slice(2, 9); }
function escHtml(t) { const d = document.createElement('div'); d.textContent = t; return d.innerHTML; }
function todayStr() { return new Date().toISOString().slice(0, 10); }

function addMonths(dateStr, months) {
  const d = new Date(dateStr + 'T00:00:00');
  d.setMonth(d.getMonth() + months);
  return d.toISOString().slice(0, 10);
}

function daysBetween(from, to) {
  return Math.round((new Date(to + 'T00:00:00') - new Date(from + 'T00:00:00')) / 86400000);
}

function formatDate(str) {
  return new Date(str + 'T00:00:00').toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

const INTERVAL_LABELS = { 3: '3 months', 6: '6 months', 12: '1 year', 24: '2 years', 36: '3 years' };

function render() {
  const container = document.getElementById('visits-list');
  if (visits.length === 0) {
    container.innerHTML = '<div class="empty">No doctors tracked yet — add one below.</div>';
    return;
  }

  const today = todayStr();
  const sorted = visits.map(v => {
    const due = addMonths(v.lastVisit, v.intervalMonths);
    const days = daysBetween(today, due);
    return { ...v, due, days };
  }).sort((a, b) => a.days - b.days);

  container.innerHTML = sorted.map(v => {
    let statusClass, statusText;
    if (v.days < 0) {
      statusClass = 'overdue';
      statusText = `${-v.days} day${-v.days !== 1 ? 's' : ''} overdue`;
    } else if (v.days === 0) {
      statusClass = 'soon';
      statusText = 'Due today';
    } else if (v.days <= 30) {
      statusClass = 'soon';
      statusText = `due in ${v.days} day${v.days !== 1 ? 's' : ''}`;
    } else {
      const months = Math.round(v.days / 30.5);
      statusClass = 'ok';
      statusText = `due in ~${months} month${months !== 1 ? 's' : ''}`;
    }

    const intervalLabel = INTERVAL_LABELS[v.intervalMonths] || `${v.intervalMonths} months`;
    return `
      <div class="visit-card">
        <div class="visit-top">
          <div class="visit-name">${escHtml(v.name)}</div>
          <span class="status-badge ${statusClass}">${statusText}</span>
          <button class="visit-del" data-id="${v.id}" title="Remove">×</button>
        </div>
        <div class="visit-meta">
          <span>Last: ${formatDate(v.lastVisit)}</span>
          <span>·</span>
          <span>Due: ${formatDate(v.due)}</span>
          <span>·</span>
          <span>Every ${intervalLabel}</span>
        </div>
        <button class="log-btn" data-id="${v.id}">✓ Log visit today</button>
      </div>`;
  }).join('');
}

document.getElementById('visits-list').addEventListener('click', e => {
  const logBtn = e.target.closest('.log-btn');
  if (logBtn) {
    const v = visits.find(v => v.id === logBtn.dataset.id);
    if (v) { v.lastVisit = todayStr(); save(); render(); }
    return;
  }
  const delBtn = e.target.closest('.visit-del');
  if (delBtn) {
    visits = visits.filter(v => v.id !== delBtn.dataset.id);
    save(); render();
  }
});

function addVisit() {
  const name = document.getElementById('new-name').value.trim();
  const lastVisit = document.getElementById('last-visit').value;
  const intervalMonths = parseInt(document.getElementById('interval-select').value, 10);
  if (!name || !lastVisit) return;
  visits.push({ id: genId(), name, lastVisit, intervalMonths });
  document.getElementById('new-name').value = '';
  document.getElementById('last-visit').value = '';
  save(); render();
  document.getElementById('new-name').focus();
}

document.getElementById('add-btn').addEventListener('click', addVisit);
document.getElementById('new-name').addEventListener('keydown', e => { if (e.key === 'Enter') document.getElementById('last-visit').focus(); });
document.getElementById('last-visit').addEventListener('keydown', e => { if (e.key === 'Enter') addVisit(); });

document.getElementById('new-name').focus();
render();
