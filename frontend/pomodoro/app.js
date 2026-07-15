const timerDisplay = document.getElementById("timer");
const phaseName = document.getElementById("phase-name");
const startBtn = document.getElementById("start-btn");
const stopBtn = document.getElementById("stop-btn");
const resetBtn = document.getElementById("reset-btn");
const sessionCountDisplay = document.getElementById("session-count");
const workMinutesInput = document.getElementById("work-minutes");
const sessionLogEl = document.getElementById("session-log");

const BREAK_TIME = 5 * 60;

let workMinutes = parseInt(localStorage.getItem("pomodoro-work-minutes")) || 25;
let remaining = workMinutes * 60;
let isWorkPhase = true;
let running = false;
let interval = null;
let sessionsCompleted = parseInt(localStorage.getItem("pomodoro-sessions")) || 0;
let sessionLog = JSON.parse(localStorage.getItem("pomodoro-log")) || [];

workMinutesInput.value = workMinutes;

startBtn.addEventListener("click", start);
stopBtn.addEventListener("click", stop);
resetBtn.addEventListener("click", reset);

workMinutesInput.addEventListener("input", () => {
  const value = parseInt(workMinutesInput.value);
  if (!value || value < 1 || value > 120) return;
  workMinutes = value;
  localStorage.setItem("pomodoro-work-minutes", workMinutes);
  // Takes effect immediately when idle in a work phase; otherwise next work phase
  if (!running && isWorkPhase) {
    remaining = workMinutes * 60;
    updateDisplay();
  }
});

function start() {
  if (running) return;
  running = true;
  startBtn.style.display = "none";
  stopBtn.style.display = "inline-block";

  interval = setInterval(() => {
    remaining--;
    updateDisplay();

    if (remaining <= 0) {
      playNotification();
      switchPhase();
    }
  }, 1000);
}

function stop() {
  running = false;
  clearInterval(interval);
  startBtn.style.display = "inline-block";
  stopBtn.style.display = "none";
}

function reset() {
  stop();
  isWorkPhase = true;
  remaining = workMinutes * 60;
  updateDisplay();
}

function switchPhase() {
  if (isWorkPhase) {
    sessionsCompleted++;
    localStorage.setItem("pomodoro-sessions", sessionsCompleted);
    sessionCountDisplay.textContent = sessionsCompleted;
    logSession();
    isWorkPhase = false;
    remaining = BREAK_TIME;
  } else {
    isWorkPhase = true;
    remaining = workMinutes * 60;
  }
  updateDisplay();
  start();
}

function logSession() {
  sessionLog.push({ ts: Date.now(), minutes: workMinutes });
  if (sessionLog.length > 50) sessionLog = sessionLog.slice(-50);
  localStorage.setItem("pomodoro-log", JSON.stringify(sessionLog));
  renderLog();
}

function renderLog() {
  sessionLogEl.innerHTML = "";
  if (sessionLog.length === 0) return;

  const header = document.createElement("div");
  header.style.cssText = "display:flex; justify-content:space-between; align-items:center;";
  const title = document.createElement("strong");
  title.textContent = "Recent sessions";
  const clearBtn = document.createElement("button");
  clearBtn.className = "w3-button w3-small w3-round w3-light-grey";
  clearBtn.textContent = "Clear log";
  clearBtn.addEventListener("click", () => {
    sessionLog = [];
    localStorage.setItem("pomodoro-log", "[]");
    renderLog();
  });
  header.append(title, clearBtn);
  sessionLogEl.appendChild(header);

  const list = document.createElement("ul");
  list.className = "w3-ul";
  for (const entry of sessionLog.slice(-10).reverse()) {
    const li = document.createElement("li");
    li.style.padding = "6px 0";
    const when = new Date(entry.ts).toLocaleString([], {
      month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
    });
    li.textContent = `${when} — ${entry.minutes} min work`;
    list.appendChild(li);
  }
  sessionLogEl.appendChild(list);
}

function updateDisplay() {
  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  timerDisplay.textContent = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  if (isWorkPhase) {
    phaseName.textContent = "Work";
    phaseName.className = "phase-name work";
  } else {
    phaseName.textContent = "Break";
    phaseName.className = "phase-name break";
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

sessionCountDisplay.textContent = sessionsCompleted;
updateDisplay();
renderLog();
