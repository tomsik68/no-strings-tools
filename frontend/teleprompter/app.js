const scriptInput = document.getElementById("script-input");
const startBtn = document.getElementById("start-btn");
const mirrorCheck = document.getElementById("mirror-check");
const prompter = document.getElementById("prompter");
const scroll = document.getElementById("scroll");
const controls = document.getElementById("controls");
const pausedHint = document.getElementById("paused-hint");
const speedRange = document.getElementById("speed-range");
const exitBtn = document.getElementById("exit-btn");

const SCRIPT_KEY = "teleprompter-script";
const SPEED_KEY = "teleprompter-speed";

scriptInput.value = localStorage.getItem(SCRIPT_KEY) || "";
speedRange.value = localStorage.getItem(SPEED_KEY) || "50";
scriptInput.focus();

let running = false;
let paused = false;
let offset = 0;
let lastFrame = 0;
let rafId = null;

scriptInput.addEventListener("input", () => localStorage.setItem(SCRIPT_KEY, scriptInput.value));
speedRange.addEventListener("input", () => localStorage.setItem(SPEED_KEY, speedRange.value));

function frame(now) {
  if (!running) return;
  if (!paused) {
    offset += (Number(speedRange.value) * (now - lastFrame)) / 1000; // px per second
    const mirror = mirrorCheck.checked ? " scaleX(-1)" : "";
    scroll.style.transform = `translateY(${-offset}px)${mirror}`;
    if (offset > scroll.offsetHeight - window.innerHeight / 2) exit(); // reached the end
  }
  lastFrame = now;
  rafId = requestAnimationFrame(frame);
}

function start() {
  if (!scriptInput.value.trim()) {
    scriptInput.focus();
    return;
  }
  running = true;
  paused = false;
  offset = 0;
  scroll.textContent = scriptInput.value;
  scroll.style.transform = "translateY(0)";
  prompter.style.display = "block";
  controls.style.display = "";
  pausedHint.style.display = "none";
  lastFrame = performance.now();
  rafId = requestAnimationFrame(frame);
}

function exit() {
  running = false;
  cancelAnimationFrame(rafId);
  prompter.style.display = "none";
  controls.style.display = "none";
  pausedHint.style.display = "none";
  startBtn.focus();
}

startBtn.addEventListener("click", start);
exitBtn.addEventListener("click", exit);

prompter.addEventListener("click", () => {
  paused = !paused;
  pausedHint.style.display = paused ? "" : "none";
});

document.addEventListener("keydown", (e) => {
  if (!running) return;
  if (e.key === "Escape") exit();
  if (e.key === " ") {
    e.preventDefault();
    paused = !paused;
    pausedHint.style.display = paused ? "" : "none";
  }
});
