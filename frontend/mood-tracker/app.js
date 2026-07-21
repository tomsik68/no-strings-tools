let moods = JSON.parse(localStorage.getItem('mood-tracker')) || {};

function save() { localStorage.setItem('mood-tracker', JSON.stringify(moods)); }
function todayStr() { return new Date().toISOString().slice(0, 10); }

const MOODS = [
  { emoji: '😢', label: 'Rough', color: '#ef5350' },
  { emoji: '😕', label: 'Low',   color: '#ffa726' },
  { emoji: '😐', label: 'Okay',  color: '#fdd835' },
  { emoji: '🙂', label: 'Good',  color: '#66bb6a' },
  { emoji: '😄', label: 'Great', color: '#43a047' },
];

const moodBtns = [...document.querySelectorAll('.mood-btn')];

function render() {
  const today = todayStr();
  const entry = moods[today];
  const selected = entry ? entry.mood : null;

  document.getElementById('date-label').textContent =
    new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });

  moodBtns.forEach((btn, i) => {
    const active = i + 1 === selected;
    btn.classList.toggle('selected', active);
    btn.style.borderColor = active ? MOODS[i].color : '#eee';
    btn.style.background = active ? MOODS[i].color + '22' : '';
  });

  const noteWrap = document.getElementById('note-wrap');
  const noteEl = document.getElementById('mood-note');
  noteWrap.hidden = selected === null;
  if (entry && document.activeElement !== noteEl) noteEl.value = entry.note || '';

  const history = document.getElementById('mood-history');
  const days = Array.from({ length: 30 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (29 - i));
    return d.toISOString().slice(0, 10);
  });
  history.innerHTML = days.map(date => {
    const m = moods[date];
    const bg = m ? MOODS[m.mood - 1].color : '#e8e8e8';
    const tip = m ? `${date}: ${MOODS[m.mood - 1].label}${m.note ? ' — ' + m.note : ''}` : date;
    const cls = date === today ? ' today' : '';
    return `<div class="mood-dot${cls}" style="background:${bg}" title="${tip}"></div>`;
  }).join('');
}

moodBtns.forEach((btn, i) => {
  btn.addEventListener('click', () => {
    const today = todayStr();
    const note = moods[today]?.note || '';
    moods[today] = { mood: i + 1, note };
    save(); render();
  });
});

document.getElementById('mood-note').addEventListener('input', e => {
  const today = todayStr();
  if (moods[today]) { moods[today].note = e.target.value; save(); }
});

render();
