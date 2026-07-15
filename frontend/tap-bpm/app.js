const bpmEl = document.getElementById("bpm");
const tapsEl = document.getElementById("taps");
const tapBtn = document.getElementById("tap-btn");

const RESET_MS = 2000;
const WINDOW = 8; // average over the last N intervals

let taps = [];

function tap() {
  const now = performance.now();
  if (taps.length && now - taps[taps.length - 1] > RESET_MS) taps = [];
  taps.push(now);

  if (taps.length < 2) {
    bpmEl.textContent = "…";
    tapsEl.textContent = "keep tapping";
    return;
  }

  const recent = taps.slice(-(WINDOW + 1));
  const avgInterval = (recent[recent.length - 1] - recent[0]) / (recent.length - 1);
  bpmEl.textContent = Math.round(60000 / avgInterval);
  tapsEl.textContent = `${taps.length} taps`;
}

tapBtn.addEventListener("pointerdown", (e) => {
  e.preventDefault();
  tap();
});

document.addEventListener("keydown", (e) => {
  if (e.repeat) return;
  // keep keyboard navigation working
  if (e.key === "Tab" || (e.key === "Enter" && e.target.tagName === "A")) return;
  e.preventDefault();
  tap();
});

tapBtn.focus();
