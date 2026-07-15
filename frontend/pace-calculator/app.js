const distanceInput = document.getElementById("distance-input");
const timeInput = document.getElementById("time-input");
const paceInput = document.getElementById("pace-input");
const errorEl = document.getElementById("error");
const races = document.getElementById("races");

const FIELDS = { distance: distanceInput, time: timeInput, pace: paceInput };
let editHistory = []; // last-edited field names; the one not in the last two gets computed

// "52:30" or "1:02:30" → seconds; bare number = minutes
function parseTime(s) {
  s = s.trim();
  if (!s) return null;
  let m = s.match(/^(\d+):([0-5]?\d)(?::([0-5]?\d))?$/);
  if (m) {
    return m[3] !== undefined
      ? Number(m[1]) * 3600 + Number(m[2]) * 60 + Number(m[3])
      : Number(m[1]) * 60 + Number(m[2]);
  }
  m = s.match(/^\d+(?:[.,]\d+)?$/);
  if (m) return Number(s.replace(",", ".")) * 60;
  return NaN;
}

function fmtTime(secs) {
  secs = Math.round(secs);
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  return h
    ? `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
    : `${m}:${String(s).padStart(2, "0")}`;
}

function update(edited) {
  editHistory = [...editHistory.filter((f) => f !== edited), edited].slice(-2);

  const distance = Number(distanceInput.value) || null;
  const time = parseTime(timeInput.value);
  const pace = parseTime(paceInput.value);

  errorEl.style.display = "none";
  if (Number.isNaN(time) || Number.isNaN(pace)) {
    errorEl.textContent = "Times look like 52:30 or 1:02:30 (or plain minutes).";
    errorEl.style.display = "";
    return;
  }

  const filled = { distance, time, pace };
  const empty = Object.keys(FIELDS).filter((f) => !filled[f]);
  const target = empty.length === 1 ? empty[0] : empty.length === 0 ? Object.keys(FIELDS).find((f) => !editHistory.includes(f)) : null;
  if (!target) return;

  let paceSecs = pace;
  if (target === "distance" && time && pace) {
    distanceInput.value = Math.round((time / pace) * 100) / 100;
  } else if (target === "time" && distance && pace) {
    timeInput.value = fmtTime(distance * pace);
  } else if (target === "pace" && distance && time) {
    paceSecs = time / distance;
    paceInput.value = fmtTime(paceSecs);
  } else {
    return;
  }

  document.getElementById("race-5k").textContent = fmtTime(5 * paceSecs);
  document.getElementById("race-10k").textContent = fmtTime(10 * paceSecs);
  document.getElementById("race-half").textContent = fmtTime(21.0975 * paceSecs);
  document.getElementById("race-full").textContent = fmtTime(42.195 * paceSecs);
  races.style.display = "";
}

for (const [name, el] of Object.entries(FIELDS)) {
  el.addEventListener("change", () => update(name));
}

distanceInput.focus();
