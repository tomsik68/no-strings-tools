const levelEl = document.getElementById("level");
const peakEl = document.getElementById("peak");
const barEl = document.getElementById("bar");
const peakMark = document.getElementById("peak-mark");
const toggleBtn = document.getElementById("toggle-btn");
const errorEl = document.getElementById("error");

const FLOOR_DB = -60; // quieter than this displays as silence

let stream = null;
let audioCtx = null;
let rafId = null;
let peakDb = -Infinity;

function dbToPercent(db) {
  return Math.min(100, Math.max(0, ((db - FLOOR_DB) / -FLOOR_DB) * 100));
}

async function start() {
  errorEl.style.display = "none";
  try {
    // Raw levels: disable the processing browsers apply for voice calls
    stream = await navigator.mediaDevices.getUserMedia({
      audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
    });
  } catch {
    errorEl.textContent = "Microphone access is needed to measure sound";
    errorEl.style.display = "block";
    return;
  }

  audioCtx = new AudioContext();
  const analyser = audioCtx.createAnalyser();
  analyser.fftSize = 2048;
  audioCtx.createMediaStreamSource(stream).connect(analyser);
  const samples = new Float32Array(analyser.fftSize);
  peakDb = -Infinity;

  function tick() {
    analyser.getFloatTimeDomainData(samples);
    let sum = 0;
    for (const s of samples) sum += s * s;
    const rms = Math.sqrt(sum / samples.length);
    const db = 20 * Math.log10(rms);

    if (db > peakDb) peakDb = db;
    levelEl.textContent = db < FLOOR_DB ? "–∞" : db.toFixed(1);
    peakEl.textContent = peakDb < FLOOR_DB ? "–∞" : peakDb.toFixed(1);
    const pct = dbToPercent(db);
    barEl.style.width = `${pct}%`;
    barEl.style.background = db > -6 ? "#f44336" : db > -18 ? "#ff9800" : "#4caf50";
    peakMark.style.left = `${dbToPercent(peakDb)}%`;
    rafId = requestAnimationFrame(tick);
  }
  tick();

  toggleBtn.textContent = "⏹ Stop";
  toggleBtn.classList.replace("w3-blue", "w3-red");
}

function stop() {
  cancelAnimationFrame(rafId);
  stream.getTracks().forEach((t) => t.stop());
  audioCtx.close();
  stream = null;
  toggleBtn.textContent = "🎙 Start listening";
  toggleBtn.classList.replace("w3-red", "w3-blue");
}

toggleBtn.addEventListener("click", () => (stream ? stop() : start()));
