const KEY = "flashcards";
let cards = JSON.parse(localStorage.getItem(KEY) || "[]");
let queue = [...cards.map((_, i) => i)];
let idx = 0;
let flipped = false;

const save = () => localStorage.setItem(KEY, JSON.stringify(cards));
const esc = (t) => { const d = document.createElement("div"); d.textContent = t ?? ""; return d.innerHTML; };

function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function current() {
  if (!queue.length) return null;
  return cards[queue[idx]];
}

function renderStudy() {
  const c = current();
  const text = document.getElementById("card-text");
  const actions = document.getElementById("actions");
  const progress = document.getElementById("progress");
  const hint = document.getElementById("hint");

  if (!cards.length) {
    text.textContent = "Add cards below to start";
    actions.hidden = true;
    progress.textContent = "";
    hint.hidden = true;
    return;
  }
  if (!queue.length) {
    text.textContent = "Deck done 🎉";
    actions.hidden = true;
    progress.textContent = "All cards marked known this round";
    hint.hidden = true;
    return;
  }
  text.textContent = flipped ? c.back : c.front;
  actions.hidden = !flipped;
  progress.textContent = `${queue.length} left this round`;
  hint.hidden = flipped;
  hint.textContent = "Tap card to flip";
}

function renderList() {
  const list = document.getElementById("card-list");
  if (!cards.length) {
    list.innerHTML = "";
    return;
  }
  list.innerHTML = cards.map((c, i) => `
    <div class="w3-panel w3-white w3-round w3-border" style="padding:8px 12px;margin:0 0 6px;display:flex;gap:8px;align-items:center;">
      <div style="flex:1;min-width:0;font-size:13px;"><strong>${esc(c.front)}</strong> → ${esc(c.back)}</div>
      <button class="w3-button w3-small del" data-i="${i}" aria-label="Delete">×</button>
    </div>`).join("");
}

function render() {
  renderStudy();
  renderList();
}

document.getElementById("card").addEventListener("click", () => {
  if (!current()) {
    if (cards.length) {
      queue = shuffle(cards.map((_, i) => i));
      idx = 0;
      flipped = false;
      renderStudy();
    }
    return;
  }
  flipped = !flipped;
  renderStudy();
});

document.getElementById("know-btn").addEventListener("click", () => {
  queue.splice(idx, 1);
  if (idx >= queue.length) idx = 0;
  flipped = false;
  renderStudy();
});

document.getElementById("again-btn").addEventListener("click", () => {
  idx = (idx + 1) % queue.length;
  flipped = false;
  renderStudy();
});

document.getElementById("add-card").addEventListener("click", () => {
  const front = document.getElementById("front").value.trim();
  const back = document.getElementById("back").value.trim();
  if (!front || !back) return;
  cards.push({ front, back });
  save();
  queue = shuffle(cards.map((_, i) => i));
  idx = 0;
  flipped = false;
  document.getElementById("front").value = "";
  document.getElementById("back").value = "";
  document.getElementById("front").focus();
  render();
});

document.getElementById("card-list").addEventListener("click", (e) => {
  const btn = e.target.closest(".del");
  if (!btn) return;
  cards.splice(parseInt(btn.dataset.i, 10), 1);
  save();
  queue = shuffle(cards.map((_, i) => i));
  idx = 0;
  flipped = false;
  render();
});

document.getElementById("back").addEventListener("keydown", (e) => {
  if (e.key === "Enter") document.getElementById("add-card").click();
});

render();
