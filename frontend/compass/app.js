const compassInner = document.getElementById("compass-inner");
const degreeDisplay = document.getElementById("degree-display");
const directionDisplay = document.getElementById("direction-display");
const permissionMessage = document.getElementById("permission-message");
const enableBtn = document.getElementById("enable-btn");
let gotReading = false;

function getDirection(degrees) {
  const directions = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
  return directions[Math.round(degrees / 22.5) % 16];
}

function handleOrientation(event) {
  let heading = null;
  if (typeof event.webkitCompassHeading === "number") heading = event.webkitCompassHeading; // iOS: clockwise from north
  else if (event.absolute && typeof event.alpha === "number") heading = 360 - event.alpha;   // Android: counter-clockwise
  if (heading === null) return;
  heading = (heading + (screen.orientation?.angle || 0) + 360) % 360; // correct for landscape
  gotReading = true;
  permissionMessage.textContent = "";

  // Rotate the rose opposite to the heading so its N keeps pointing north.
  compassInner.style.transform = `rotate(${-heading}deg)`;
  degreeDisplay.textContent = (Math.round(heading) % 360) + "°";
  directionDisplay.textContent = getDirection(heading);
}

function listen() {
  // Chrome/Android only gives a north-referenced heading on the "absolute" event.
  window.addEventListener("ondeviceorientationabsolute" in window ? "deviceorientationabsolute" : "deviceorientation", handleOrientation);
  setTimeout(() => { if (!gotReading) permissionMessage.textContent = "No compass found. Open this on a phone."; }, 3000);
}

if (typeof DeviceOrientationEvent === "undefined") {
  permissionMessage.textContent = "Device orientation not supported on this device";
} else if (typeof DeviceOrientationEvent.requestPermission === "function") {
  // iOS 13+ only grants sensor access from a tap.
  permissionMessage.textContent = "Tap to allow compass access.";
  enableBtn.hidden = false;
  enableBtn.addEventListener("click", async () => {
    try {
      if (await DeviceOrientationEvent.requestPermission() === "granted") { enableBtn.hidden = true; listen(); }
      else permissionMessage.textContent = "Permission denied. Allow Motion & Orientation in Safari settings.";
    } catch { permissionMessage.textContent = "Permission denied"; }
  });
} else {
  listen();
}
