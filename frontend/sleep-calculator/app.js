const wakeInput = document.getElementById("wake-time");
const bedtimesEl = document.getElementById("bedtimes");
const waketimesEl = document.getElementById("waketimes");

const CYCLE = 90;
const FALL_ASLEEP = 15;

function fmtTime(date) {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function timeBox(date, cycles) {
  const box = document.createElement("div");
  box.className = "time-box" + (cycles >= 5 ? " best" : "");
  const value = document.createElement("div");
  value.className = "time-value";
  value.textContent = fmtTime(date);
  const label = document.createElement("div");
  label.className = "time-label";
  label.textContent = `${cycles} cycles · ${(cycles * 1.5).toFixed(1).replace(".0", "")} h sleep`;
  box.append(value, label);
  return box;
}

function render() {
  bedtimesEl.innerHTML = "";
  const [hours, minutes] = wakeInput.value.split(":").map(Number);
  if (!isNaN(hours)) {
    const wake = new Date();
    wake.setHours(hours, minutes, 0, 0);
    for (const cycles of [6, 5, 4]) {
      const bed = new Date(wake.getTime() - (cycles * CYCLE + FALL_ASLEEP) * 60000);
      bedtimesEl.appendChild(timeBox(bed, cycles));
    }
  }

  waketimesEl.innerHTML = "";
  const now = new Date();
  for (const cycles of [4, 5, 6]) {
    const wakeAt = new Date(now.getTime() + (cycles * CYCLE + FALL_ASLEEP) * 60000);
    waketimesEl.appendChild(timeBox(wakeAt, cycles));
  }
}

wakeInput.addEventListener("input", render);
wakeInput.focus();
render();
// Keep the "from now" times current
setInterval(render, 60000);
