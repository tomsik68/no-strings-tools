let expenses = JSON.parse(localStorage.getItem('expense-log')) || [];

function save() { localStorage.setItem('expense-log', JSON.stringify(expenses)); }
function genId() { return Math.random().toString(36).slice(2, 9); }
function escHtml(t) { const d = document.createElement('div'); d.textContent = t; return d.innerHTML; }
function todayStr() { return new Date().toISOString().slice(0, 10); }
function thisMonthStr() { return new Date().toISOString().slice(0, 7); }

const CATS = {
  food:          { emoji: '🍔', label: 'Food' },
  transport:     { emoji: '🚌', label: 'Transport' },
  shopping:      { emoji: '🛍️', label: 'Shopping' },
  health:        { emoji: '💊', label: 'Health' },
  entertainment: { emoji: '🎬', label: 'Entertainment' },
  other:         { emoji: '📦', label: 'Other' },
};

function fmtDate(s) {
  return new Date(s + 'T00:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function render() {
  const sorted = [...expenses].sort((a, b) => b.date.localeCompare(a.date));
  const monthStr = thisMonthStr();
  const monthTotal = expenses.filter(e => e.date.startsWith(monthStr)).reduce((s, e) => s + e.amount, 0);
  const monthName = new Date().toLocaleDateString(undefined, { month: 'long' });

  const statsEl = document.getElementById('stats');
  statsEl.innerHTML = expenses.length > 0
    ? `<div class="month-stat"><span class="month-val">${monthTotal.toFixed(2)}</span><span class="month-lbl">spent in ${monthName}</span></div>`
    : '';

  const list = document.getElementById('expense-list');
  if (expenses.length === 0) {
    list.innerHTML = '<div class="empty">No expenses yet — log one below.</div>';
    return;
  }

  list.innerHTML = sorted.map(e => {
    const cat = CATS[e.category] || CATS.other;
    const label = e.note || cat.label;
    return `<div class="expense-row">
      <span class="expense-cat" title="${cat.label}">${cat.emoji}</span>
      <div class="expense-info">
        <span class="expense-note">${escHtml(label)}</span>
        <span class="expense-date">${fmtDate(e.date)}</span>
      </div>
      <span class="expense-amount">${e.amount.toFixed(2)}</span>
      <button class="del-btn" data-id="${e.id}" title="Delete">×</button>
    </div>`;
  }).join('');
}

function addExpense() {
  const amount = parseFloat(document.getElementById('e-amount').value);
  const category = document.getElementById('e-category').value;
  const note = document.getElementById('e-note').value.trim();
  const date = document.getElementById('e-date').value;
  if (!date || isNaN(amount) || amount <= 0) return;
  expenses.push({ id: genId(), date, amount, category, note });
  document.getElementById('e-amount').value = '';
  document.getElementById('e-note').value = '';
  save(); render();
  document.getElementById('e-amount').focus();
}

document.getElementById('add-btn').addEventListener('click', addExpense);
document.getElementById('e-note').addEventListener('keydown', e => { if (e.key === 'Enter') addExpense(); });
document.getElementById('expense-list').addEventListener('click', ev => {
  if (!ev.target.classList.contains('del-btn')) return;
  expenses = expenses.filter(e => e.id !== ev.target.dataset.id);
  save(); render();
});
document.getElementById('clear-btn').addEventListener('click', () => {
  if (expenses.length === 0) return;
  if (!confirm('Clear all expenses?')) return;
  expenses = [];
  save(); render();
});

document.getElementById('e-date').value = todayStr();
document.getElementById('e-amount').focus();
render();
