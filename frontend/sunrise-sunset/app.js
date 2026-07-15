const latInput = document.getElementById("lat-input");
const lonInput = document.getElementById("lon-input");
const dateInput = document.getElementById("date-input");
const locateBtn = document.getElementById("locate-btn");
const results = document.getElementById("results");
const errorEl = document.getElementById("error");
const tzNote = document.getElementById("tz-note");

const STORAGE_KEY = "sunrise-sunset-coords";

const rad = Math.PI / 180;
const sin = (d) => Math.sin(d * rad);
const cos = (d) => Math.cos(d * rad);
const tan = (d) => Math.tan(d * rad);
const asin = (x) => Math.asin(x) / rad;
const acos = (x) => Math.acos(x) / rad;
const atan = (x) => Math.atan(x) / rad;

// Sunrise/sunset algorithm from the Almanac for Computers (Ed Williams' formulary).
// Returns a Date, or null in polar day/night.
function sunEvent(date, lat, lon, zenith, rising) {
  const start = Date.UTC(date.getFullYear(), 0, 0);
  const dayMs = 86400000;
  const N = Math.floor((Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) - start) / dayMs);

  const lngHour = lon / 15;
  const t = N + ((rising ? 6 : 18) - lngHour) / 24;
  const M = 0.9856 * t - 3.289; // sun's mean anomaly
  let L = M + 1.916 * sin(M) + 0.02 * sin(2 * M) + 282.634; // true longitude
  L = ((L % 360) + 360) % 360;

  let RA = atan(0.91764 * tan(L));
  RA = ((RA % 360) + 360) % 360;
  RA += Math.floor(L / 90) * 90 - Math.floor(RA / 90) * 90; // same quadrant as L
  RA /= 15;

  const sinDec = 0.39782 * sin(L);
  const cosDec = cos(asin(sinDec));
  const cosH = (cos(zenith) - sinDec * sin(lat)) / (cosDec * cos(lat));
  if (cosH > 1 || cosH < -1) return null;

  const H = (rising ? 360 - acos(cosH) : acos(cosH)) / 15;
  const T = H + RA - 0.06571 * t - 6.622;
  let UT = (((T - lngHour) % 24) + 24) % 24;

  return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) + UT * 3600000);
}

const fmtTime = (d) =>
  d ? d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—";

function update() {
  const lat = Number(latInput.value);
  const lon = Number(lonInput.value);
  if (latInput.value === "" || lonInput.value === "" || !dateInput.value) return;

  localStorage.setItem(STORAGE_KEY, JSON.stringify({ lat, lon }));
  const date = new Date(dateInput.value + "T12:00:00");

  const ZENITH_OFFICIAL = 90.833; // sun's upper limb touches the horizon
  const ZENITH_CIVIL = 96; // sun 6° below horizon
  const ZENITH_GOLDEN = 84; // sun 6° above horizon

  const sunrise = sunEvent(date, lat, lon, ZENITH_OFFICIAL, true);
  const sunset = sunEvent(date, lat, lon, ZENITH_OFFICIAL, false);

  document.getElementById("civil-dawn").textContent = fmtTime(sunEvent(date, lat, lon, ZENITH_CIVIL, true));
  document.getElementById("sunrise").textContent = fmtTime(sunrise);
  document.getElementById("golden-end").textContent = fmtTime(sunEvent(date, lat, lon, ZENITH_GOLDEN, true));
  document.getElementById("golden-start").textContent = fmtTime(sunEvent(date, lat, lon, ZENITH_GOLDEN, false));
  document.getElementById("sunset").textContent = fmtTime(sunset);
  document.getElementById("civil-dusk").textContent = fmtTime(sunEvent(date, lat, lon, ZENITH_CIVIL, false));

  const noonEl = document.getElementById("solar-noon");
  const lengthEl = document.getElementById("day-length");
  if (sunrise && sunset) {
    // Events are anchored to the same UTC date, so sunset can land "before"
    // sunrise for longitudes far from Greenwich — wrap the difference
    const dayMs = (((sunset - sunrise) % 86400000) + 86400000) % 86400000;
    noonEl.textContent = fmtTime(new Date(sunrise.getTime() + dayMs / 2));
    const mins = Math.round(dayMs / 60000);
    lengthEl.textContent = `${Math.floor(mins / 60)} h ${mins % 60} min`;
  } else {
    noonEl.textContent = "—";
    lengthEl.textContent = "Polar day or night";
  }

  results.style.display = "";
  tzNote.style.display = "";
  errorEl.style.display = "none";
}

locateBtn.addEventListener("click", () => {
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      latInput.value = pos.coords.latitude.toFixed(4);
      lonInput.value = pos.coords.longitude.toFixed(4);
      update();
    },
    () => {
      errorEl.textContent = "Couldn't get your location — please enter coordinates manually.";
      errorEl.style.display = "";
    }
  );
});

latInput.addEventListener("input", update);
lonInput.addEventListener("input", update);
dateInput.addEventListener("input", update);

// Local date in yyyy-mm-dd (toISOString would shift near midnight)
const now = new Date();
dateInput.value = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

const savedCoords = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
if (savedCoords) {
  latInput.value = savedCoords.lat;
  lonInput.value = savedCoords.lon;
  update();
} else {
  locateBtn.click();
}
