const zones = [document.getElementById("zone-top"), document.getElementById("zone-bottom")];
const pauseBtn = document.getElementById("pause-btn");
const resetBtn = document.getElementById("reset-btn");

let baseMs = 5 * 60 * 1000;
let times = [baseMs, baseMs];
let active = null; // 0 = top, 1 = bottom, null = not running
let paused = false;
let flagged = false;
let lastTick = 0;
let timer = null;

function fmt(ms) {
  ms = Math.max(0, ms);
  if (ms < 20000) return (ms / 1000).toFixed(1);
  const t = Math.ceil(ms / 1000);
  return Math.floor(t / 60) + ":" + String(t % 60).padStart(2, "0");
}

function render() {
  zones.forEach((z, i) => {
    z.textContent = fmt(times[i]);
    z.classList.toggle("active", active === i && !paused && !flagged);
    z.classList.toggle("flagged", flagged && times[i] <= 0);
  });
  pauseBtn.textContent = paused ? "Resume" : "Pause";
}

function tick() {
  const now = Date.now();
  times[active] -= now - lastTick;
  lastTick = now;
  if (times[active] <= 0) {
    times[active] = 0;
    flagged = true;
    clearInterval(timer);
    timer = null;
  }
  render();
}

function startTimer() {
  lastTick = Date.now();
  clearInterval(timer);
  timer = setInterval(tick, 100);
}

// Tapping your own clock ends your turn and starts the opponent's clock.
function tap(i) {
  if (flagged || paused) return;
  if (active === null) {
    active = 1 - i;
    startTimer();
  } else if (active === i) {
    active = 1 - i;
    lastTick = Date.now();
  }
  render();
}

zones.forEach((z, i) => z.addEventListener("click", () => tap(i)));

pauseBtn.addEventListener("click", () => {
  if (active === null || flagged) return;
  paused = !paused;
  if (paused) {
    clearInterval(timer);
    timer = null;
  } else {
    startTimer();
  }
  render();
});

function reset() {
  clearInterval(timer);
  timer = null;
  times = [baseMs, baseMs];
  active = null;
  paused = false;
  flagged = false;
  render();
}

resetBtn.addEventListener("click", reset);

document.querySelectorAll(".preset").forEach((btn) => {
  btn.addEventListener("click", () => {
    baseMs = Number(btn.dataset.min) * 60 * 1000;
    reset();
  });
});

render();
