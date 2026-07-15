const speedEl = document.getElementById("speed");
const mphEl = document.getElementById("mph");
const startBtn = document.getElementById("start-btn");
const errorEl = document.getElementById("error");
const statsEl = document.getElementById("stats");
const maxEl = document.getElementById("max");
const accuracyEl = document.getElementById("accuracy");

let maxSpeed = 0;
let lastFix = null;

// Haversine distance in meters, for devices that don't report coords.speed
function distance(a, b) {
  const R = 6371000;
  const dLat = ((b.latitude - a.latitude) * Math.PI) / 180;
  const dLon = ((b.longitude - a.longitude) * Math.PI) / 180;
  const lat1 = (a.latitude * Math.PI) / 180;
  const lat2 = (b.latitude * Math.PI) / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

function update(position) {
  const c = position.coords;
  let speedMs = c.speed;

  if (speedMs === null && lastFix) {
    const dt = (position.timestamp - lastFix.timestamp) / 1000;
    if (dt > 0.5) speedMs = distance(lastFix.coords, c) / dt;
  }
  lastFix = { coords: { latitude: c.latitude, longitude: c.longitude }, timestamp: position.timestamp };

  if (speedMs === null || isNaN(speedMs)) return;
  const kmh = speedMs * 3.6;
  maxSpeed = Math.max(maxSpeed, kmh);

  statsEl.style.display = "grid";
  speedEl.textContent = kmh < 10 ? kmh.toFixed(1) : Math.round(kmh);
  mphEl.textContent = (kmh * 0.621371).toFixed(1) + " mph";
  maxEl.textContent = maxSpeed.toFixed(1) + " km/h";
  accuracyEl.textContent = "±" + Math.round(c.accuracy) + " m";
}

startBtn.addEventListener("click", () => {
  if (!navigator.geolocation) {
    errorEl.textContent = "Geolocation isn't supported in this browser";
    errorEl.style.display = "block";
    return;
  }
  startBtn.style.display = "none";
  speedEl.textContent = "0";
  navigator.geolocation.watchPosition(update, (err) => {
    console.error("[gps-speedometer] error:", err);
    errorEl.textContent =
      err.code === 1 ? "Location access denied — allow it and try again" : "Couldn't get a GPS fix";
    errorEl.style.display = "block";
    startBtn.style.display = "block";
  }, { enableHighAccuracy: true, maximumAge: 0 });
});
