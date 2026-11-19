const $ = (id) => document.getElementById(id);
const KEY = "compass-logger";
const SHOWN = 50; // rows rendered in the table; the CSV has everything

let heading = null; // degrees clockwise from magnetic north
let recTimer = null;
let log = [];
try { log = JSON.parse(localStorage.getItem(KEY)) || []; } catch { log = []; }

const DIRS = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
const dirOf = (deg) => DIRS[Math.round(deg / 22.5) % 16];

// ---- Sensor ----
function onOrientation(e) {
  let h = null;
  if (typeof e.webkitCompassHeading === "number") h = e.webkitCompassHeading; // iOS: already clockwise from north
  else if (e.absolute && typeof e.alpha === "number") h = 360 - e.alpha;      // Android: alpha is counter-clockwise
  if (h === null) return;
  h = (h + (screen.orientation?.angle || 0) + 360) % 360; // correct for landscape
  if (heading === null) { $("msg").textContent = "Hold the phone flat, away from metal."; $("log-btn").disabled = $("rec-btn").disabled = false; }
  heading = h;
  $("heading").textContent = Math.round(h) % 360 + "°";
  $("dir").textContent = dirOf(h);
}

function listen() {
  // Chrome/Android only gives a north-referenced heading on the "absolute" event.
  window.addEventListener("ondeviceorientationabsolute" in window ? "deviceorientationabsolute" : "deviceorientation", onOrientation);
  setTimeout(() => { if (heading === null) $("msg").textContent = "No compass found. Open this on a phone."; }, 3000);
}

if (typeof DeviceOrientationEvent === "undefined") {
  $("msg").textContent = "No compass found. Open this on a phone.";
} else if (typeof DeviceOrientationEvent.requestPermission === "function") {
  // iOS needs a tap before it shares sensor data.
  $("msg").textContent = "Tap to allow compass access.";
  $("enable").hidden = false;
  $("enable").addEventListener("click", async () => {
    try {
      if (await DeviceOrientationEvent.requestPermission() === "granted") { $("enable").hidden = true; listen(); }
      else $("msg").textContent = "Compass access denied. Allow Motion & Orientation in Safari settings.";
    } catch { $("msg").textContent = "Compass access denied."; }
  });
} else {
  listen();
}

// ---- Logging ----
function addEntry() {
  if (heading === null) return;
  log.push({ t: new Date().toISOString(), deg: Math.round(heading * 10) / 10, note: $("note").value.trim() });
  save(); render();
}

function save() {
  try { localStorage.setItem(KEY, JSON.stringify(log)); }
  catch { $("msg").textContent = "Storage full. Export CSV and clear the log."; stopRec(); }
}

const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

function render() {
  $("count").textContent = `(${log.length})`;
  $("csv").disabled = $("clear").disabled = !log.length;
  $("log").innerHTML = log.length
    ? "<tr><th>Time</th><th>Bearing</th><th>Note</th></tr>" +
      log.slice(-SHOWN).reverse().map((r) =>
        `<tr><td>${new Date(r.t).toLocaleTimeString()}</td><td>${r.deg}° ${dirOf(r.deg)}</td><td>${esc(r.note)}</td></tr>`
      ).join("")
    : "";
  $("more").textContent = log.length > SHOWN ? `Showing the latest ${SHOWN}. Export CSV for all ${log.length}.` : "";
}

function stopRec() {
  clearInterval(recTimer); recTimer = null;
  $("rec-btn").textContent = "⏺ Record";
}

$("log-btn").addEventListener("click", () => { addEntry(); $("note").select(); });
$("rec-btn").addEventListener("click", () => {
  if (recTimer) return stopRec();
  addEntry();
  recTimer = setInterval(addEntry, 1000);
  $("rec-btn").textContent = "⏹ Stop";
});
$("note").addEventListener("keydown", (e) => { if (e.key === "Enter") $("log-btn").click(); });

$("csv").addEventListener("click", () => {
  const q = (s) => `"${String(s).replace(/"/g, '""')}"`;
  const rows = ["time,bearing_deg,direction,note", ...log.map((r) => [r.t, r.deg, dirOf(r.deg), q(r.note)].join(","))];
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([rows.join("\n") + "\n"], { type: "text/csv" }));
  a.download = `compass-log-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000);
});

$("clear").addEventListener("click", () => {
  if (!confirm(`Delete all ${log.length} entries?`)) return;
  stopRec(); log = []; save(); render();
});

render();
$("note").focus();
