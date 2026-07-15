const canvas = document.getElementById("trace");
const currentEl = document.getElementById("current");
const peakEl = document.getElementById("peak");
const toggleBtn = document.getElementById("toggle-btn");
const errorEl = document.getElementById("error");
const ctx = canvas.getContext("2d");

const MAX_SAMPLES = 400;
const samples = [];
let peak = 0;
let running = false;

function resize() {
  const rect = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  draw();
}

function draw() {
  const rect = canvas.getBoundingClientRect();
  ctx.clearRect(0, 0, rect.width, rect.height);
  const scale = Math.max(2, peak); // autoscale, min 2 m/s² so noise stays small
  ctx.strokeStyle = "#4caf50";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  samples.forEach((v, i) => {
    const x = (i / (MAX_SAMPLES - 1)) * rect.width;
    const y = rect.height - 4 - (Math.min(v, scale) / scale) * (rect.height - 8);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.stroke();
}

function onMotion(event) {
  // acceleration (gravity removed) where available; otherwise subtract ~1g
  const a = event.acceleration?.x != null ? event.acceleration : null;
  const g = event.accelerationIncludingGravity;
  const magnitude = a
    ? Math.hypot(a.x, a.y, a.z)
    : g && g.x != null
      ? Math.abs(Math.hypot(g.x, g.y, g.z) - 9.81)
      : 0;

  samples.push(magnitude);
  if (samples.length > MAX_SAMPLES) samples.shift();
  if (magnitude > peak) peak = magnitude;
  currentEl.textContent = magnitude.toFixed(2);
  peakEl.textContent = peak.toFixed(2);
  draw();
}

async function start() {
  errorEl.style.display = "none";
  // iOS gates motion events behind an explicit permission prompt
  if (typeof DeviceMotionEvent !== "undefined" && typeof DeviceMotionEvent.requestPermission === "function") {
    try {
      if ((await DeviceMotionEvent.requestPermission()) !== "granted") throw new Error();
    } catch {
      errorEl.textContent = "Motion sensor permission was denied";
      errorEl.style.display = "block";
      return;
    }
  }
  samples.length = 0;
  peak = 0;
  window.addEventListener("devicemotion", onMotion);
  running = true;
  toggleBtn.textContent = "⏹ Stop";
  toggleBtn.classList.replace("w3-blue", "w3-red");
}

function stop() {
  window.removeEventListener("devicemotion", onMotion);
  running = false;
  toggleBtn.textContent = "📈 Start";
  toggleBtn.classList.replace("w3-red", "w3-blue");
}

toggleBtn.addEventListener("click", () => (running ? stop() : start()));
window.addEventListener("resize", resize);
resize();
