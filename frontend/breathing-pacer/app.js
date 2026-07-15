const circle = document.getElementById("circle");
const phaseLabel = document.getElementById("phase-label");
const phaseCount = document.getElementById("phase-count");
const toggleBtn = document.getElementById("toggle-btn");

const SECONDS = 4;
const PHASES = [
  { label: "Breathe in", scale: 1 },
  { label: "Hold", scale: 1 },
  { label: "Breathe out", scale: 0.55 },
  { label: "Hold", scale: 0.55 },
];

let running = false;
let phaseIndex = 0;
let countTimer = null;
let phaseTimer = null;

function startPhase() {
  const phase = PHASES[phaseIndex];
  phaseLabel.textContent = phase.label;
  circle.style.transition = `transform ${SECONDS}s ease-in-out`;
  circle.style.transform = `scale(${phase.scale})`;

  let count = SECONDS;
  phaseCount.textContent = count;
  countTimer = setInterval(() => {
    count--;
    if (count > 0) phaseCount.textContent = count;
  }, 1000);

  phaseTimer = setTimeout(() => {
    clearInterval(countTimer);
    phaseIndex = (phaseIndex + 1) % PHASES.length;
    startPhase();
  }, SECONDS * 1000);
}

function stop() {
  running = false;
  clearTimeout(phaseTimer);
  clearInterval(countTimer);
  circle.style.transition = "transform 1s ease-in-out";
  circle.style.transform = "scale(0.55)";
  phaseLabel.textContent = "";
  phaseCount.textContent = "";
  toggleBtn.textContent = "Start";
  toggleBtn.classList.replace("w3-red", "w3-green");
}

toggleBtn.addEventListener("click", () => {
  if (running) {
    stop();
  } else {
    running = true;
    phaseIndex = 0;
    toggleBtn.textContent = "Stop";
    toggleBtn.classList.replace("w3-green", "w3-red");
    startPhase();
  }
});

toggleBtn.focus();
