const startBtn = document.getElementById("start-btn");
const stopBtn = document.getElementById("stop-btn");
const tempoSlider = document.getElementById("tempo-slider");
const tempoDisplay = document.getElementById("tempo-display");
const tempoMinus = document.getElementById("tempo-minus");
const tempoPlus = document.getElementById("tempo-plus");
const beatIndicator = document.getElementById("beat-indicator");

const audioContext = new (window.AudioContext || window.webkitAudioContext)();
let isPlaying = false;
let nextNoteTime = 0;
let scheduleAheadTime = 0.1;
let lookAhead = 25;
let schedulerId = null;

startBtn.addEventListener("click", toggleStart);
stopBtn.addEventListener("click", toggleStart);
tempoSlider.addEventListener("input", updateTempo);
tempoMinus.addEventListener("click", () => {
  tempoSlider.value = Math.max(40, parseInt(tempoSlider.value) - 5);
  updateTempo();
});
tempoPlus.addEventListener("click", () => {
  tempoSlider.value = Math.min(240, parseInt(tempoSlider.value) + 5);
  updateTempo();
});

function updateTempo() {
  tempoDisplay.textContent = tempoSlider.value;
}

function toggleStart() {
  isPlaying = !isPlaying;
  if (isPlaying) {
    nextNoteTime = audioContext.currentTime;
    scheduler();
    startBtn.style.display = "none";
    stopBtn.style.display = "inline-block";
  } else {
    clearTimeout(schedulerId);
    beatIndicator.classList.remove("active");
    startBtn.style.display = "inline-block";
    stopBtn.style.display = "none";
  }
}

function scheduler() {
  while (nextNoteTime < audioContext.currentTime + scheduleAheadTime) {
    scheduleNote(nextNoteTime);
    nextNoteTime += 60 / parseInt(tempoSlider.value);
  }
  schedulerId = setTimeout(scheduler, lookAhead);
}

function scheduleNote(time) {
  const osc = audioContext.createOscillator();
  const gain = audioContext.createGain();

  osc.connect(gain);
  gain.connect(audioContext.destination);

  osc.frequency.value = 1000;
  osc.type = "sine";

  gain.gain.setValueAtTime(0.3, time);
  gain.gain.exponentialRampToValueAtTime(0.01, time + 0.1);

  osc.start(time);
  osc.stop(time + 0.1);

  // Haptic tick on phones, timed to the audio clock
  if (navigator.vibrate) {
    setTimeout(() => navigator.vibrate(30), Math.max(0, (time - audioContext.currentTime) * 1000));
  }

  beatIndicator.classList.remove("active");
  setTimeout(() => {
    beatIndicator.classList.add("active");
  }, 10);

  setTimeout(() => {
    beatIndicator.classList.remove("active");
  }, 100);
}

updateTempo();
