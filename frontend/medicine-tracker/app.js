let meds = JSON.parse(localStorage.getItem('medicine-tracker')) || [];

function save() { localStorage.setItem('medicine-tracker', JSON.stringify(meds)); }
function genId() { return Math.random().toString(36).slice(2, 9); }
function escHtml(t) { const d = document.createElement('div'); d.textContent = t; return d.innerHTML; }
function todayStr() { return new Date().toISOString().slice(0, 10); }
function timeStr() {
  return new Date().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
}

function render() {
  document.getElementById('date-label').textContent =
    new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });

  const container = document.getElementById('meds-list');
  const today = todayStr();

  if (meds.length === 0) {
    container.innerHTML = '<div class="empty">No medications yet — add one below.</div>';
    return;
  }

  container.innerHTML = meds.map(med => {
    const takenTime = med.log[today];
    const taken = !!takenTime;

    const dots = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const key = d.toISOString().slice(0, 10);
      const t = med.log[key];
      const isToday = key === today;
      return `<div class="med-dot${t ? ' taken' : ''}${isToday ? ' today' : ''}" title="${key}${t ? ': ' + t : ''}"></div>`;
    }).join('');

    return `<div class="med-card${taken ? ' taken' : ''}">
      <div class="med-top">
        <input type="checkbox" class="med-checkbox" data-id="${med.id}" ${taken ? 'checked' : ''} />
        <div class="med-info">
          <div class="med-name">${escHtml(med.name)}</div>
          <div class="med-status ${taken ? 'taken' : 'pending'}">${taken ? `✓ Taken at ${takenTime}` : 'Not yet taken today'}</div>
        </div>
        <button class="med-del" data-id="${med.id}" title="Remove">×</button>
      </div>
      <div class="med-dots">${dots}</div>
    </div>`;
  }).join('');
}

document.getElementById('meds-list').addEventListener('change', e => {
  const cb = e.target.closest('.med-checkbox');
  if (!cb) return;
  const med = meds.find(m => m.id === cb.dataset.id);
  if (!med) return;
  const today = todayStr();
  if (cb.checked) {
    med.log[today] = timeStr();
  } else {
    delete med.log[today];
  }
  save(); render();
});

document.getElementById('meds-list').addEventListener('click', e => {
  const del = e.target.closest('.med-del');
  if (!del) return;
  const med = meds.find(m => m.id === del.dataset.id);
  if (!med || !confirm(`Remove "${med.name}"?`)) return;
  meds = meds.filter(m => m.id !== del.dataset.id);
  save(); render();
});

function addMed() {
  const input = document.getElementById('new-med');
  const name = input.value.trim();
  if (!name) return;
  meds.push({ id: genId(), name, log: {} });
  input.value = '';
  save(); render();
  input.focus();
}

document.getElementById('add-btn').addEventListener('click', addMed);
document.getElementById('new-med').addEventListener('keydown', e => { if (e.key === 'Enter') addMed(); });

document.getElementById('new-med').focus();
render();
