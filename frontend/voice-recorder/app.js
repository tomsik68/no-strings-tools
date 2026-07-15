const recordBtn = document.getElementById("record-btn");
const timerEl = document.getElementById("timer");
const errorEl = document.getElementById("error");
const resultEl = document.getElementById("result");
const playback = document.getElementById("playback");
const downloadLink = document.getElementById("download-link");

let recorder = null;
let timerInterval = null;
let startTime = 0;

function updateTimer() {
  const seconds = Math.floor((Date.now() - startTime) / 1000);
  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");
  timerEl.textContent = `${mm}:${ss}`;
}

async function start() {
  let stream;
  try {
    stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  } catch (err) {
    console.error("[voice-recorder] mic error:", err);
    errorEl.textContent = "Microphone access needed — allow it and try again";
    errorEl.style.display = "block";
    return;
  }
  errorEl.style.display = "none";
  resultEl.style.display = "none";

  const chunks = [];
  recorder = new MediaRecorder(stream);
  recorder.ondataavailable = (e) => chunks.push(e.data);
  recorder.onstop = () => {
    console.log("[voice-recorder] stopped,", chunks.length, "chunks");
    stream.getTracks().forEach((t) => t.stop());
    clearInterval(timerInterval);
    const blob = new Blob(chunks, { type: recorder.mimeType });
    const url = URL.createObjectURL(blob);
    playback.src = url;
    downloadLink.href = url;
    const ext = recorder.mimeType.includes("ogg") ? "ogg" : "webm";
    downloadLink.download = `voice-${new Date().toISOString().slice(0, 19).replace(/[T:]/g, "-")}.${ext}`;
    resultEl.style.display = "block";
    recorder = null;
    recordBtn.textContent = "🎤 Start recording";
    recordBtn.classList.replace("w3-red", "w3-blue");
    timerEl.classList.remove("recording");
  };

  recorder.start();
  console.log("[voice-recorder] recording started");
  startTime = Date.now();
  updateTimer();
  timerInterval = setInterval(updateTimer, 500);
  recordBtn.textContent = "⏹ Stop recording";
  recordBtn.classList.replace("w3-blue", "w3-red");
  timerEl.classList.add("recording");
}

recordBtn.addEventListener("click", () => {
  if (recorder && recorder.state === "recording") recorder.stop();
  else start();
});
