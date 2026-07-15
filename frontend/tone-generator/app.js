const freqInput = document.getElementById("freq-input");
const freqSlider = document.getElementById("freq-slider");
const playBtn = document.getElementById("play-btn");
const waveButtons = [...document.querySelectorAll(".wave-btn")];

let audioContext = null;
let oscillator = null;
let gain = null;
let wave = "sine";

// Slider is logarithmic: 0-1000 maps to 20 Hz - 20 kHz (3 decades)
const sliderToFreq = (v) => Math.round(20 * 10 ** ((3 * v) / 1000));
const freqToSlider = (f) => Math.round((1000 * Math.log10(f / 20)) / 3);

function currentFreq() {
  const f = parseFloat(freqInput.value);
  return isNaN(f) ? 440 : Math.min(20000, Math.max(20, f));
}

function applyFreq() {
  if (oscillator) {
    oscillator.frequency.setTargetAtTime(currentFreq(), audioContext.currentTime, 0.01);
  }
}

freqSlider.addEventListener("input", () => {
  freqInput.value = sliderToFreq(Number(freqSlider.value));
  applyFreq();
});

freqInput.addEventListener("input", () => {
  freqSlider.value = freqToSlider(currentFreq());
  applyFreq();
});

waveButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    waveButtons.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    wave = btn.dataset.wave;
    if (oscillator) oscillator.type = wave;
  });
});

function start() {
  if (!audioContext) audioContext = new (window.AudioContext || window.webkitAudioContext)();
  oscillator = audioContext.createOscillator();
  gain = audioContext.createGain();
  oscillator.type = wave;
  oscillator.frequency.value = currentFreq();
  gain.gain.setValueAtTime(0, audioContext.currentTime);
  gain.gain.linearRampToValueAtTime(0.2, audioContext.currentTime + 0.03);
  oscillator.connect(gain);
  gain.connect(audioContext.destination);
  oscillator.start();
  playBtn.textContent = "⏹ Stop";
  playBtn.classList.replace("w3-blue", "w3-red");
}

function stop() {
  gain.gain.setTargetAtTime(0, audioContext.currentTime, 0.02);
  const osc = oscillator;
  setTimeout(() => osc.stop(), 100);
  oscillator = null;
  playBtn.textContent = "▶ Play";
  playBtn.classList.replace("w3-red", "w3-blue");
}

playBtn.addEventListener("click", () => (oscillator ? stop() : start()));
freqInput.focus();
