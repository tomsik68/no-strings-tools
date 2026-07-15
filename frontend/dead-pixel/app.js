const startBtn = document.getElementById("start-btn");
const screenEl = document.getElementById("screen");

const COLORS = ["#ffffff", "#000000", "#ff0000", "#00ff00", "#0000ff", "#00ffff", "#ff00ff", "#ffff00"];
let index = 0;

function show() {
  screenEl.style.background = COLORS[index];
}

startBtn.addEventListener("click", async () => {
  index = 0;
  show();
  screenEl.style.display = "block";
  try {
    await screenEl.requestFullscreen();
  } catch {
    // no fullscreen (e.g. iPhone Safari) — the fixed overlay still covers the viewport
  }
});

screenEl.addEventListener("click", () => {
  index = (index + 1) % COLORS.length;
  show();
});

document.addEventListener("keydown", (e) => {
  if (screenEl.style.display !== "block") return;
  if (e.key === "ArrowRight" || e.key === "ArrowDown" || e.key === " ") index = (index + 1) % COLORS.length;
  else if (e.key === "ArrowLeft" || e.key === "ArrowUp") index = (index + COLORS.length - 1) % COLORS.length;
  else if (e.key === "Escape") screenEl.style.display = "none"; // for the no-fullscreen fallback
  else return;
  e.preventDefault();
  show();
});

document.addEventListener("fullscreenchange", () => {
  if (!document.fullscreenElement) screenEl.style.display = "none";
});
