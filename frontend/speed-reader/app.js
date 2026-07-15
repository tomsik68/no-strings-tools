const textInput = document.getElementById("text-input");
const wpmInput = document.getElementById("wpm-input");
const startBtn = document.getElementById("start-btn");
const reader = document.getElementById("reader");
const wordEl = document.getElementById("word");
const progress = document.getElementById("progress");

textInput.focus();

let words = [];
let index = 0;
let running = false;
let paused = false;
let timer = null;

function wordDelay(word) {
  const base = 60000 / Math.min(1200, Math.max(60, Number(wpmInput.value) || 300));
  let factor = 1;
  if (word.length > 8) factor += 0.4; // long words need a beat more
  if (/[.!?;:]$/.test(word)) factor += 1; // pause at clause ends
  else if (/,$/.test(word)) factor += 0.4;
  return base * factor;
}

function showNext() {
  if (index >= words.length) {
    wordEl.textContent = "✓ Done";
    progress.style.width = "100%";
    timer = setTimeout(exit, 1200);
    return;
  }
  const word = words[index++];
  wordEl.textContent = word;
  progress.style.width = (index / words.length) * 100 + "%";
  timer = setTimeout(showNext, wordDelay(word));
}

function start() {
  words = textInput.value.split(/\s+/).filter(Boolean);
  if (!words.length) {
    textInput.focus();
    return;
  }
  index = 0;
  running = true;
  paused = false;
  reader.style.display = "block";
  showNext();
}

function exit() {
  running = false;
  clearTimeout(timer);
  reader.style.display = "none";
  startBtn.focus();
}

startBtn.addEventListener("click", start);

reader.addEventListener("click", () => {
  if (!running) return;
  paused = !paused;
  if (paused) {
    clearTimeout(timer);
    wordEl.textContent = "⏸ " + wordEl.textContent;
  } else {
    wordEl.textContent = wordEl.textContent.replace("⏸ ", "");
    timer = setTimeout(showNext, 300);
  }
});

document.addEventListener("keydown", (e) => {
  if (running && e.key === "Escape") exit();
});
