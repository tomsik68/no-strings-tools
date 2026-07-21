let meals = JSON.parse(localStorage.getItem('dinner-picker')) || [];
let current = null;

function save() { localStorage.setItem('dinner-picker', JSON.stringify(meals)); }
function genId() { return Math.random().toString(36).slice(2, 9); }
function escHtml(t) { const d = document.createElement('div'); d.textContent = t; return d.innerHTML; }

function pick() {
  if (meals.length === 0) return;
  const pool = meals.length > 1 ? meals.filter(m => m.id !== current?.id) : meals;
  current = pool[Math.floor(Math.random() * pool.length)];
  render();
}

function render() {
  const pickBtn = document.getElementById('pick-btn');
  pickBtn.disabled = meals.length === 0;

  const resultEl = document.getElementById('result');
  if (current) {
    resultEl.innerHTML = `<div class="result-card"><div class="result-name">${escHtml(current.name)}</div></div>`;
    resultEl.hidden = false;
  } else {
    resultEl.hidden = true;
  }

  const list = document.getElementById('meals-list');
  if (meals.length === 0) {
    list.innerHTML = '<div class="empty">Add meals or restaurants below, then pick.</div>';
    return;
  }
  list.innerHTML = meals.map(m => `
    <div class="meal-row${current?.id === m.id ? ' active' : ''}">
      <span class="meal-name">${escHtml(m.name)}</span>
      <button class="del-btn" data-id="${m.id}" title="Remove">×</button>
    </div>`).join('');
}

function addMeal() {
  const input = document.getElementById('new-meal');
  const name = input.value.trim();
  if (!name) return;
  meals.push({ id: genId(), name });
  input.value = '';
  save(); render();
  input.focus();
}

document.getElementById('pick-btn').addEventListener('click', pick);
document.getElementById('add-btn').addEventListener('click', addMeal);
document.getElementById('new-meal').addEventListener('keydown', e => { if (e.key === 'Enter') addMeal(); });
document.getElementById('meals-list').addEventListener('click', e => {
  if (!e.target.classList.contains('del-btn')) return;
  if (current?.id === e.target.dataset.id) current = null;
  meals = meals.filter(m => m.id !== e.target.dataset.id);
  save(); render();
});

document.getElementById('new-meal').focus();
render();
