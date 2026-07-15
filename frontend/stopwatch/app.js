const timerDisplay = document.getElementById("timer");
const startBtn = document.getElementById("start-btn");
const stopBtn = document.getElementById("stop-btn");
const resetBtn = document.getElementById("reset-btn");

let elapsed = 0;
let running = false;
let interval = null;

startBtn.addEventListener("click", start);
stopBtn.addEventListener("click", stop);
resetBtn.addEventListener("click", reset);

function start() {
  if (running) return;
  running = true;
  startBtn.style.display = "none";
  stopBtn.style.display = "inline-block";

  const startTime = Date.now() - elapsed * 1000;

  interval = setInterval(() => {
    elapsed = Math.floor((Date.now() - startTime) / 1000);
    updateDisplay();
  }, 10);
}

function stop() {
  running = false;
  clearInterval(interval);
  startBtn.style.display = "inline-block";
  stopBtn.style.display = "none";
}

function reset() {
  stop();
  elapsed = 0;
  updateDisplay();
}

function updateDisplay() {
  const hours = Math.floor(elapsed / 3600);
  const minutes = Math.floor((elapsed % 3600) / 60);
  const seconds = elapsed % 60;

  timerDisplay.textContent = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

updateDisplay();
