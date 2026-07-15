const textInput = document.getElementById("text-input");
const speakBtn = document.getElementById("speak-btn");
const stopBtn = document.getElementById("stop-btn");
const voiceSelect = document.getElementById("voice-select");
const rateSlider = document.getElementById("rate-slider");
const rateValue = document.getElementById("rate-value");
const pitchSlider = document.getElementById("pitch-slider");
const pitchValue = document.getElementById("pitch-value");
const volumeSlider = document.getElementById("volume-slider");
const volumeValue = document.getElementById("volume-value");

const synth = window.speechSynthesis;
let voices = [];

textInput.focus();

function populateVoices() {
  voices = synth.getVoices();
  voiceSelect.innerHTML = voices
    .map((voice, index) => `<option value="${index}">${voice.name}</option>`)
    .join("");
}

synth.onvoiceschanged = populateVoices;
populateVoices();

speakBtn.addEventListener("click", speak);
stopBtn.addEventListener("click", () => {
  synth.cancel();
  speakBtn.style.display = "inline-block";
  stopBtn.style.display = "none";
});

rateSlider.addEventListener("input", () => {
  rateValue.textContent = parseFloat(rateSlider.value).toFixed(1) + "x";
});

pitchSlider.addEventListener("input", () => {
  pitchValue.textContent = parseFloat(pitchSlider.value).toFixed(1);
});

volumeSlider.addEventListener("input", () => {
  volumeValue.textContent = Math.round(parseFloat(volumeSlider.value) * 100) + "%";
});

function speak() {
  const text = textInput.value.trim();
  if (!text) {
    alert("Please enter some text");
    return;
  }

  synth.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.voice = voices[voiceSelect.value];
  utterance.rate = parseFloat(rateSlider.value);
  utterance.pitch = parseFloat(pitchSlider.value);
  utterance.volume = parseFloat(volumeSlider.value);

  utterance.onend = () => {
    speakBtn.style.display = "inline-block";
    stopBtn.style.display = "none";
  };

  speakBtn.style.display = "none";
  stopBtn.style.display = "inline-block";
  synth.speak(utterance);
}
