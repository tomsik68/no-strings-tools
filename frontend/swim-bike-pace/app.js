let mode = "swim";
const $ = (id) => document.getElementById(id);

function toMeters() {
  const v = parseFloat($("dist").value) || 0;
  const u = $("dist-unit").value;
  if (u === "km") return v * 1000;
  if (u === "mi") return v * 1609.344;
  return v;
}

function totalSec() {
  return (parseInt($("h").value, 10) || 0) * 3600
    + (parseInt($("m").value, 10) || 0) * 60
    + (parseInt($("s").value, 10) || 0);
}

function fmtPace(secPerUnit) {
  if (!Number.isFinite(secPerUnit) || secPerUnit <= 0) return "—";
  const m = Math.floor(secPerUnit / 60);
  const s = Math.round(secPerUnit % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

function render() {
  const meters = toMeters();
  const sec = totalSec();
  if (!(meters > 0 && sec > 0)) {
    $("out").innerHTML = '<span class="w3-text-grey">Enter distance and time.</span>';
    return;
  }
  if (mode === "swim") {
    const per100 = sec / (meters / 100);
    const per50 = sec / (meters / 50);
    $("out").innerHTML = `
      <div class="w3-text-grey w3-small">Pace / 100 m</div>
      <div style="font-size:32px;font-weight:700;">${fmtPace(per100)}</div>
      <div class="w3-text-grey w3-small w3-margin-top">Pace / 50 m</div>
      <div style="font-size:22px;font-weight:600;">${fmtPace(per50)}</div>`;
  } else {
    const kmh = (meters / 1000) / (sec / 3600);
    const mph = kmh * 0.621371;
    const perKm = sec / (meters / 1000);
    $("out").innerHTML = `
      <div class="w3-text-grey w3-small">Speed</div>
      <div style="font-size:32px;font-weight:700;">${kmh.toFixed(1)} km/h</div>
      <div class="w3-text-grey">${mph.toFixed(1)} mph</div>
      <div class="w3-text-grey w3-small w3-margin-top">Pace / km</div>
      <div style="font-size:22px;font-weight:600;">${fmtPace(perKm)}</div>`;
  }
}

function setMode(m) {
  mode = m;
  $("mode-swim").className = "w3-bar-item w3-button " + (m === "swim" ? "w3-blue" : "w3-white w3-border");
  $("mode-bike").className = "w3-bar-item w3-button " + (m === "bike" ? "w3-blue" : "w3-white w3-border");
  if (m === "bike" && $("dist-unit").value === "m") {
    $("dist").value = "40";
    $("dist-unit").value = "km";
  }
  if (m === "swim" && $("dist-unit").value !== "m") {
    $("dist").value = "1500";
    $("dist-unit").value = "m";
  }
  render();
}

$("mode-swim").addEventListener("click", () => setMode("swim"));
$("mode-bike").addEventListener("click", () => setMode("bike"));
["dist", "dist-unit", "h", "m", "s"].forEach((id) => $(id).addEventListener("input", render));
$("dist").focus();
render();
