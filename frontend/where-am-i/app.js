const startBtn = document.getElementById("start-btn");
const errorEl = document.getElementById("error");
const resultEl = document.getElementById("result");
const coordsEl = document.getElementById("coords");
const copyBtn = document.getElementById("copy-btn");

let lastCoords = "";

function update(position) {
  const c = position.coords;
  lastCoords = `${c.latitude.toFixed(6)}, ${c.longitude.toFixed(6)}`;
  console.log("[where-am-i] fix:", lastCoords, "±" + Math.round(c.accuracy) + "m");

  resultEl.style.display = "block";
  errorEl.style.display = "none";
  coordsEl.textContent = lastCoords;
  document.getElementById("accuracy").textContent = "±" + Math.round(c.accuracy) + " m";
  document.getElementById("altitude").textContent =
    c.altitude === null ? "—" : Math.round(c.altitude) + " m";
  document.getElementById("heading").textContent =
    c.heading === null || isNaN(c.heading) ? "—" : Math.round(c.heading) + "°";
  document.getElementById("speed").textContent =
    c.speed === null ? "—" : (c.speed * 3.6).toFixed(1) + " km/h";
}

function fail(err) {
  console.error("[where-am-i] geolocation error:", err);
  errorEl.textContent =
    err.code === 1 ? "Location access denied — allow it and try again" : "Couldn't get a GPS fix";
  errorEl.style.display = "block";
}

startBtn.addEventListener("click", () => {
  if (!navigator.geolocation) {
    errorEl.textContent = "Geolocation isn't supported in this browser";
    errorEl.style.display = "block";
    return;
  }
  startBtn.textContent = "📡 Locating…";
  navigator.geolocation.watchPosition(update, fail, {
    enableHighAccuracy: true,
    maximumAge: 5000,
  });
});

copyBtn.addEventListener("click", () => {
  navigator.clipboard.writeText(lastCoords);
  copyBtn.textContent = "✓ Copied";
  setTimeout(() => (copyBtn.textContent = "📋 Copy coordinates"), 1500);
});
