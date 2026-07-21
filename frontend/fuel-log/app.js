let fillups = JSON.parse(localStorage.getItem('fuel-log')) || [];

function save() { localStorage.setItem('fuel-log', JSON.stringify(fillups)); }
function genId() { return Math.random().toString(36).slice(2, 9); }
function todayStr() { return new Date().toISOString().slice(0, 10); }
function fmtDate(s) {
  return new Date(s + 'T00:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

function byOdometer() {
  return [...fillups].sort((a, b) => a.odometer - b.odometer);
}

function withConsumption() {
  return byOdometer().map((f, i, arr) => {
    if (i === 0) return { ...f, consumption: null, distance: null };
    const dist = f.odometer - arr[i - 1].odometer;
    return { ...f, distance: dist, consumption: dist > 0 ? (f.litres / dist) * 100 : null };
  });
}

function render() {
  const entries = withConsumption();
  const validC = entries.filter(e => e.consumption != null);
  const avgC = validC.length ? validC.reduce((s, e) => s + e.consumption, 0) / validC.length : null;
  const totalSpent = fillups.reduce((s, f) => s + f.litres * f.pricePerLitre, 0);

  const statsEl = document.getElementById('stats');
  statsEl.innerHTML = fillups.length > 0 ? `<div class="stats-row">
    ${avgC != null ? `<div class="stat"><div class="stat-val">${avgC.toFixed(1)}</div><div class="stat-lbl">avg L/100km</div></div>` : ''}
    <div class="stat"><div class="stat-val">${totalSpent.toFixed(2)}</div><div class="stat-lbl">total spent</div></div>
    <div class="stat"><div class="stat-val">${fillups.length}</div><div class="stat-lbl">fill-up${fillups.length !== 1 ? 's' : ''}</div></div>
  </div>` : '';

  const list = document.getElementById('fillup-list');
  if (fillups.length === 0) {
    list.innerHTML = '<div class="empty">No fill-ups yet — log one below.</div>';
    return;
  }

  list.innerHTML = [...entries].reverse().map(f => {
    const total = (f.litres * f.pricePerLitre).toFixed(2);
    const c = f.consumption != null ? `${f.consumption.toFixed(1)} L/100km` : '—';
    const d = f.distance != null ? `${f.distance.toLocaleString()} km` : 'first fill-up';
    return `<div class="fillup-row">
      <div class="fillup-body">
        <div class="fillup-top">
          <span class="fillup-date">${fmtDate(f.date)}</span>
          <span class="fillup-odo">${f.odometer.toLocaleString()} km</span>
        </div>
        <div class="fillup-bottom">${f.litres} L &middot; <strong>${total}</strong> &middot; ${d} &middot; ${c}</div>
      </div>
      <button class="del-btn" data-id="${f.id}" title="Delete">×</button>
    </div>`;
  }).join('');
}

function addFillup() {
  const date = document.getElementById('f-date').value;
  const odometer = parseFloat(document.getElementById('f-odometer').value);
  const litres = parseFloat(document.getElementById('f-litres').value);
  const pricePerLitre = parseFloat(document.getElementById('f-price').value);
  if (!date || isNaN(odometer) || isNaN(litres) || isNaN(pricePerLitre)) return;
  fillups.push({ id: genId(), date, odometer, litres, pricePerLitre });
  document.getElementById('f-odometer').value = '';
  document.getElementById('f-litres').value = '';
  document.getElementById('f-price').value = '';
  save(); render();
  document.getElementById('f-odometer').focus();
}

document.getElementById('add-btn').addEventListener('click', addFillup);
document.getElementById('f-price').addEventListener('keydown', e => { if (e.key === 'Enter') addFillup(); });
document.getElementById('fillup-list').addEventListener('click', e => {
  if (!e.target.classList.contains('del-btn')) return;
  if (!confirm('Delete this fill-up?')) return;
  fillups = fillups.filter(f => f.id !== e.target.dataset.id);
  save(); render();
});

document.getElementById('f-date').value = todayStr();
document.getElementById('f-odometer').focus();
render();
