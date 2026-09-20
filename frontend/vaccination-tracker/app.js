let vaccinations = JSON.parse(localStorage.getItem('vaccination-tracker')) || [];

function save() { localStorage.setItem('vaccination-tracker', JSON.stringify(vaccinations)); }
function genId() { return Math.random().toString(36).slice(2, 9); }
function escHtml(t) { const d = document.createElement('div'); d.textContent = t; return d.innerHTML; }
function todayStr() { return new Date().toISOString().slice(0, 10); }

function addInterval(dateStr, value, unit) {
  const d = new Date(dateStr + 'T00:00:00');
  if (unit === 'days') {
    d.setDate(d.getDate() + value);
  } else if (unit === 'months') {
    d.setMonth(d.getMonth() + value);
  } else if (unit === 'years') {
    d.setFullYear(d.getFullYear() + value);
  }
  return d.toISOString().slice(0, 10);
}

function daysBetween(from, to) {
  return Math.round((new Date(to + 'T00:00:00') - new Date(from + 'T00:00:00')) / 86400000);
}

function formatDate(str) {
  return new Date(str + 'T00:00:00').toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

function formatInterval(value, unit) {
  if (unit === 'days') return value === 1 ? '1 day' : `${value} days`;
  if (unit === 'months') return value === 1 ? '1 month' : `${value} months`;
  if (unit === 'years') return value === 1 ? '1 year' : `${value} years`;
  return `${value} ${unit}`;
}

function render() {
  const container = document.getElementById('vax-list');
  if (vaccinations.length === 0) {
    container.innerHTML = '<div class="empty">No vaccinations tracked yet — add one below.</div>';
    return;
  }

  const today = todayStr();
  const sorted = vaccinations.map(v => {
    const due = addInterval(v.lastDose, v.intervalValue, v.intervalUnit);
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
    } else if (v.days <= 365) {
      const months = Math.round(v.days / 30.5);
      statusClass = 'ok';
      statusText = `due in ~${months} month${months !== 1 ? 's' : ''}`;
    } else {
      const years = Math.round(v.days / 365.25);
      statusClass = 'ok';
      statusText = `due in ~${years} year${years !== 1 ? 's' : ''}`;
    }

    const intervalLabel = formatInterval(v.intervalValue, v.intervalUnit);
    const doseLabel = v.doseNumber ? ` (Dose ${v.doseNumber})` : '';
    return `
      <div class="vax-card">
        <div class="vax-top">
          <div class="vax-name">${escHtml(v.name)}${doseLabel}</div>
          <span class="status-badge ${statusClass}">${statusText}</span>
          <button class="vax-del" data-id="${v.id}" title="Remove">×</button>
        </div>
        <div class="vax-meta">
          <span>Last: ${formatDate(v.lastDose)}</span>
          <span>·</span>
          <span>Due: ${formatDate(v.due)}</span>
          <span>·</span>
          <span>Every ${intervalLabel}</span>
        </div>
        <button class="log-btn" data-id="${v.id}">✓ Log dose today</button>
      </div>`;
  }).join('');
}

document.getElementById('vax-list').addEventListener('click', e => {
  const logBtn = e.target.closest('.log-btn');
  if (logBtn) {
    const v = vaccinations.find(v => v.id === logBtn.dataset.id);
    if (v) {
      v.lastDose = todayStr();
      save();
      render();
    }
    return;
  }
  const delBtn = e.target.closest('.vax-del');
  if (delBtn) {
    vaccinations = vaccinations.filter(v => v.id !== delBtn.dataset.id);
    save();
    render();
  }
});

function addVaccination() {
  const name = document.getElementById('new-name').value.trim();
  const lastDose = document.getElementById('last-dose').value;
  const doseNumber = document.getElementById('dose-number').value.trim();
  const intervalValue = parseInt(document.getElementById('interval-value').value, 10);
  const intervalUnit = document.getElementById('interval-unit').value;

  if (!name || !lastDose || !intervalValue || intervalValue < 1) return;

  vaccinations.push({
    id: genId(),
    name,
    lastDose,
    doseNumber: doseNumber || '',
    intervalValue,
    intervalUnit
  });

  document.getElementById('new-name').value = '';
  document.getElementById('last-dose').value = '';
  document.getElementById('dose-number').value = '';
  document.getElementById('interval-value').value = '';
  document.getElementById('interval-unit').value = 'months';

  save();
  render();
  document.getElementById('new-name').focus();
}

document.getElementById('add-btn').addEventListener('click', addVaccination);
document.getElementById('new-name').addEventListener('keydown', e => { if (e.key === 'Enter') document.getElementById('last-dose').focus(); });
document.getElementById('last-dose').addEventListener('keydown', e => { if (e.key === 'Enter') document.getElementById('dose-number').focus(); });
document.getElementById('dose-number').addEventListener('keydown', e => { if (e.key === 'Enter') document.getElementById('interval-value').focus(); });
document.getElementById('interval-value').addEventListener('keydown', e => { if (e.key === 'Enter') addVaccination(); });

document.getElementById('new-name').focus();
render();
