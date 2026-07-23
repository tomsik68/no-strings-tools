const KEY = 'reading-log';

let books = JSON.parse(localStorage.getItem(KEY) || '[]');
let filter = 'all';

const save = () => localStorage.setItem(KEY, JSON.stringify(books));
const esc = (t) => { const d = document.createElement('div'); d.textContent = t ?? ''; return d.innerHTML; };

const STATUS_LABELS = { reading: 'Reading', read: 'Read', want: 'Want to Read' };

function stars(rating, id) {
  return [1, 2, 3, 4, 5].map(n =>
    `<span class="star ${n <= rating ? 'on' : ''}" data-id="${id}" data-star="${n}" role="button" aria-label="${n} star">★</span>`
  ).join('');
}

function render() {
  const visible = filter === 'all' ? books : books.filter(b => b.status === filter);
  const list = document.getElementById('book-list');
  if (!visible.length) {
    list.innerHTML = '<div class="empty">No books here yet.</div>';
    return;
  }
  const sorted = [...visible].sort((a, b) => {
    const order = { reading: 0, want: 1, read: 2 };
    return (order[a.status] - order[b.status]) || a.title.localeCompare(b.title);
  });
  list.innerHTML = sorted.map(b => `
    <div class="book-card">
      <div class="book-info">
        <div class="book-title">${esc(b.title)}</div>
        ${b.author ? `<div class="book-author">${esc(b.author)}</div>` : ''}
        ${b.status === 'read' ? `<div class="star-rating">${stars(b.rating || 0, b.id)}</div>` : ''}
        ${b.notes ? `<div class="book-notes">${esc(b.notes)}</div>` : ''}
      </div>
      <div class="book-actions">
        <select class="status-select" data-id="${b.id}">
          <option value="want" ${b.status === 'want' ? 'selected' : ''}>Want to Read</option>
          <option value="reading" ${b.status === 'reading' ? 'selected' : ''}>Reading</option>
          <option value="read" ${b.status === 'read' ? 'selected' : ''}>Read</option>
        </select>
        <button class="del-btn" data-id="${b.id}" aria-label="Delete">×</button>
      </div>
    </div>`).join('');
}

document.getElementById('book-list').addEventListener('click', ev => {
  const star = ev.target.closest('.star');
  if (star) {
    const b = books.find(x => x.id === star.dataset.id);
    if (b) { b.rating = parseInt(star.dataset.star, 10); save(); render(); }
    return;
  }
  const del = ev.target.closest('.del-btn');
  if (del) {
    books = books.filter(x => x.id !== del.dataset.id);
    save(); render();
  }
});

document.getElementById('book-list').addEventListener('change', ev => {
  const sel = ev.target.closest('.status-select');
  if (!sel) return;
  const b = books.find(x => x.id === sel.dataset.id);
  if (b) { b.status = sel.value; save(); render(); }
});

document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    filter = tab.dataset.filter;
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    render();
  });
});

document.getElementById('add-btn').addEventListener('click', () => {
  const title = document.getElementById('b-title').value.trim();
  const author = document.getElementById('b-author').value.trim();
  const status = document.getElementById('b-status').value;
  const notes = document.getElementById('b-notes').value.trim();
  if (!title) return;
  books.push({ id: crypto.randomUUID(), title, author, status, notes, rating: 0 });
  save(); render();
  document.getElementById('b-title').value = '';
  document.getElementById('b-author').value = '';
  document.getElementById('b-notes').value = '';
  document.getElementById('b-title').focus();
});

document.getElementById('b-title').addEventListener('keydown', ev => {
  if (ev.key === 'Enter') document.getElementById('add-btn').click();
});

render();
