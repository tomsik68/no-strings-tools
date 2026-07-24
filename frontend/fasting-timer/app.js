const KEY = "fasting-timer";
let state = JSON.parse(localStorage.getItem(KEY) || '{"goalHours":16,"startedAt":null,"history":[]}');

const save = () => localStorage.setItem(KEY, JSON.stringify(state));
const pad = (n) => String(n).padStart(2, "0");

function fmtHMS(ms) {
  if (ms < 0) ms = 0;
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  return `${h}:${pad(m)}:${pad(s % 60)}`;
}

function fmtHours(ms) {
  return (ms / 3600000).toFixed(1) + "h";
}

function render() {
  const goalMs = state.goalHours * 3600000;
  document.getElementById("goal-hours").value = state.goalHours;
  document.getElementById("goal-line").textContent = `Goal: ${state.goalHours} hours`;

  const startBtn = document.getElementById("start-btn");
  const stopBtn = document.getElementById("stop-btn");
  const cancelBtn = document.getElementById("cancel-btn");
  const phase = document.getElementById("phase-label");
  const elapsedEl = document.getElementById("elapsed");
  const progress = document.getElementById("progress");
  const eta = document.getElementById("eta");

  if (state.startedAt) {
    const elapsed = Date.now() - new Date(state.startedAt).getTime();
    const pct = Math.min(100, (elapsed / goalMs) * 100);
    elapsedEl.textContent = fmtHMS(elapsed);
    progress.style.width = pct + "%";
    progress.className = pct >= 100 ? "w3-green" : "w3-blue";
    phase.textContent = pct >= 100 ? "Goal reached" : "Fasting";
    startBtn.style.display = "none";
    stopBtn.style.display = "";
    cancelBtn.style.display = "";
    if (pct < 100) {
      const left = goalMs - elapsed;
      const doneAt = new Date(Date.now() + left);
      eta.textContent = `Done at ${doneAt.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}`;
    } else {
      eta.textContent = `Started ${new Date(state.startedAt).toLocaleString()}`;
    }
  } else {
    elapsedEl.textContent = "0:00:00";
    progress.style.width = "0%";
    progress.className = "w3-blue";
    phase.textContent = "Ready";
    startBtn.style.display = "";
    stopBtn.style.display = "none";
    cancelBtn.style.display = "none";
    eta.textContent = "";
  }

  const hist = document.getElementById("history");
  if (!state.history.length) {
    hist.innerHTML = "";
    return;
  }
  hist.innerHTML = `<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
      <span class="w3-text-grey w3-small">Recent fasts</span>
      <button id="clear-history" class="w3-button w3-small w3-text-grey" style="padding: 2px 8px;">Clear</button>
    </div>` +
    state.history.slice(0, 10).map((h) => {
      const start = new Date(h.start);
      return `<div class="w3-panel w3-white w3-round w3-border" style="padding: 8px 12px; margin: 0 0 6px; display: flex; justify-content: space-between;">
        <span>${start.toLocaleDateString(undefined, { month: "short", day: "numeric" })}</span>
        <strong>${fmtHours(h.ms)}</strong>
      </div>`;
    }).join("");
}

document.getElementById("start-btn").addEventListener("click", () => {
  state.startedAt = new Date().toISOString();
  save();
  render();
});

document.getElementById("stop-btn").addEventListener("click", () => {
  if (!state.startedAt) return;
  const ms = Date.now() - new Date(state.startedAt).getTime();
  state.history.unshift({ start: state.startedAt, ms });
  state.history = state.history.slice(0, 30);
  state.startedAt = null;
  save();
  render();
});

document.getElementById("cancel-btn").addEventListener("click", () => {
  if (!state.startedAt) return;
  if (!confirm("Discard the current fast without saving it?")) return;
  state.startedAt = null;
  save();
  render();
});

document.getElementById("history").addEventListener("click", (ev) => {
  if (!ev.target.closest("#clear-history")) return;
  if (!confirm("Clear all saved fasts?")) return;
  state.history = [];
  save();
  render();
});

document.getElementById("goal-hours").addEventListener("change", () => {
  const v = parseInt(document.getElementById("goal-hours").value, 10);
  if (v >= 1 && v <= 72) {
    state.goalHours = v;
    save();
    render();
  }
});

render();
setInterval(render, 1000);
