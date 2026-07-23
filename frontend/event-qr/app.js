const titleInput = document.getElementById("title-input");
const startInput = document.getElementById("start-input");
const endInput = document.getElementById("end-input");
const locInput = document.getElementById("loc-input");
const descInput = document.getElementById("desc-input");
const canvas = document.getElementById("qr-canvas");
const icsBtn = document.getElementById("ics-btn");
const pngBtn = document.getElementById("png-btn");

let lastIcs = "";

function pad(n) { return String(n).padStart(2, "0"); }

function toIcsStamp(localValue) {
  // datetime-local → floating local time in ICS (no Z)
  const [date, time] = localValue.split("T");
  if (!date || !time) return "";
  const [y, m, d] = date.split("-");
  const [hh, mm] = time.split(":");
  return `${y}${m}${d}T${hh}${mm}00`;
}

function icsEscape(s) {
  return s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
}

function buildIcs() {
  const title = titleInput.value.trim();
  const start = startInput.value;
  const end = endInput.value;
  if (!title || !start || !end) return "";
  const dtStart = toIcsStamp(start);
  const dtEnd = toIcsStamp(end);
  if (!dtStart || !dtEnd) return "";

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//No Strings Tools//Event QR//EN",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:${crypto.randomUUID()}@nostrings.tools`,
    `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "")}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${icsEscape(title)}`,
  ];
  if (locInput.value.trim()) lines.push(`LOCATION:${icsEscape(locInput.value.trim())}`);
  if (descInput.value.trim()) lines.push(`DESCRIPTION:${icsEscape(descInput.value.trim())}`);
  lines.push("END:VEVENT", "END:VCALENDAR");
  return lines.join("\r\n");
}

function generate() {
  lastIcs = buildIcs();
  canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
  icsBtn.style.display = "none";
  pngBtn.style.display = "none";
  if (!lastIcs) return;

  QRCode.toCanvas(canvas, lastIcs, { width: 256, margin: 1, errorCorrectionLevel: "M" }, (err) => {
    if (!err) {
      icsBtn.style.display = "";
      pngBtn.style.display = "";
    }
  });
}

// Defaults: next hour, +1h
(function defaults() {
  const s = new Date();
  s.setMinutes(0, 0, 0);
  s.setHours(s.getHours() + 1);
  const e = new Date(s.getTime() + 3600000);
  const toLocal = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  startInput.value = toLocal(s);
  endInput.value = toLocal(e);
})();

[titleInput, startInput, endInput, locInput, descInput].forEach((el) => el.addEventListener("input", generate));

startInput.addEventListener("change", () => {
  if (startInput.value && (!endInput.value || endInput.value <= startInput.value)) {
    const s = new Date(startInput.value);
    const e = new Date(s.getTime() + 3600000);
    const pad2 = (n) => String(n).padStart(2, "0");
    endInput.value = `${e.getFullYear()}-${pad2(e.getMonth() + 1)}-${pad2(e.getDate())}T${pad2(e.getHours())}:${pad2(e.getMinutes())}`;
    generate();
  }
});

icsBtn.addEventListener("click", () => {
  if (!lastIcs) return;
  const blob = new Blob([lastIcs], { type: "text/calendar" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `${(titleInput.value.trim() || "event").replace(/\s+/g, "-")}.ics`;
  a.click();
  URL.revokeObjectURL(a.href);
});

pngBtn.addEventListener("click", () => {
  const a = document.createElement("a");
  a.href = canvas.toDataURL("image/png");
  a.download = `${(titleInput.value.trim() || "event").replace(/\s+/g, "-")}-qr.png`;
  a.click();
});

titleInput.focus();
generate();
