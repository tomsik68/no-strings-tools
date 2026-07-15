const lightDisplay = document.getElementById("light-display");
const lightValue = document.getElementById("light-value");
const lightLabel = document.getElementById("light-label");
const lightIndicator = document.getElementById("light-indicator");
const levelText = document.getElementById("level-text");
const permissionMessage = document.getElementById("permission-message");

function handleLightLevel(event) {
  const lux = event.illuminance;

  lightValue.textContent = Math.round(lux);
  levelText.textContent = Math.round(lux) + " lux";

  // Determine light level
  let level = "Dark";
  let className = "dim";

  if (lux < 50) {
    level = "Very Dark";
    className = "dim";
  } else if (lux < 500) {
    level = "Dim";
    className = "dim";
  } else if (lux < 5000) {
    level = "Normal";
    className = "normal";
  } else {
    level = "Bright";
    className = "bright";
  }

  lightLabel.textContent = level;
  lightDisplay.className = "light-display " + className;

  // Position indicator on bar (0-20000 lux typical range)
  const percentage = Math.min(lux / 20000, 1) * 100;
  lightIndicator.style.left = percentage + "%";
}

if ("AmbientLightSensor" in window) {
  try {
    const sensor = new AmbientLightSensor();
    sensor.addEventListener("reading", handleLightLevel);
    sensor.start();
  } catch (error) {
    permissionMessage.textContent = "Ambient Light Sensor not available";
  }
} else {
  permissionMessage.textContent = "Ambient Light Sensor not supported on this device";
}
