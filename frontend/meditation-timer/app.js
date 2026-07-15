const timerDisplay = document.getElementById("timer-display");
const startBtn = document.getElementById("start-btn");
const pauseBtn = document.getElementById("pause-btn");
const resumeBtn = document.getElementById("resume-btn");
const resetBtn = document.getElementById("reset-btn");
const customSlider = document.getElementById("custom-slider");
const sliderValue = document.getElementById("slider-value");
const status = document.getElementById("status");
const presetsContainer = document.getElementById("presets");

const presets = [1, 3, 5, 10, 15, 20, 30, 60];

let totalSeconds = 5 * 60;
let remainingSeconds = totalSeconds;
let isRunning = false;
let isPaused = false;
let intervalId = null;

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

function updateDisplay() {
  timerDisplay.textContent = formatTime(remainingSeconds);
}

function updateStatus(text) {
  status.textContent = text;
}

function start() {
  if (isRunning) return;
  isRunning = true;
  isPaused = false;
  startBtn.style.display = "none";
  pauseBtn.style.display = "inline-block";
  customSlider.disabled = true;
  document.querySelectorAll(".preset-btn").forEach(btn => btn.disabled = true);

  updateStatus("🧘 Meditating...");

  intervalId = setInterval(() => {
    remainingSeconds--;
    updateDisplay();

    if (remainingSeconds <= 0) {
      complete();
    }
  }, 1000);
}

function pause() {
  clearInterval(intervalId);
  isRunning = false;
  isPaused = true;
  pauseBtn.style.display = "none";
  resumeBtn.style.display = "inline-block";
  updateStatus("⏸️ Paused");
}

function resume() {
  start();
  resumeBtn.style.display = "none";
  pauseBtn.style.display = "inline-block";
  updateStatus("🧘 Meditating...");
}

function reset() {
  clearInterval(intervalId);
  isRunning = false;
  isPaused = false;
  remainingSeconds = totalSeconds;
  updateDisplay();
  startBtn.style.display = "inline-block";
  pauseBtn.style.display = "none";
  resumeBtn.style.display = "none";
  customSlider.disabled = false;
  document.querySelectorAll(".preset-btn").forEach(btn => btn.disabled = false);
  updateStatus("Ready");
}

function complete() {
  clearInterval(intervalId);
  isRunning = false;
  updateDisplay();
  startBtn.style.display = "inline-block";
  pauseBtn.style.display = "none";
  resumeBtn.style.display = "none";
  customSlider.disabled = false;
  document.querySelectorAll(".preset-btn").forEach(btn => btn.disabled = false);
  updateStatus("✓ Session complete! Namaste 🙏");

  // Play bell sound
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const osc = audioContext.createOscillator();
  const gain = audioContext.createGain();
  osc.connect(gain);
  gain.connect(audioContext.destination);
  osc.frequency.value = 528; // Meditative frequency
  osc.type = "sine";
  gain.gain.setValueAtTime(0.3, audioContext.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 2);
  osc.start(audioContext.currentTime);
  osc.stop(audioContext.currentTime + 2);
}

// Preset buttons
presets.forEach(minutes => {
  const btn = document.createElement("button");
  btn.className = "preset-btn";
  btn.textContent = `${minutes}m`;
  btn.addEventListener("click", () => {
    totalSeconds = minutes * 60;
    remainingSeconds = totalSeconds;
    updateDisplay();
    reset();
    document.querySelectorAll(".preset-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    customSlider.value = minutes;
    sliderValue.textContent = `${minutes} minute${minutes > 1 ? "s" : ""}`;
  });
  presetsContainer.appendChild(btn);
});

customSlider.addEventListener("input", (e) => {
  const minutes = parseInt(e.target.value);
  totalSeconds = minutes * 60;
  remainingSeconds = totalSeconds;
  updateDisplay();
  sliderValue.textContent = `${minutes} minute${minutes > 1 ? "s" : ""}`;
  document.querySelectorAll(".preset-btn").forEach(btn => btn.classList.remove("active"));
});

startBtn.addEventListener("click", start);
pauseBtn.addEventListener("click", pause);
resumeBtn.addEventListener("click", resume);
resetBtn.addEventListener("click", reset);

// Activate first preset
document.querySelector(".preset-btn").classList.add("active");
updateDisplay();
