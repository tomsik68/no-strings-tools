const PRESETS = {
  'Weekend Trip': ['Passport / ID', 'Wallet', 'Keys', 'Phone charger', 'Headphones', 'Toothbrush', 'Toothpaste', 'Deodorant', 'Underwear ×3', 'Socks ×3', 'T-shirts ×3', 'Trousers', 'Jacket', 'Shoes'],
  'Beach': ['Sunscreen', 'Swimsuit', 'Towel', 'Sunglasses', 'Flip flops', 'Hat', 'Water bottle', 'Snacks', 'Book / Kindle', 'Wallet', 'Phone charger', 'Camera'],
  'Camping': ['Tent', 'Sleeping bag', 'Sleeping pad', 'Headlamp + batteries', 'First aid kit', 'Water bottle / filter', 'Food & snacks', 'Cooking pot', 'Lighter / matches', 'Knife', 'Rain jacket', 'Warm layer', 'Boots', 'Map & compass', 'Sunscreen', 'Insect repellent', 'Bin bags'],
  'Business Trip': ['Passport / ID', 'Laptop + charger', 'Business cards', 'Notebook & pen', 'Phone charger', 'Smart clothes', 'Dress shoes', 'Toiletries', 'Underwear ×3', 'Socks ×3', 'Power adapter'],
  'Gym Bag': ['Trainers', 'Shorts', 'T-shirt', 'Socks', 'Towel', 'Deodorant', 'Water bottle', 'Headphones', 'Lock (for locker)'],
};

let items = JSON.parse(localStorage.getItem('packing-list')) || [];

function genId() { return Math.random().toString(36).slice(2, 9); }

function save() { localStorage.setItem('packing-list', JSON.stringify(items)); }

function render() {
  const list = document.getElementById('items-list');
  const checked = items.filter(i => i.checked).length;
  const total = items.length;

  document.getElementById('progress-label').textContent = `${checked} / ${total} packed`;
  const bar = document.getElementById('progress-bar');
  bar.value = checked;
  bar.max = Math.max(total, 1);

  if (total === 0) {
    list.innerHTML = '<li class="empty">No items yet. Load a preset or add your own.</li>';
    return;
  }

  list.innerHTML = items.map(item => `
    <li class="item-row" data-id="${item.id}">
      <input type="checkbox" ${item.checked ? 'checked' : ''} data-id="${item.id}" />
      <span class="item-label${item.checked ? ' done' : ''}">${escHtml(item.text)}</span>
      <button class="item-del" data-id="${item.id}" title="Remove item">×</button>
    </li>`).join('');
}

function escHtml(t) { const d = document.createElement('div'); d.textContent = t; return d.innerHTML; }

// Toggle checked
document.getElementById('items-list').addEventListener('change', e => {
  if (e.target.type !== 'checkbox') return;
  const item = items.find(i => i.id === e.target.dataset.id);
  if (item) { item.checked = e.target.checked; save(); render(); }
});

// Delete item
document.getElementById('items-list').addEventListener('click', e => {
  if (!e.target.classList.contains('item-del')) return;
  items = items.filter(i => i.id !== e.target.dataset.id);
  save(); render();
});

// Add item
function addItem() {
  const input = document.getElementById('new-item');
  const text = input.value.trim();
  if (!text) return;
  items.push({ id: genId(), text, checked: false });
  input.value = '';
  save(); render();
  input.focus();
}
document.getElementById('add-btn').addEventListener('click', addItem);
document.getElementById('new-item').addEventListener('keydown', e => { if (e.key === 'Enter') addItem(); });

// Load preset
document.getElementById('load-btn').addEventListener('click', () => {
  const name = document.getElementById('preset-select').value;
  if (!name) return;
  const unchecked = items.filter(i => !i.checked).length;
  if (unchecked > 0 && !confirm(`Load "${name}" preset? Your current list will be replaced.`)) return;
  items = PRESETS[name].map(text => ({ id: genId(), text, checked: false }));
  document.getElementById('preset-select').value = '';
  save(); render();
});

// Uncheck all
document.getElementById('uncheck-btn').addEventListener('click', () => {
  items.forEach(i => i.checked = false);
  save(); render();
});

// Clear list
document.getElementById('clear-btn').addEventListener('click', () => {
  if (items.length === 0) return;
  if (!confirm('Clear the entire list?')) return;
  items = [];
  save(); render();
});

document.getElementById('new-item').focus();
render();
