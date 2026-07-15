const bubbleX = document.getElementById("bubble-x");
const bubbleY = document.getElementById("bubble-y");
const angleX = document.getElementById("angle-x");
const angleY = document.getElementById("angle-y");
const statusDisplay = document.getElementById("status-display");
const permissionMessage = document.getElementById("permission-message");

// Smoothed tilt angles (degrees). gamma = left-right, beta = forward-back.
let smoothX = 0;
let smoothY = 0;
const SMOOTHING = 0.15; // exponential moving average factor
let gotFirstReading = false;

function handleOrientation(event) {
  if (event.gamma === null || event.beta === null) return;

  if (!gotFirstReading) {
    gotFirstReading = true;
    console.log("[spirit-level] first reading - beta:", event.beta, "gamma:", event.gamma);
    // Jump straight to the first value instead of easing in from 0
    smoothX = event.gamma;
    smoothY = event.beta;
  }

  smoothX += SMOOTHING * (event.gamma - smoothX);
  smoothY += SMOOTHING * (event.beta - smoothY);

  angleX.textContent = smoothX.toFixed(1) + "°";
  angleY.textContent = smoothY.toFixed(1) + "°";

  // Bubble floats to the high side, like a real spirit level
  const maxOffset = 80;
  const toOffset = (deg) =>
    Math.max(-maxOffset, Math.min(maxOffset, (-deg / 45) * maxOffset));
  bubbleX.style.left = `calc(50% + ${toOffset(smoothX)}px)`;
  bubbleY.style.left = `calc(50% + ${toOffset(smoothY)}px)`;

  const tolerance = 2;
  if (Math.abs(smoothX) < tolerance && Math.abs(smoothY) < tolerance) {
    statusDisplay.textContent = "✓ Level!";
    statusDisplay.className = "status-display level";
    bubbleX.classList.add("level");
    bubbleY.classList.add("level");
  } else {
    statusDisplay.textContent = "↨ Adjust to level";
    statusDisplay.className = "status-display tilted";
    bubbleX.classList.remove("level");
    bubbleY.classList.remove("level");
  }
}

function startSensors() {
  window.addEventListener("deviceorientation", handleOrientation);
}

if (window.DeviceOrientationEvent && typeof DeviceOrientationEvent.requestPermission === "function") {
  // iOS 13+: the permission prompt only works from a user gesture,
  // so show a button instead of requesting on page load
  const enableBtn = document.createElement("button");
  enableBtn.className = "w3-button w3-blue w3-round";
  enableBtn.textContent = "Enable sensors";
  permissionMessage.appendChild(enableBtn);

  enableBtn.addEventListener("click", () => {
    DeviceOrientationEvent.requestPermission()
      .then((state) => {
        console.log("[spirit-level] permission:", state);
        if (state === "granted") {
          enableBtn.remove();
          startSensors();
        } else {
          permissionMessage.textContent = "Permission denied. Enable motion access in Settings.";
        }
      })
      .catch(() => {
        permissionMessage.textContent = "Permission denied";
      });
  });
} else if (window.DeviceOrientationEvent) {
  // Android and older iOS
  startSensors();
} else {
  permissionMessage.textContent = "Device orientation not supported on this device";
}
