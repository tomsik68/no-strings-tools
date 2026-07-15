const input = document.getElementById("durations-input");
const totalEl = document.getElementById("total");
const decimalEl = document.getElementById("decimal");
const errorEl = document.getElementById("error");

input.focus();

// Returns seconds, or null if the line isn't a duration
function parseLine(line) {
  line = line.trim().toLowerCase();
  if (!line) return null;

  // h:mm or h:mm:ss
  let m = line.match(/^(\d+):([0-5]?\d)(?::([0-5]?\d))?$/);
  if (m) return Number(m[1]) * 3600 + Number(m[2]) * 60 + Number(m[3] || 0);

  // "1h 30m", "90m", "2h", "45s"
  m = line.match(/^(?:(\d+(?:[.,]\d+)?)\s*h)?\s*(?:(\d+(?:[.,]\d+)?)\s*m(?:in)?)?\s*(?:(\d+)\s*s)?$/);
  if (m && (m[1] || m[2] || m[3])) {
    const num = (s) => Number((s || "0").replace(",", "."));
    return num(m[1]) * 3600 + num(m[2]) * 60 + num(m[3]);
  }

  // bare number = minutes
  m = line.match(/^\d+(?:[.,]\d+)?$/);
  if (m) return Number(line.replace(",", ".")) * 60;

  return NaN;
}

function update() {
  let totalSecs = 0;
  let invalid = 0;

  for (const line of input.value.split("\n")) {
    const secs = parseLine(line);
    if (secs === null) continue;
    if (Number.isNaN(secs)) invalid++;
    else totalSecs += secs;
  }

  totalSecs = Math.round(totalSecs);
  const h = Math.floor(totalSecs / 3600);
  const min = Math.floor((totalSecs % 3600) / 60);
  const s = totalSecs % 60;

  totalEl.textContent =
    s > 0
      ? `${h}:${String(min).padStart(2, "0")}:${String(s).padStart(2, "0")}`
      : `${h}:${String(min).padStart(2, "0")}`;
  decimalEl.textContent = `${(totalSecs / 3600).toFixed(2).replace(/\.?0+$/, "") || "0"} h`;

  errorEl.style.display = invalid ? "" : "none";
  errorEl.textContent = invalid
    ? `Skipped ${invalid} line${invalid > 1 ? "s" : ""} I couldn't read as a duration.`
    : "";
}

input.addEventListener("input", update);
update();
