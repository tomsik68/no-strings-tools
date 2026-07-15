const noiseBtns = document.querySelectorAll(".noise-btn");
const playBtn = document.getElementById("play-btn");
const stopBtn = document.getElementById("stop-btn");
const volumeSlider = document.getElementById("volume-slider");
const volumeValue = document.getElementById("volume-value");
const status = document.getElementById("status");

const audioContext = new (window.AudioContext || window.webkitAudioContext)();
let bufferSource = null;
let noiseBuffer = null;
let selectedType = "white";
let isPlaying = false;

noiseBtns.forEach((btn) => {
  btn.addEventListener("click", (e) => {
    noiseBtns.forEach((b) => b.classList.remove("active"));
    e.target.classList.add("active");
    selectedType = e.target.getAttribute("data-type");
    if (isPlaying) {
      stop();
      play();
    }
  });
});

playBtn.addEventListener("click", play);
stopBtn.addEventListener("click", stop);

volumeSlider.addEventListener("input", () => {
  volumeValue.textContent = Math.round(parseFloat(volumeSlider.value) * 100) + "%";
  if (bufferSource && bufferSource.gainNode) {
    bufferSource.gainNode.gain.value = parseFloat(volumeSlider.value);
  }
});

function generateWhiteNoise(duration) {
  const buffer = audioContext.createBuffer(1, audioContext.sampleRate * duration, audioContext.sampleRate);
  const output = buffer.getChannelData(0);
  for (let i = 0; i < buffer.length; i++) {
    output[i] = Math.random() * 2 - 1;
  }
  return buffer;
}

function generateBrownNoise(duration) {
  const buffer = audioContext.createBuffer(1, audioContext.sampleRate * duration, audioContext.sampleRate);
  const output = buffer.getChannelData(0);
  let lastOut = 0;
  for (let i = 0; i < buffer.length; i++) {
    const white = Math.random() * 2 - 1;
    output[i] = (lastOut + 0.02 * white) / 1.02;
    lastOut = output[i];
    output[i] *= 3.5;
  }
  return buffer;
}

function generatePinkNoise(duration) {
  const buffer = audioContext.createBuffer(1, audioContext.sampleRate * duration, audioContext.sampleRate);
  const output = buffer.getChannelData(0);
  let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
  for (let i = 0; i < buffer.length; i++) {
    const white = Math.random() * 2 - 1;
    b0 = 0.049922035 * white + 0.950177995 * b0;
    b1 = 0.362034884 * b0 + 0.637965116 * b1;
    b2 = 0.21735469 * b1 + 0.78264531 * b2;
    b3 = 0.115440149 * b2 + 0.884559851 * b3;
    b4 = 0.064381655 * b3 + 0.935618345 * b4;
    b5 = 0.02647853 * b4 + 0.97352147 * b5;
    b6 = 0.00845005 * b5 + 0.99154995 * b6;
    output[i] = b6 * 3.5;
  }
  return buffer;
}

function play() {
  if (isPlaying) return;

  const duration = 60;

  if (selectedType === "white") {
    noiseBuffer = generateWhiteNoise(duration);
  } else if (selectedType === "brown") {
    noiseBuffer = generateBrownNoise(duration);
  } else if (selectedType === "pink") {
    noiseBuffer = generatePinkNoise(duration);
  }

  bufferSource = audioContext.createBufferSource();
  bufferSource.buffer = noiseBuffer;
  bufferSource.loop = true;

  const gainNode = audioContext.createGain();
  bufferSource.gainNode = gainNode;
  gainNode.gain.value = parseFloat(volumeSlider.value);

  bufferSource.connect(gainNode);
  gainNode.connect(audioContext.destination);
  bufferSource.start(0);

  isPlaying = true;
  playBtn.style.display = "none";
  stopBtn.style.display = "inline-block";
  status.textContent = "Playing " + selectedType + " noise...";
  status.classList.add("playing");
}

function stop() {
  if (!bufferSource) return;
  bufferSource.stop();
  isPlaying = false;
  playBtn.style.display = "inline-block";
  stopBtn.style.display = "none";
  status.textContent = "Stopped";
  status.classList.remove("playing");
}
