let recipes = JSON.parse(localStorage.getItem('recipe-box')) || [];
let detailId = null;

function save() { localStorage.setItem('recipe-box', JSON.stringify(recipes)); }
function genId() { return Math.random().toString(36).slice(2, 9); }
function escHtml(t) { const d = document.createElement('div'); d.textContent = t; return d.innerHTML; }

function renderList() {
  const query = document.getElementById('search-input').value.toLowerCase().trim();
  const filtered = query ? recipes.filter(r => r.name.toLowerCase().includes(query)) : recipes;
  const sorted = [...filtered].sort((a, b) => a.name.localeCompare(b.name));

  const list = document.getElementById('recipe-list');
  if (recipes.length === 0) {
    list.innerHTML = '<div class="empty">No recipes yet — click "+ New" to add one.</div>';
    return;
  }
  if (sorted.length === 0) {
    list.innerHTML = '<div class="empty">No recipes match your search.</div>';
    return;
  }

  list.innerHTML = sorted.map(r => {
    const meta = r.servings ? escHtml(r.servings) : '';
    return `<div class="recipe-card" data-id="${r.id}">
      <span class="recipe-card-name">${escHtml(r.name || 'Untitled')}</span>
      ${meta ? `<span class="recipe-card-meta">${meta}</span>` : ''}
    </div>`;
  }).join('');
}

function showDetail(id) {
  detailId = id;
  const r = recipes.find(r => r.id === id) || {};
  document.getElementById('r-name').value = r.name || '';
  document.getElementById('r-servings').value = r.servings || '';
  document.getElementById('r-ingredients').value = r.ingredients || '';
  document.getElementById('r-steps').value = r.steps || '';
  document.getElementById('r-notes').value = r.notes || '';
  document.getElementById('list-panel').hidden = true;
  document.getElementById('detail-panel').classList.add('open');
  document.getElementById('back-home').hidden = true;
  document.getElementById('r-name').focus();
}

function showList() {
  detailId = null;
  document.getElementById('list-panel').hidden = false;
  document.getElementById('detail-panel').classList.remove('open');
  document.getElementById('back-home').hidden = false;
  renderList();
}

// Auto-save in detail view
document.getElementById('detail-panel').addEventListener('input', () => {
  if (!detailId) return;
  const r = recipes.find(r => r.id === detailId);
  if (!r) return;
  r.name        = document.getElementById('r-name').value;
  r.servings    = document.getElementById('r-servings').value;
  r.ingredients = document.getElementById('r-ingredients').value;
  r.steps       = document.getElementById('r-steps').value;
  r.notes       = document.getElementById('r-notes').value;
  save();
});

document.getElementById('recipe-list').addEventListener('click', e => {
  const card = e.target.closest('.recipe-card');
  if (card) showDetail(card.dataset.id);
});

document.getElementById('new-recipe-btn').addEventListener('click', () => {
  const id = genId();
  recipes.push({ id, name: '', servings: '', ingredients: '', steps: '', notes: '' });
  save();
  showDetail(id);
});

document.getElementById('back-btn').addEventListener('click', showList);

document.getElementById('del-recipe-btn').addEventListener('click', () => {
  if (!detailId) return;
  const r = recipes.find(r => r.id === detailId);
  const name = r?.name || 'this recipe';
  if (!confirm(`Delete "${name}"?`)) return;
  recipes = recipes.filter(r => r.id !== detailId);
  save();
  showList();
});

document.getElementById('search-input').addEventListener('input', renderList);

renderList();
