const clockDisplay = document.getElementById("clock-display");
const dateDisplay = document.getElementById("date-display");
const announceBtn = document.getElementById("announce-btn");
const stopBtn = document.getElementById("stop-btn");
const autoAnnounce = document.getElementById("auto-announce");
const intervalInput = document.getElementById("interval-input");
const intervalSelect = document.getElementById("interval-select");

const synth = window.speechSynthesis;
let lastAnnounceTime = null;
let updateInterval = null;

announceBtn.addEventListener("click", () => {
  announceTime();
  announceBtn.style.display = "none";
  stopBtn.style.display = "inline-block";
});

stopBtn.addEventListener("click", () => {
  synth.cancel();
  announceBtn.style.display = "inline-block";
  stopBtn.style.display = "none";
});

autoAnnounce.addEventListener("change", () => {
  if (autoAnnounce.checked) {
    lastAnnounceTime = null;
  }
});

function updateClock() {
  const now = new Date();

  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");

  clockDisplay.textContent = `${hours}:${minutes}:${seconds}`;
  dateDisplay.textContent = now.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Auto-announce logic
  if (autoAnnounce.checked) {
    const intervalNum = parseInt(intervalInput.value) || 1;
    const intervalUnit = intervalSelect.value;

    if (intervalUnit === "minute") {
      if (lastAnnounceTime === null || now - lastAnnounceTime >= intervalNum * 60 * 1000) {
        announceTime();
        lastAnnounceTime = now;
      }
    } else if (intervalUnit === "hour") {
      if (lastAnnounceTime === null || now - lastAnnounceTime >= intervalNum * 60 * 60 * 1000) {
        announceTime();
        lastAnnounceTime = now;
      }
    }
  }
}

function announceTime() {
  synth.cancel();

  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const ampm = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 || 12;

  let timeText = `It is ${displayHours}`;

  if (minutes > 0) {
    timeText += ` ${minutes}`;
  }

  timeText += ` ${ampm}`;

  const utterance = new SpeechSynthesisUtterance(timeText);
  utterance.rate = 0.9;

  synth.speak(utterance);
}

updateClock();
updateInterval = setInterval(updateClock, 1000);
