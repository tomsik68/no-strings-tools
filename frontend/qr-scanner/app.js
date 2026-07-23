const video = document.getElementById("video");
const startBtn = document.getElementById("start-btn");
const errorEl = document.getElementById("error");
const resultEl = document.getElementById("result");
const resultText = document.getElementById("result-text");
const copyBtn = document.getElementById("copy-btn");
const openLink = document.getElementById("open-link");

const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d", { willReadFrequently: true });

// Native BarcodeDetector where available (Chrome/Edge), jsQR everywhere else
const detector = "BarcodeDetector" in window ? new BarcodeDetector({ formats: ["qr_code"] }) : null;
if (!detector && typeof jsQR === "undefined") {
  errorEl.textContent = "QR scanner library failed to load — connect once so it can cache, then this works offline.";
  errorEl.style.display = "block";
  startBtn.disabled = true;
}
console.log("[qr-scanner] using", detector ? "BarcodeDetector" : "jsQR");

let scanning = false;

function showResult(text) {
  console.log("[qr-scanner] decoded:", text);
  resultEl.style.display = "block";
  resultText.textContent = text;
  if (/^https?:\/\//i.test(text)) {
    openLink.href = text;
    openLink.style.display = "inline-block";
  } else {
    openLink.style.display = "none";
  }
}

async function scanFrame() {
  if (!scanning) return;
  if (video.readyState >= video.HAVE_CURRENT_DATA) {
    let text = null;
    if (detector) {
      const codes = await detector.detect(video).catch(() => []);
      if (codes.length) text = codes[0].rawValue;
    } else {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0);
      const image = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(image.data, image.width, image.height);
      if (code) text = code.data;
    }
    if (text && text !== resultText.textContent) showResult(text);
  }
  setTimeout(scanFrame, 200);
}

startBtn.addEventListener("click", async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "environment", width: { ideal: 1280 } },
    });
    video.srcObject = stream;
    errorEl.style.display = "none";
    startBtn.style.display = "none";
    scanning = true;
    scanFrame();
  } catch (err) {
    console.error("[qr-scanner] camera error:", err);
    errorEl.textContent = "Camera access needed — allow it and try again";
    errorEl.style.display = "block";
  }
});

copyBtn.addEventListener("click", () => {
  navigator.clipboard.writeText(resultText.textContent);
  copyBtn.textContent = "✓ Copied";
  setTimeout(() => (copyBtn.textContent = "📋 Copy"), 1500);
});
