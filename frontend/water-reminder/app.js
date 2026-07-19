function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

let s = JSON.parse(localStorage.getItem('water-reminder')) || { goal: 8, date: '', count: 0 };

if (s.date !== todayStr()) {
  s.date = todayStr();
  s.count = 0;
  save();
}

function save() {
  localStorage.setItem('water-reminder', JSON.stringify(s));
}

function statusMsg() {
  const { count, goal } = s;
  if (count === 0) return 'Time to start hydrating!';
  if (count >= goal) return '🎉 Goal reached! Stay hydrated.';
  const rem = goal - count;
  if (rem === 1) return 'Just one more glass!';
  if (count >= goal * 0.5) return `Almost there — ${rem} more to go.`;
  return `Good start — ${rem} more to go.`;
}

function render() {
  const { count, goal } = s;

  document.getElementById('count').textContent = count;
  document.getElementById('goal-disp').textContent = goal;
  document.getElementById('goal-val').textContent = goal;
  document.getElementById('status').textContent = statusMsg();
  document.getElementById('undo-btn').hidden = count === 0;

  const bar = document.getElementById('bar');
  bar.value = Math.min(count, goal);
  bar.max = goal;

  const dropsEl = document.getElementById('drops');
  if (goal <= 20) {
    dropsEl.hidden = false;
    dropsEl.innerHTML = Array.from({ length: goal }, (_, i) =>
      `<div class="drop${i < count ? ' filled' : ''}"></div>`
    ).join('');
  } else {
    dropsEl.hidden = true;
  }
}

document.getElementById('drink-btn').addEventListener('click', () => {
  s.count++;
  save();
  render();
});

document.getElementById('undo-btn').addEventListener('click', () => {
  if (s.count > 0) { s.count--; save(); render(); }
});

document.getElementById('goal-minus').addEventListener('click', () => {
  if (s.goal > 1) { s.goal--; save(); render(); }
});

document.getElementById('goal-plus').addEventListener('click', () => {
  if (s.goal < 30) { s.goal++; save(); render(); }
});

render();
