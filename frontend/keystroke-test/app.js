const testArea = document.getElementById("test-area");
const mainDisplay = document.getElementById("main-display");
const kpmEl = document.getElementById("kpm");
const totalEl = document.getElementById("total");
const wpmEl = document.getElementById("wpm");
const resetBtn = document.getElementById("reset-btn");
const pressedKeysEl = document.getElementById("pressed-keys");
const ghostHint = document.getElementById("ghost-hint");

const WINDOW_MS = 1000;
let timestamps = [];
let total = 0;
let pressed = new Set();

function update() {
  const now = performance.now();
  timestamps = timestamps.filter(t => now - t <= WINDOW_MS);
  const kps = timestamps.length / (WINDOW_MS / 1000);
  const kpm = Math.round(kps * 60);
  const wpm = Math.round(kpm / 5); // rough word = 5 chars
  mainDisplay.textContent = kps.toFixed(1);
  kpmEl.textContent = kpm;
  totalEl.textContent = total;
  wpmEl.textContent = wpm;
}

function renderPressed() {
  pressedKeysEl.innerHTML = "";
  const keys = [...pressed].sort();
  ghostHint.style.display = keys.length > 2 ? "block" : "none";
  for (const key of keys) {
    const pill = document.createElement("span");
    pill.className = "key-pill";
    pill.textContent = key === " " ? "Space" : key;
    pressedKeysEl.appendChild(pill);
  }
}

testArea.addEventListener("keydown", e => {
  e.preventDefault();
  if (e.repeat) return;
  total++;
  timestamps.push(performance.now());
  pressed.add(e.key);
  update();
  renderPressed();
});

testArea.addEventListener("keyup", e => {
  e.preventDefault();
  pressed.delete(e.key);
  renderPressed();
});

testArea.addEventListener("blur", () => {
  testArea.classList.remove("active");
});

testArea.addEventListener("focus", () => {
  testArea.classList.add("active");
});

resetBtn.addEventListener("click", () => {
  timestamps = [];
  total = 0;
  pressed.clear();
  update();
  renderPressed();
  testArea.focus();
});

setInterval(update, 100);
testArea.focus();
