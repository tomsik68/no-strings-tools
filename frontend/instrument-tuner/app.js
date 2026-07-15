const noteEl = document.getElementById("note");
const freqEl = document.getElementById("freq");
const centsEl = document.getElementById("cents");
const needle = document.getElementById("needle");
const startBtn = document.getElementById("start-btn");
const errorEl = document.getElementById("error");

const NOTE_NAMES = ["C", "C♯", "D", "D♯", "E", "F", "F♯", "G", "G♯", "A", "A♯", "B"];

let audioContext = null;
let analyser = null;
let running = false;

// Autocorrelation pitch detection (after Chris Wilson's PitchDetect)
function autoCorrelate(buf, sampleRate) {
  let size = buf.length;
  let rms = 0;
  for (let i = 0; i < size; i++) rms += buf[i] * buf[i];
  rms = Math.sqrt(rms / size);
  if (rms < 0.01) return -1; // too quiet

  // Trim leading/trailing silence for a cleaner correlation
  let start = 0;
  let end = size - 1;
  const threshold = 0.2;
  for (let i = 0; i < size / 2; i++) if (Math.abs(buf[i]) < threshold) { start = i; break; }
  for (let i = 1; i < size / 2; i++) if (Math.abs(buf[size - i]) < threshold) { end = size - i; break; }
  buf = buf.slice(start, end);
  size = buf.length;

  const c = new Float32Array(size);
  for (let lag = 0; lag < size; lag++) {
    for (let i = 0; i < size - lag; i++) c[lag] += buf[i] * buf[i + lag];
  }

  let d = 0;
  while (d < size - 1 && c[d] > c[d + 1]) d++;
  let maxVal = -1;
  let maxPos = -1;
  for (let i = d; i < size; i++) {
    if (c[i] > maxVal) {
      maxVal = c[i];
      maxPos = i;
    }
  }
  if (maxPos <= 0) return -1;

  // Parabolic interpolation around the peak
  let period = maxPos;
  const x1 = c[maxPos - 1];
  const x2 = c[maxPos];
  const x3 = c[maxPos + 1];
  const a = (x1 + x3 - 2 * x2) / 2;
  const b = (x3 - x1) / 2;
  if (a) period = maxPos - b / (2 * a);

  return sampleRate / period;
}

function update() {
  if (!running) return;
  const buf = new Float32Array(analyser.fftSize);
  analyser.getFloatTimeDomainData(buf);
  const freq = autoCorrelate(buf, audioContext.sampleRate);

  if (freq > 40 && freq < 5000) {
    const noteFloat = 12 * Math.log2(freq / 440) + 69;
    const noteNum = Math.round(noteFloat);
    const cents = Math.round((noteFloat - noteNum) * 100);
    const name = NOTE_NAMES[((noteNum % 12) + 12) % 12];
    const octave = Math.floor(noteNum / 12) - 1;

    noteEl.textContent = name + octave;
    noteEl.classList.toggle("in-tune", Math.abs(cents) <= 5);
    freqEl.textContent = freq.toFixed(1) + " Hz";
    centsEl.textContent =
      Math.abs(cents) <= 5 ? "✓ In tune" : cents > 0 ? `${cents} cents sharp` : `${-cents} cents flat`;
    needle.style.left = `${50 + Math.max(-50, Math.min(50, cents))}%`;
  }

  requestAnimationFrame(update);
}

startBtn.addEventListener("click", async () => {
  if (running) {
    running = false;
    startBtn.textContent = "🎤 Start tuning";
    noteEl.textContent = "—";
    freqEl.textContent = "";
    centsEl.textContent = "";
    return;
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
    });
    errorEl.style.display = "none";
    audioContext = audioContext || new (window.AudioContext || window.webkitAudioContext)();
    const source = audioContext.createMediaStreamSource(stream);
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 2048;
    source.connect(analyser);
    running = true;
    startBtn.textContent = "⏹ Stop";
    update();
  } catch (err) {
    console.error("[tuner] microphone error:", err);
    errorEl.textContent = "Microphone access needed — allow it and try again";
    errorEl.style.display = "block";
  }
});
