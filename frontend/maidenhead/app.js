const latEl = document.getElementById("lat");
const lonEl = document.getElementById("lon");
const gridOut = document.getElementById("grid-out");
const gridIn = document.getElementById("grid-in");
const coordsOut = document.getElementById("coords-out");
const errorEl = document.getElementById("error");

function toGrid(lat, lon, precision = 6) {
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
  if (lat < -90 || lat > 90 || lon < -180 || lon > 180) return null;

  let adjLon = lon + 180;
  let adjLat = lat + 90;
  let grid = "";

  // Field (A–R)
  const lonField = Math.floor(adjLon / 20);
  const latField = Math.floor(adjLat / 10);
  grid += String.fromCharCode(65 + lonField);
  grid += String.fromCharCode(65 + latField);
  adjLon -= lonField * 20;
  adjLat -= latField * 10;

  // Square (0–9)
  const lonSq = Math.floor(adjLon / 2);
  const latSq = Math.floor(adjLat / 1);
  grid += String(lonSq);
  grid += String(latSq);
  adjLon -= lonSq * 2;
  adjLat -= latSq * 1;

  if (precision >= 6) {
    // Subsquare (a–x)
    const lonSub = Math.floor(adjLon / (2 / 24));
    const latSub = Math.floor(adjLat / (1 / 24));
    grid += String.fromCharCode(97 + Math.min(23, lonSub));
    grid += String.fromCharCode(97 + Math.min(23, latSub));
  }
  return grid;
}

function fromGrid(grid) {
  const g = grid.trim().toUpperCase();
  if (!/^[A-R]{2}[0-9]{2}([A-X]{2})?$/.test(g)) return null;

  let lon = (g.charCodeAt(0) - 65) * 20 - 180;
  let lat = (g.charCodeAt(1) - 65) * 10 - 90;
  lon += parseInt(g[2], 10) * 2;
  lat += parseInt(g[3], 10) * 1;

  if (g.length >= 6) {
    const lonSub = g.charCodeAt(4) - 65; // A–X
    const latSub = g.charCodeAt(5) - 65;
    lon += lonSub * (2 / 24);
    lat += latSub * (1 / 24);
    // center of subsquare
    lon += 2 / 48;
    lat += 1 / 48;
  } else {
    lon += 1;
    lat += 0.5;
  }
  return { lat, lon };
}

function updateFromCoords() {
  errorEl.textContent = "";
  const lat = parseFloat(latEl.value);
  const lon = parseFloat(lonEl.value);
  const grid = toGrid(lat, lon);
  if (!grid) {
    gridOut.textContent = "—";
    if (latEl.value || lonEl.value) errorEl.textContent = "Lat −90…90, lon −180…180";
    return;
  }
  gridOut.textContent = grid;
  // don't overwrite grid-in while typing coords unless different
  if (document.activeElement !== gridIn) gridIn.value = grid;
}

function updateFromGrid() {
  errorEl.textContent = "";
  const parsed = fromGrid(gridIn.value);
  if (!parsed) {
    coordsOut.textContent = gridIn.value.trim() ? "Invalid grid (e.g. JO70aa)" : "";
    return;
  }
  coordsOut.textContent = `Center ≈ ${parsed.lat.toFixed(5)}°, ${parsed.lon.toFixed(5)}°`;
  if (document.activeElement !== latEl && document.activeElement !== lonEl) {
    latEl.value = parsed.lat.toFixed(5);
    lonEl.value = parsed.lon.toFixed(5);
    gridOut.textContent = toGrid(parsed.lat, parsed.lon) || gridIn.value.trim().toUpperCase();
  }
}

latEl.addEventListener("input", updateFromCoords);
lonEl.addEventListener("input", updateFromCoords);
gridIn.addEventListener("input", updateFromGrid);

document.getElementById("gps-btn").addEventListener("click", () => {
  if (!navigator.geolocation) {
    errorEl.textContent = "Geolocation not supported";
    return;
  }
  errorEl.textContent = "Locating…";
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      latEl.value = pos.coords.latitude.toFixed(5);
      lonEl.value = pos.coords.longitude.toFixed(5);
      updateFromCoords();
      errorEl.textContent = "";
    },
    () => { errorEl.textContent = "Couldn't get location"; },
    { enableHighAccuracy: true }
  );
});

// Default: Prague (example)
latEl.value = "50.0755";
lonEl.value = "14.4378";
updateFromCoords();
latEl.focus();
