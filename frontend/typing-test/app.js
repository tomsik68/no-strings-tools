const targetEl = document.getElementById("target");
const input = document.getElementById("typing-input");
const timeLeftEl = document.getElementById("time-left");
const liveWpmEl = document.getElementById("live-wpm");
const resultEl = document.getElementById("result");
const finalWpmEl = document.getElementById("final-wpm");
const finalAccuracyEl = document.getElementById("final-accuracy");
const restartBtn = document.getElementById("restart-btn");

const TEXTS = [
  "The old lighthouse keeper climbed the spiral stairs every evening at dusk. He had done this for thirty years, and the rhythm of it was written into his bones. The lamp needed him, and in some quiet way he needed the lamp just as much.",
  "A good tool disappears in the hand. You stop thinking about the hammer and think only about the nail. Software should aspire to the same invisibility: no ceremony, no waiting, no decisions that the tool could have made for you.",
  "Rain moved across the valley in slow grey curtains while the river carried leaves toward the sea. Somewhere a dog barked twice and went silent. The afternoon smelled of wet stone and wood smoke, and nobody was in a hurry.",
  "Bread wants patience more than skill. Flour, water, salt, and time will do most of the work if you let them. The baker's real job is to stay out of the way and to notice when the dough is ready before the clock says so.",
  "The expedition packed light: two ropes, a week of food, and a map that was wrong in interesting ways. They knew the pass would be snowed in, and they went anyway, because the whole point of a mountain is that it argues back.",
];

const DURATION = 60;

let target = "";
let startTime = null;
let timer = null;
let finished = false;

function renderTarget(typed) {
  targetEl.innerHTML = "";
  const frag = document.createDocumentFragment();
  [...target].forEach((ch, i) => {
    const span = document.createElement("span");
    span.textContent = ch;
    if (i < typed.length) span.className = typed[i] === ch ? "ok" : "bad";
    else if (i === typed.length) span.className = "current";
    frag.append(span);
  });
  targetEl.append(frag);
}

function stats(typed) {
  let correct = 0;
  for (let i = 0; i < typed.length && i < target.length; i++) {
    if (typed[i] === target[i]) correct++;
  }
  const minutes = (Date.now() - startTime) / 60000;
  const wpm = minutes > 0 ? Math.round(correct / 5 / minutes) : 0;
  const accuracy = typed.length ? Math.round((correct / typed.length) * 100) : 100;
  return { wpm, accuracy };
}

function finish() {
  finished = true;
  clearInterval(timer);
  timer = null;
  input.disabled = true;
  const { wpm, accuracy } = stats(input.value);
  finalWpmEl.textContent = wpm;
  finalAccuracyEl.textContent = accuracy + "%";
  resultEl.style.display = "";
  restartBtn.focus();
}

function tick() {
  const elapsed = (Date.now() - startTime) / 1000;
  const left = Math.max(0, Math.ceil(DURATION - elapsed));
  timeLeftEl.textContent = left + "s";
  liveWpmEl.textContent = stats(input.value).wpm + " WPM";
  if (elapsed >= DURATION) finish();
}

function restart() {
  clearInterval(timer);
  timer = null;
  startTime = null;
  finished = false;
  target = TEXTS[Math.floor(Math.random() * TEXTS.length)];
  input.value = "";
  input.disabled = false;
  resultEl.style.display = "none";
  timeLeftEl.textContent = DURATION + "s";
  liveWpmEl.textContent = "0 WPM";
  renderTarget("");
  input.focus();
}

input.addEventListener("input", () => {
  if (finished) return;
  if (startTime === null) {
    startTime = Date.now();
    timer = setInterval(tick, 250);
  }
  renderTarget(input.value);
  if (input.value.length >= target.length) finish();
});

// Pasting would defeat the purpose
input.addEventListener("paste", (e) => e.preventDefault());

restartBtn.addEventListener("click", restart);
restart();
