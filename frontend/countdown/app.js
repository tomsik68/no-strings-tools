const minutesInput = document.getElementById("minutes-input");
const secondsInput = document.getElementById("seconds-input");
const timerDisplay = document.getElementById("timer");
const startBtn = document.getElementById("start-btn");
const stopBtn = document.getElementById("stop-btn");
const resetBtn = document.getElementById("reset-btn");

let remaining = 0;
let running = false;
let interval = null;
let initialTime = 0;

minutesInput.addEventListener("change", updateDisplay);
secondsInput.addEventListener("change", updateDisplay);
startBtn.addEventListener("click", start);
stopBtn.addEventListener("click", stop);
resetBtn.addEventListener("click", reset);

function start() {
  if (running) return;

  const minutes = parseInt(minutesInput.value) || 0;
  const seconds = parseInt(secondsInput.value) || 0;
  remaining = minutes * 60 + seconds;

  if (remaining <= 0) {
    alert("Please set a time greater than 0");
    return;
  }

  initialTime = remaining;
  running = true;
  startBtn.style.display = "none";
  stopBtn.style.display = "inline-block";
  minutesInput.disabled = true;
  secondsInput.disabled = true;

  interval = setInterval(() => {
    remaining--;
    updateDisplay();

    if (remaining <= 0) {
      stop();
      playNotification();
    }
  }, 1000);
}

function stop() {
  running = false;
  clearInterval(interval);
  startBtn.style.display = "inline-block";
  stopBtn.style.display = "none";
  minutesInput.disabled = false;
  secondsInput.disabled = false;
}

function reset() {
  stop();
  minutesInput.value = 1;
  secondsInput.value = 0;
  remaining = 60;
  updateDisplay();
}

function updateDisplay() {
  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;

  timerDisplay.textContent = `00:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  if (remaining <= 10 && remaining > 0) {
    timerDisplay.classList.add("warning");
  } else {
    timerDisplay.classList.remove("warning");
  }
}

function playNotification() {
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  oscillator.frequency.value = 800;
  oscillator.type = "sine";

  gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 0.5);
}

updateDisplay();
