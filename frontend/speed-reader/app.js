const textInput = document.getElementById("text-input");
const wpmInput = document.getElementById("wpm-input");
const chunkSizeInput = document.getElementById("chunk-size-input");
const startBtn = document.getElementById("start-btn");
const reader = document.getElementById("reader");
const wordEl = document.getElementById("word");
const nextEl = document.getElementById("next");
const progress = document.getElementById("progress");

textInput.focus();

let words = [];
let index = 0;
let chunkSize = 1;
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

function chunkDelay(chunk) {
  return chunk.reduce((sum, word) => sum + wordDelay(word), 0);
}

function currentChunk() {
  return words.slice(index, index + chunkSize);
}

function upcomingChunk() {
  return words.slice(index + chunkSize, index + 2 * chunkSize);
}

function render() {
  const chunk = currentChunk();
  wordEl.textContent = chunk.join(" ");
  const next = upcomingChunk();
  nextEl.textContent = next.length ? next.join(" ") : "";
  progress.style.width = (Math.min(index + chunk.length, words.length) / words.length) * 100 + "%";
}

function showNext() {
  if (index >= words.length) {
    wordEl.textContent = "✓ Done";
    nextEl.textContent = "";
    progress.style.width = "100%";
    timer = setTimeout(exit, 1200);
    return;
  }
  const chunk = currentChunk();
  index += chunk.length;
  render();
  timer = setTimeout(showNext, chunkDelay(chunk));
}

function start() {
  words = textInput.value.split(/\s+/).filter(Boolean);
  if (!words.length) {
    textInput.focus();
    return;
  }
  chunkSize = Math.min(5, Math.max(1, Math.round(Number(chunkSizeInput.value) || 1)));
  chunkSizeInput.value = chunkSize;
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
