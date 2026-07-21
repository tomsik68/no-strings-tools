const KEY = 'fuel-log';

function load() {
  const raw = localStorage.getItem(KEY);
  if (!raw) return { cars: [], fillups: [] };
  const parsed = JSON.parse(raw);
  if (Array.isArray(parsed)) {
    const defaultCar = { id: crypto.randomUUID(), name: 'My Car' };
    return { cars: [defaultCar], fillups: parsed.map(f => ({ ...f, carId: defaultCar.id })) };
  }
  return parsed;
}

let state = load();
let activeCar = state.cars[0]?.id || null;

function save() { localStorage.setItem(KEY, JSON.stringify(state)); }
function todayStr() { return new Date().toISOString().slice(0, 10); }
function fmtDate(s) {
  return new Date(s + 'T00:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

function carFillups() {
  return state.fillups.filter(f => f.carId === activeCar);
}

function byOdometer(fups) {
  return [...fups].sort((a, b) => a.odometer - b.odometer);
}

function withConsumption(fups) {
  const sorted = byOdometer(fups);
  return sorted.map((f, i, arr) => {
    if (i === 0) return { ...f, consumption: null, distance: null };
    const dist = f.odometer - arr[i - 1].odometer;
    return { ...f, distance: dist, consumption: dist > 0 ? (f.litres / dist) * 100 : null };
  });
}

function renderCars() {
  const section = document.getElementById('car-tabs');
  if (!state.cars.length) {
    section.innerHTML = '<div class="no-cars">Add your first car below.</div>';
    return;
  }
  section.innerHTML = state.cars.map(c => `
    <button class="car-tab ${c.id === activeCar ? 'active' : ''}" data-car-id="${c.id}">${c.name}</button>
  `).join('') + `<button class="car-add-btn" id="add-car-btn" title="Add car">+ Car</button>`;
  document.getElementById('add-car-btn').addEventListener('click', promptAddCar);
}

function promptAddCar() {
  const name = prompt('Car name (e.g. Toyota Yaris, Work Van):');
  if (!name || !name.trim()) return;
  const car = { id: crypto.randomUUID(), name: name.trim() };
  state.cars.push(car);
  activeCar = car.id;
  save(); renderAll();
}

function renderStats(fups) {
  const entries = withConsumption(fups);
  const validC = entries.filter(e => e.consumption != null);
  const avgC = validC.length ? validC.reduce((s, e) => s + e.consumption, 0) / validC.length : null;
  const totalSpent = fups.reduce((s, f) => s + f.litres * f.pricePerLitre, 0);

  document.getElementById('stats').innerHTML = fups.length > 0 ? `<div class="stats-row">
    ${avgC != null ? `<div class="stat"><div class="stat-val">${avgC.toFixed(1)}</div><div class="stat-lbl">avg L/100km</div></div>` : ''}
    <div class="stat"><div class="stat-val">${totalSpent.toFixed(2)}</div><div class="stat-lbl">total spent</div></div>
    <div class="stat"><div class="stat-val">${fups.length}</div><div class="stat-lbl">fill-up${fups.length !== 1 ? 's' : ''}</div></div>
  </div>` : '';
}

function renderList(fups) {
  const list = document.getElementById('fillup-list');
  if (!activeCar) { list.innerHTML = ''; return; }
  if (!fups.length) {
    list.innerHTML = '<div class="empty">No fill-ups yet — log one below.</div>';
    return;
  }
  const entries = withConsumption(fups);
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

function renderCarActions() {
  const section = document.getElementById('car-actions');
  if (!activeCar) { section.innerHTML = ''; return; }
  const car = state.cars.find(c => c.id === activeCar);
  section.innerHTML = car ? `<button class="rename-car-btn" id="rename-car-btn">Rename</button>
    <button class="delete-car-btn" id="delete-car-btn">Delete car</button>` : '';
  document.getElementById('rename-car-btn')?.addEventListener('click', () => {
    const name = prompt('New name:', car.name);
    if (!name || !name.trim()) return;
    car.name = name.trim();
    save(); renderAll();
  });
  document.getElementById('delete-car-btn')?.addEventListener('click', () => {
    const fupCount = carFillups().length;
    const msg = fupCount ? `Delete "${car.name}" and its ${fupCount} fill-up${fupCount !== 1 ? 's' : ''}?` : `Delete "${car.name}"?`;
    if (!confirm(msg)) return;
    state.fillups = state.fillups.filter(f => f.carId !== activeCar);
    state.cars = state.cars.filter(c => c.id !== activeCar);
    activeCar = state.cars[0]?.id || null;
    save(); renderAll();
  });
}

function renderAll() {
  renderCars();
  const fups = carFillups();
  renderStats(fups);
  renderList(fups);
  renderCarActions();
  const addForm = document.getElementById('add-form');
  addForm.style.display = activeCar ? '' : 'none';
}

document.getElementById('car-tabs').addEventListener('click', ev => {
  const btn = ev.target.closest('.car-tab');
  if (!btn) return;
  activeCar = btn.dataset.carId;
  renderAll();
});

function addFillup() {
  if (!activeCar) return;
  const date = document.getElementById('f-date').value;
  const odometer = parseFloat(document.getElementById('f-odometer').value);
  const litres = parseFloat(document.getElementById('f-litres').value);
  const pricePerLitre = parseFloat(document.getElementById('f-price').value);
  if (!date || isNaN(odometer) || isNaN(litres) || isNaN(pricePerLitre)) return;
  state.fillups.push({ id: crypto.randomUUID(), carId: activeCar, date, odometer, litres, pricePerLitre });
  document.getElementById('f-odometer').value = '';
  document.getElementById('f-litres').value = '';
  document.getElementById('f-price').value = '';
  save(); renderAll();
  document.getElementById('f-odometer').focus();
}

document.getElementById('add-btn').addEventListener('click', addFillup);
document.getElementById('f-price').addEventListener('keydown', ev => { if (ev.key === 'Enter') addFillup(); });
document.getElementById('fillup-list').addEventListener('click', ev => {
  if (!ev.target.classList.contains('del-btn')) return;
  if (!confirm('Delete this fill-up?')) return;
  state.fillups = state.fillups.filter(f => f.id !== ev.target.dataset.id);
  save(); renderAll();
});

if (!state.cars.length) {
  const car = { id: crypto.randomUUID(), name: 'My Car' };
  state.cars.push(car);
  activeCar = car.id;
  save();
}

document.getElementById('f-date').value = todayStr();
renderAll();
if (activeCar) document.getElementById('f-odometer').focus();
