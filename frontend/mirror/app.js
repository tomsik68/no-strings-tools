const video = document.getElementById("video");
const startBtn = document.getElementById("start-btn");
const freezeBtn = document.getElementById("freeze-btn");
const errorEl = document.getElementById("error");

let frozen = false;

startBtn.addEventListener("click", async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "user", width: { ideal: 1280 } },
    });
    console.log("[mirror] camera started");
    video.srcObject = stream;
    errorEl.style.display = "none";
    startBtn.style.display = "none";
    freezeBtn.style.display = "block";
  } catch (err) {
    console.error("[mirror] camera error:", err);
    errorEl.textContent = "Camera access needed — allow it and try again";
    errorEl.style.display = "block";
  }
});

freezeBtn.addEventListener("click", () => {
  frozen = !frozen;
  if (frozen) {
    video.pause();
    freezeBtn.textContent = "▶️ Unfreeze";
  } else {
    video.play();
    freezeBtn.textContent = "❄️ Freeze";
  }
});
