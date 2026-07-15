const setupForm = document.getElementById("setup");
const workInput = document.getElementById("work-input");
const restInput = document.getElementById("rest-input");
const roundsInput = document.getElementById("rounds-input");
const display = document.getElementById("display");
const phaseName = document.getElementById("phase-name");
const phaseTime = document.getElementById("phase-time");
const phaseRound = document.getElementById("phase-round");
const runControls = document.getElementById("run-controls");
const pauseBtn = document.getElementById("pause-btn");
const stopBtn = document.getElementById("stop-btn");

const STORAGE_KEY = "interval-timer-settings";
const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
if (saved) {
  workInput.value = saved.work;
  restInput.value = saved.rest;
  roundsInput.value = saved.rounds;
}

let settings = null;
let phase = null; // "prep" | "work" | "rest" | "done"
let round = 1;
let endTime = 0;
let remainingOnPause = 0;
let paused = false;
let timer = null;
let lastBeepSecond = null;
let wakeLock = null;
let audioCtx = null;

function beep(freq, durationMs, when = 0) {
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.frequency.value = freq;
  gain.gain.value = 0.3;
  osc.connect(gain).connect(audioCtx.destination);
  osc.start(audioCtx.currentTime + when);
  osc.stop(audioCtx.currentTime + when + durationMs / 1000);
}

function setPhase(name, seconds) {
  phase = name;
  endTime = Date.now() + seconds * 1000;
  lastBeepSecond = null;
  display.className = "phase-display " + name;
  phaseName.textContent = { prep: "Get ready", work: "Work", rest: "Rest", done: "Done!" }[name];
  phaseRound.textContent = `Round ${round} / ${settings.rounds}`;
}

function nextPhase() {
  if (phase === "prep") {
    beep(880, 150);
    beep(880, 150, 0.25);
    setPhase("work", settings.work);
  } else if (phase === "work") {
    if (round >= settings.rounds) return finish();
    if (settings.rest > 0) {
      beep(440, 300);
      setPhase("rest", settings.rest);
    } else {
      round++;
      beep(880, 150);
      beep(880, 150, 0.25);
      setPhase("work", settings.work);
    }
  } else if (phase === "rest") {
    round++;
    beep(880, 150);
    beep(880, 150, 0.25);
    setPhase("work", settings.work);
  }
}

function finish() {
  beep(880, 900);
  clearInterval(timer);
  timer = null;
  setPhase("done", 0);
  phaseTime.textContent = "🎉";
  runControls.style.display = "none";
  setupForm.style.display = "";
  releaseWakeLock();
}

function tick() {
  const remaining = endTime - Date.now();
  if (remaining <= 0) {
    nextPhase();
    return;
  }
  const secs = Math.ceil(remaining / 1000);
  phaseTime.textContent = secs;
  // Short warning beeps during the final 3 seconds of each phase
  if (secs <= 3 && secs !== lastBeepSecond && phase !== "prep") {
    lastBeepSecond = secs;
    beep(660, 100);
  }
}

async function requestWakeLock() {
  try {
    wakeLock = await navigator.wakeLock.request("screen");
  } catch {
    wakeLock = null; // unsupported or denied; timer still works
  }
}

function releaseWakeLock() {
  wakeLock?.release();
  wakeLock = null;
}

setupForm.addEventListener("submit", (e) => {
  e.preventDefault();
  settings = {
    work: Number(workInput.value),
    rest: Number(restInput.value),
    rounds: Number(roundsInput.value),
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  audioCtx = audioCtx || new AudioContext();
  audioCtx.resume();
  round = 1;
  paused = false;
  pauseBtn.textContent = "Pause";
  setupForm.style.display = "none";
  display.style.display = "";
  runControls.style.display = "";
  setPhase("prep", 3);
  clearInterval(timer);
  timer = setInterval(tick, 100);
  tick();
  requestWakeLock();
});

pauseBtn.addEventListener("click", () => {
  if (phase === "done") return;
  paused = !paused;
  if (paused) {
    remainingOnPause = endTime - Date.now();
    clearInterval(timer);
    timer = null;
    pauseBtn.textContent = "Resume";
  } else {
    endTime = Date.now() + remainingOnPause;
    timer = setInterval(tick, 100);
    pauseBtn.textContent = "Pause";
  }
});

stopBtn.addEventListener("click", () => {
  clearInterval(timer);
  timer = null;
  display.style.display = "none";
  runControls.style.display = "none";
  setupForm.style.display = "";
  releaseWakeLock();
});

workInput.focus();
