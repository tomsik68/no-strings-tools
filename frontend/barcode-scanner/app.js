const toggleBtn = document.getElementById("toggle-btn");
const video = document.getElementById("video");
const hitsEl = document.getElementById("hits");
const errorEl = document.getElementById("error");

let stream = null;
let timer = null;
let lastValue = null;

function showError(message) {
  errorEl.textContent = message;
  errorEl.style.display = "block";
}

function addHit(barcode) {
  navigator.vibrate?.(80);
  const value = document.createElement("div");
  const fmt = document.createElement("div");
  fmt.className = "fmt";
  fmt.textContent = barcode.format;
  const val = document.createElement("div");
  val.className = "value";
  val.textContent = barcode.rawValue;
  value.append(fmt, val);

  const copyBtn = document.createElement("button");
  copyBtn.className = "w3-button w3-light-grey w3-round w3-small";
  copyBtn.textContent = "📋";
  copyBtn.setAttribute("aria-label", `Copy ${barcode.rawValue}`);
  copyBtn.addEventListener("click", async () => {
    await navigator.clipboard.writeText(barcode.rawValue);
    copyBtn.textContent = "✓";
    setTimeout(() => (copyBtn.textContent = "📋"), 1200);
  });

  const div = document.createElement("div");
  div.className = "hit";
  div.append(value, copyBtn);
  hitsEl.prepend(div);
}

async function start() {
  errorEl.style.display = "none";

  const formats = await BarcodeDetector.getSupportedFormats();
  if (!formats.length) {
    return showError("This browser has no barcode formats available — try Chrome on Android");
  }
  const detector = new BarcodeDetector({ formats });

  try {
    stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
  } catch {
    return showError("Camera access is needed to scan");
  }
  video.srcObject = stream;
  video.style.display = "block";
  await video.play();

  timer = setInterval(async () => {
    if (video.readyState < 2) return;
    try {
      const barcodes = await detector.detect(video);
      for (const barcode of barcodes) {
        if (barcode.rawValue !== lastValue) {
          lastValue = barcode.rawValue;
          addHit(barcode);
        }
      }
    } catch {
      // a single failed frame is not worth reporting
    }
  }, 250);

  toggleBtn.textContent = "⏹ Stop scanning";
  toggleBtn.classList.replace("w3-blue", "w3-red");
}

function stop() {
  clearInterval(timer);
  stream.getTracks().forEach((t) => t.stop());
  stream = null;
  lastValue = null;
  video.style.display = "none";
  video.srcObject = null;
  toggleBtn.textContent = "📷 Start scanning";
  toggleBtn.classList.replace("w3-red", "w3-blue");
}

toggleBtn.addEventListener("click", () => (stream ? stop() : start()));

if (!("BarcodeDetector" in window)) {
  toggleBtn.disabled = true;
  errorEl.innerHTML = 'Barcode detection isn\'t built into this browser — it needs Chrome on Android, ChromeOS, or macOS. For QR codes, the <a href="../qr-scanner/index.html">QR Scanner</a> works everywhere.';
  errorEl.style.display = "block";
}
