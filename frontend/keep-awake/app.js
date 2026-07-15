const toggleBtn = document.getElementById("toggle-btn");
const statusEl = document.getElementById("status");
const errorEl = document.getElementById("error");

let wakeLock = null;
let wantAwake = false;

function renderState() {
  if (wantAwake) {
    toggleBtn.textContent = "☀️ Staying awake";
    toggleBtn.classList.replace("w3-blue", "w3-green");
    statusEl.textContent = "Screen will not sleep while this tab stays visible.";
  } else {
    toggleBtn.textContent = "😴 Screen can sleep";
    toggleBtn.classList.replace("w3-green", "w3-blue");
    statusEl.textContent = "Tap to keep the screen awake while this tab is visible.";
  }
}

async function acquire() {
  try {
    wakeLock = await navigator.wakeLock.request("screen");
    console.log("[keep-awake] wake lock acquired");
    wakeLock.addEventListener("release", () => console.log("[keep-awake] wake lock released"));
  } catch (err) {
    console.error("[keep-awake] request failed:", err);
    wantAwake = false;
    errorEl.textContent = "Couldn't acquire wake lock — check battery saver mode";
    errorEl.style.display = "block";
    renderState();
  }
}

toggleBtn.addEventListener("click", async () => {
  errorEl.style.display = "none";
  wantAwake = !wantAwake;
  if (wantAwake) await acquire();
  else if (wakeLock) {
    await wakeLock.release();
    wakeLock = null;
  }
  renderState();
});

// The lock is auto-released when the tab is hidden; re-acquire on return
document.addEventListener("visibilitychange", () => {
  if (wantAwake && document.visibilityState === "visible") acquire();
});

if (!("wakeLock" in navigator)) {
  toggleBtn.disabled = true;
  errorEl.textContent = "Wake Lock isn't supported in this browser";
  errorEl.style.display = "block";
}
