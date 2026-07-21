let readings = JSON.parse(localStorage.getItem('blood-pressure')) || [];

function save() { localStorage.setItem('blood-pressure', JSON.stringify(readings)); }
function genId() { return Math.random().toString(36).slice(2, 9); }
function todayStr() { return new Date().toISOString().slice(0, 10); }
function fmtDate(s) {
  return new Date(s + 'T00:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

function classify(sys, dia) {
  if (sys > 180 || dia > 120) return { label: 'Crisis',       cls: 'crisis' };
  if (sys >= 140 || dia >= 90) return { label: 'High Stage 2', cls: 'high2' };
  if (sys >= 130 || dia >= 80) return { label: 'High Stage 1', cls: 'high1' };
  if (sys >= 120 && dia < 80)  return { label: 'Elevated',     cls: 'elevated' };
  return                               { label: 'Normal',       cls: 'normal' };
}

function render() {
  const sorted = [...readings].sort((a, b) => b.date.localeCompare(a.date));
  const recent5 = sorted.slice(0, 5);

  const statsEl = document.getElementById('stats');
  if (recent5.length > 0) {
    const avgSys = Math.round(recent5.reduce((s, r) => s + r.systolic, 0) / recent5.length);
    const avgDia = Math.round(recent5.reduce((s, r) => s + r.diastolic, 0) / recent5.length);
    const { label, cls } = classify(avgSys, avgDia);
    statsEl.innerHTML = `<div class="stats-row">
      <div class="stat"><div class="stat-val">${avgSys}/${avgDia}</div><div class="stat-lbl">avg last ${recent5.length}</div></div>
      <div class="stat"><div class="stat-val"><span class="badge ${cls}">${label}</span></div><div class="stat-lbl">avg classification</div></div>
    </div>`;
  } else {
    statsEl.innerHTML = '';
  }

  const list = document.getElementById('readings-list');
  if (readings.length === 0) {
    list.innerHTML = '<div class="empty">No readings yet — log one below.</div>';
    return;
  }

  list.innerHTML = sorted.map(r => {
    const { label, cls } = classify(r.systolic, r.diastolic);
    const pulse = r.pulse ? ` · ${r.pulse} bpm` : '';
    return `<div class="reading-row">
      <div class="reading-bp">${r.systolic}/${r.diastolic}</div>
      <div class="reading-info">
        <div class="reading-date">${fmtDate(r.date)}</div>
        <div class="reading-pulse">${pulse}</div>
      </div>
      <span class="badge ${cls}">${label}</span>
      <button class="del-btn" data-id="${r.id}" title="Delete">×</button>
    </div>`;
  }).join('');
}

function addReading() {
  const date = document.getElementById('bp-date').value;
  const sys = parseInt(document.getElementById('bp-sys').value, 10);
  const dia = parseInt(document.getElementById('bp-dia').value, 10);
  const pulseVal = document.getElementById('bp-pulse').value;
  const pulse = pulseVal ? parseInt(pulseVal, 10) : null;
  if (!date || isNaN(sys) || isNaN(dia)) return;
  readings.push({ id: genId(), date, systolic: sys, diastolic: dia, pulse });
  document.getElementById('bp-sys').value = '';
  document.getElementById('bp-dia').value = '';
  document.getElementById('bp-pulse').value = '';
  save(); render();
  document.getElementById('bp-sys').focus();
}

document.getElementById('add-btn').addEventListener('click', addReading);
document.getElementById('bp-pulse').addEventListener('keydown', e => { if (e.key === 'Enter') addReading(); });
document.getElementById('readings-list').addEventListener('click', ev => {
  if (!ev.target.classList.contains('del-btn')) return;
  readings = readings.filter(r => r.id !== ev.target.dataset.id);
  save(); render();
});

document.getElementById('bp-date').value = todayStr();
document.getElementById('bp-sys').focus();
render();
