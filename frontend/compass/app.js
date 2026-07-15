const compassInner = document.getElementById("compass-inner");
const degreeDisplay = document.getElementById("degree-display");
const directionDisplay = document.getElementById("direction-display");
const permissionMessage = document.getElementById("permission-message");

function getDirection(degrees) {
  const directions = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
  const index = Math.round(degrees / 22.5) % 16;
  return directions[index];
}

function handleOrientation(event) {
  let heading = event.webkitCompassHeading || event.alpha;

  if (heading === undefined) {
    permissionMessage.textContent = "Device orientation not supported";
    return;
  }

  heading = 360 - heading;

  compassInner.style.transform = `rotate(${heading}deg)`;
  degreeDisplay.textContent = Math.round(heading) + "°";
  directionDisplay.textContent = getDirection(heading);
}

if (typeof DeviceOrientationEvent !== "undefined" && typeof DeviceOrientationEvent.requestPermission === "function") {
  // iOS 13+
  DeviceOrientationEvent.requestPermission()
    .then((permissionState) => {
      if (permissionState === "granted") {
        window.addEventListener("deviceorientation", handleOrientation);
      } else {
        permissionMessage.textContent = "Permission denied. Please enable in settings.";
      }
    })
    .catch(() => {
      permissionMessage.textContent = "Permission denied";
    });
} else if (typeof DeviceOrientationEvent !== "undefined") {
  // Android and older iOS
  window.addEventListener("deviceorientation", handleOrientation);
} else {
  permissionMessage.textContent = "Device orientation not supported on this device";
}
