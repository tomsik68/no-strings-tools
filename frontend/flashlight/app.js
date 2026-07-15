const toggleBtn = document.getElementById("toggle-btn");
const modeEl = document.getElementById("mode");

let track = null;
let wakeLock = null;
let on = false;

async function screenMode() {
  document.body.classList.add("lit");
  wakeLock = await navigator.wakeLock?.request("screen").catch(() => null);
  modeEl.textContent = "No camera flash found — using a bright screen. Turn your brightness all the way up.";
}

async function turnOn() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
    const videoTrack = stream.getVideoTracks()[0];
    if (videoTrack.getCapabilities?.().torch) {
      await videoTrack.applyConstraints({ advanced: [{ torch: true }] });
      track = videoTrack;
      modeEl.textContent = "Camera flash is on";
    } else {
      videoTrack.stop();
      await screenMode();
    }
  } catch {
    await screenMode();
  }
  on = true;
  toggleBtn.textContent = "Turn off";
  toggleBtn.classList.replace("w3-blue", "w3-dark-grey");
}

function turnOff() {
  if (track) {
    track.stop();
    track = null;
  }
  if (wakeLock) {
    wakeLock.release();
    wakeLock = null;
  }
  document.body.classList.remove("lit");
  on = false;
  toggleBtn.textContent = "🔦 Turn on";
  toggleBtn.classList.replace("w3-dark-grey", "w3-blue");
  modeEl.innerHTML = "&nbsp;";
}

toggleBtn.addEventListener("click", () => (on ? turnOff() : turnOn()));
