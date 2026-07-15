const recordBtn = document.getElementById("record-btn");
const previewBtn = document.getElementById("preview-btn");
const recIndicator = document.getElementById("rec-indicator");
const errorEl = document.getElementById("error");
const hintEl = document.getElementById("hint");
const playback = document.getElementById("playback");
const downloadLink = document.getElementById("download-link");

const micCheckbox = document.getElementById("mic-checkbox");
const camCheckbox = document.getElementById("cam-checkbox");

let recorder = null;
let stream = null;
let userStream = null;
let mixContext = null;
let rafId = null;
let liveStream = null;

function playVideo(mediaStream) {
  const video = document.createElement("video");
  video.srcObject = mediaStream;
  video.muted = true;
  video.playsInline = true;
  return video.play().then(() => video);
}

// MediaRecorder takes a single audio track, so desktop audio and the
// microphone are mixed into one via Web Audio
function mixedAudioTracks() {
  const audioTracks = [
    ...stream.getAudioTracks(),
    ...(userStream ? userStream.getAudioTracks() : []),
  ];
  console.log("[screen-recorder] audio tracks:", audioTracks.length, "(desktop:", stream.getAudioTracks().length, "mic:", userStream ? userStream.getAudioTracks().length : 0, ")");

  if (audioTracks.length <= 1) return audioTracks;
  mixContext = new AudioContext();
  const destination = mixContext.createMediaStreamDestination();
  for (const source of [stream, userStream]) {
    if (source && source.getAudioTracks().length) {
      mixContext.createMediaStreamSource(new MediaStream(source.getAudioTracks())).connect(destination);
    }
  }
  return destination.stream.getAudioTracks();
}

// With the webcam on, screen + camera are composited onto a canvas and the
// canvas stream is recorded instead of the raw screen track
async function videoTracks() {
  const camTracks = userStream ? userStream.getVideoTracks() : [];
  if (!camTracks.length) return stream.getVideoTracks();

  const screenVideo = await playVideo(new MediaStream(stream.getVideoTracks()));
  const camVideo = await playVideo(new MediaStream(camTracks));
  const canvas = document.createElement("canvas");
  canvas.width = screenVideo.videoWidth;
  canvas.height = screenVideo.videoHeight;
  const ctx = canvas.getContext("2d");

  function draw() {
    // The shared window/tab can be resized mid-recording
    if (canvas.width !== screenVideo.videoWidth || canvas.height !== screenVideo.videoHeight) {
      canvas.width = screenVideo.videoWidth;
      canvas.height = screenVideo.videoHeight;
    }
    ctx.drawImage(screenVideo, 0, 0, canvas.width, canvas.height);
    if (camVideo.videoWidth) {
      const w = Math.round(canvas.width * 0.2);
      const h = Math.round((w * camVideo.videoHeight) / camVideo.videoWidth);
      ctx.drawImage(camVideo, canvas.width - w - 16, canvas.height - h - 16, w, h);
    }
    rafId = requestAnimationFrame(draw);
  }
  draw();
  return canvas.captureStream(30).getVideoTracks();
}

async function acquireUserStream() {
  userStream = null;
  const wantMic = micCheckbox.checked;
  const wantCam = camCheckbox.checked;
  if (!wantMic && !wantCam) return;
  try {
    userStream = await navigator.mediaDevices.getUserMedia({ audio: wantMic, video: wantCam });
  } catch (err) {
    console.error("[screen-recorder] mic/webcam unavailable:", err.name);
    if (wantMic && wantCam) {
      try {
        userStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      } catch (err2) {
        console.error("[screen-recorder] mic also unavailable, recording screen only:", err2.name);
      }
    }
  }
}

async function acquireLiveStream() {
  try {
    // systemAudio hint makes Chrome on Windows offer system audio for full-screen shares
    stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true, systemAudio: "include" });
  } catch (err) {
    console.log("[screen-recorder] user cancelled or denied:", err.name);
    return false;
  }

  // Desktop audio only comes through for tab shares (and full screens on
  // Windows/ChromeOS) — warn instead of producing a silently soundless file
  hintEl.style.display = stream.getAudioTracks().length ? "none" : "block";

  await acquireUserStream();

  // The browser's own "Stop sharing" bar also ends the recording or preview
  stream.getVideoTracks()[0].addEventListener("ended", () => {
    if (recorder && recorder.state === "recording") recorder.stop();
    else stopLive();
  });

  liveStream = new MediaStream([...(await videoTracks()), ...mixedAudioTracks()]);
  return true;
}

// Toggling mic/webcam while previewing rebuilds the live stream in place,
// reusing the screen share so the browser doesn't re-prompt
async function applyOptionChange() {
  if (!liveStream || recorder) return;
  // Lock the controls while streams are half torn down (getUserMedia can block on a permission prompt)
  recordBtn.disabled = previewBtn.disabled = micCheckbox.disabled = camCheckbox.disabled = true;
  if (rafId) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }
  if (mixContext) {
    mixContext.close();
    mixContext = null;
  }
  if (userStream) userStream.getTracks().forEach((t) => t.stop());
  await acquireUserStream();
  liveStream = new MediaStream([...(await videoTracks()), ...mixedAudioTracks()]);
  showLive();
  recordBtn.disabled = previewBtn.disabled = micCheckbox.disabled = camCheckbox.disabled = false;
}

function showLive() {
  playback.srcObject = liveStream;
  playback.muted = true; // live monitoring with sound would feed back into the mic
  playback.controls = false;
  playback.style.display = "block";
  playback.play();
  downloadLink.style.display = "none";
}

function stopLive() {
  if (rafId) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }
  if (stream) stream.getTracks().forEach((t) => t.stop());
  if (userStream) userStream.getTracks().forEach((t) => t.stop());
  if (mixContext) {
    mixContext.close();
    mixContext = null;
  }
  stream = userStream = liveStream = null;
  if (playback.srcObject) {
    playback.srcObject = null;
    playback.style.display = "none";
  }
  hintEl.style.display = "none";
  previewBtn.textContent = "👁 Show preview";
}

async function startRecording() {
  errorEl.style.display = "none";
  // An open preview already has all the streams — record it without re-prompting
  if (!liveStream && !(await acquireLiveStream())) return;
  showLive();

  const chunks = [];
  recorder = new MediaRecorder(liveStream);
  recorder.ondataavailable = (e) => chunks.push(e.data);
  recorder.onstop = () => {
    console.log("[screen-recorder] stopped,", chunks.length, "chunks");
    const blob = new Blob(chunks, { type: recorder.mimeType });
    stopLive();
    const url = URL.createObjectURL(blob);
    playback.src = url;
    playback.muted = false;
    playback.controls = true;
    playback.style.display = "block";
    downloadLink.href = url;
    downloadLink.download = `recording-${new Date().toISOString().slice(0, 19).replace(/[T:]/g, "-")}.webm`;
    downloadLink.style.display = "block";
    recorder = null;
    recordBtn.textContent = "⏺ Start recording";
    recordBtn.classList.replace("w3-red", "w3-blue");
    recIndicator.style.display = "none";
    previewBtn.disabled = false;
    micCheckbox.disabled = camCheckbox.disabled = false;
  };

  recorder.start();
  console.log("[screen-recorder] recording started");
  recordBtn.textContent = "⏹ Stop recording";
  recordBtn.classList.replace("w3-blue", "w3-red");
  recIndicator.style.display = "block";
  previewBtn.disabled = true;
  previewBtn.textContent = "👁 Show preview";
  // MediaRecorder can't swap tracks mid-file, so options lock while recording
  micCheckbox.disabled = camCheckbox.disabled = true;
}

recordBtn.addEventListener("click", () => {
  if (recorder && recorder.state === "recording") recorder.stop();
  else startRecording();
});

previewBtn.addEventListener("click", async () => {
  if (liveStream) {
    stopLive();
    return;
  }
  errorEl.style.display = "none";
  if (!(await acquireLiveStream())) return;
  showLive();
  previewBtn.textContent = "🙈 Stop preview";
});

micCheckbox.addEventListener("change", applyOptionChange);
camCheckbox.addEventListener("change", applyOptionChange);

if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
  recordBtn.disabled = true;
  previewBtn.disabled = true;
  errorEl.textContent = "Screen capture isn't supported in this browser";
  errorEl.style.display = "block";
}
