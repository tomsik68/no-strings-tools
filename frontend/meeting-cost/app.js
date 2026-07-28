const peopleEl = document.getElementById("people");
const rateEl = document.getElementById("rate");
const costEl = document.getElementById("cost");
const elapsedEl = document.getElementById("elapsed");
const burnEl = document.getElementById("burn");
const startBtn = document.getElementById("start-btn");
const pauseBtn = document.getElementById("pause-btn");
const resetBtn = document.getElementById("reset-btn");

let running = false;
let startTs = 0;
let accumulated = 0; // ms from before current run segment

const pad = (n) => String(n).padStart(2, "0");

function elapsedMs() {
  return accumulated + (running ? Date.now() - startTs : 0);
}

function fmtHMS(ms) {
  const s = Math.floor(ms / 1000);
  return `${Math.floor(s / 3600)}:${pad(Math.floor((s % 3600) / 60))}:${pad(s % 60)}`;
}

function burnPerMinute() {
  const p = parseFloat(peopleEl.value) || 0;
  const r = parseFloat(rateEl.value) || 0;
  return (p * r) / 60;
}

function tick() {
  const ms = elapsedMs();
  const p = parseFloat(peopleEl.value) || 0;
  const r = parseFloat(rateEl.value) || 0;
  const cost = (p * r * ms) / 3600000;
  costEl.textContent = "€" + cost.toFixed(2);
  elapsedEl.textContent = fmtHMS(ms);
  burnEl.textContent = "€" + burnPerMinute().toFixed(2) + " / minute";
}

startBtn.addEventListener("click", () => {
  running = true;
  startTs = Date.now();
  startBtn.style.display = "none";
  pauseBtn.style.display = "";
  resetBtn.style.display = "";
});

pauseBtn.addEventListener("click", () => {
  running = false;
  accumulated += Date.now() - startTs;
  pauseBtn.style.display = "none";
  startBtn.textContent = "Resume";
  startBtn.style.display = "";
  tick();
});

resetBtn.addEventListener("click", () => {
  running = false;
  accumulated = 0;
  startTs = 0;
  startBtn.textContent = "Start";
  startBtn.style.display = "";
  pauseBtn.style.display = "none";
  resetBtn.style.display = "none";
  tick();
});

peopleEl.addEventListener("input", tick);
rateEl.addEventListener("input", tick);

setInterval(() => { if (running) tick(); }, 200);
peopleEl.focus();
tick();
