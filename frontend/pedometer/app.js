const stepCount = document.getElementById("step-count");
const distanceDisplay = document.getElementById("distance");
const resetBtn = document.getElementById("reset-btn");
const status = document.getElementById("status");
const permissionMessage = document.getElementById("permission-message");

let steps = 0;
let lastAccel = 0;
let threshold = 15;
let STRIDE_LENGTH = 0.65;

resetBtn.addEventListener("click", () => {
  steps = 0;
  stepCount.textContent = "0";
  updateDistance();
});

function updateDisplay() {
  stepCount.textContent = steps;
  updateDistance();
}

function updateDistance() {
  const distance = steps * STRIDE_LENGTH;
  distanceDisplay.textContent = distance.toFixed(2) + " m";
}

function handleMotion(event) {
  const accel = event.acceleration;
  if (!accel) return;

  const x = accel.x || 0;
  const y = accel.y || 0;
  const z = accel.z || 0;

  const magnitude = Math.sqrt(x * x + y * y + z * z);

  if (magnitude > threshold && lastAccel <= threshold) {
    steps++;
    updateDisplay();
    status.textContent = "Walking detected";
  }

  lastAccel = magnitude;
}

if (typeof DeviceMotionEvent !== "undefined" && typeof DeviceMotionEvent.requestPermission === "function") {
  // iOS 13+
  DeviceMotionEvent.requestPermission()
    .then((permissionState) => {
      if (permissionState === "granted") {
        window.addEventListener("devicemotion", handleMotion);
        status.textContent = "Ready - start walking";
      } else {
        permissionMessage.textContent = "Permission denied. Please enable in settings.";
      }
    })
    .catch(() => {
      permissionMessage.textContent = "Permission denied";
    });
} else if (typeof DeviceMotionEvent !== "undefined") {
  // Android and older iOS
  window.addEventListener("devicemotion", handleMotion);
  status.textContent = "Ready - start walking";
} else {
  permissionMessage.textContent = "Device motion not supported on this device";
}
