const recordBtn = document.getElementById("record-btn");
const stopBtn = document.getElementById("stop-btn");
const clearBtn = document.getElementById("clear-btn");
const finalText = document.getElementById("final-text");
const interimText = document.getElementById("interim-text");
const indicator = document.getElementById("indicator");
const confidence = document.getElementById("confidence");

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();

recognition.continuous = true;
recognition.interimResults = true;
recognition.lang = "en-US";

let isRecording = false;

recordBtn.addEventListener("click", startRecording);
stopBtn.addEventListener("click", stopRecording);
clearBtn.addEventListener("click", clearText);

function startRecording() {
  if (isRecording) return;
  isRecording = true;
  finalText.textContent = "";
  interimText.textContent = "";
  confidence.textContent = "";
  indicator.classList.add("active");
  recordBtn.style.display = "none";
  stopBtn.style.display = "inline-block";
  recognition.start();
}

function stopRecording() {
  isRecording = false;
  indicator.classList.remove("active");
  recordBtn.style.display = "inline-block";
  stopBtn.style.display = "none";
  recognition.stop();
}

function clearText() {
  finalText.textContent = "";
  interimText.textContent = "";
  confidence.textContent = "";
  if (isRecording) {
    stopRecording();
  }
}

recognition.onresult = (event) => {
  let interim = "";
  let final = finalText.textContent;

  for (let i = event.resultIndex; i < event.results.length; i++) {
    const transcript = event.results[i][0].transcript;

    if (event.results[i].isFinal) {
      final += transcript + " ";
    } else {
      interim += transcript;
    }
  }

  finalText.textContent = final;
  interimText.textContent = interim;

  if (event.results[event.results.length - 1].isFinal) {
    const conf = Math.round(event.results[event.results.length - 1][0].confidence * 100);
    confidence.textContent = `Confidence: ${conf}%`;
  }
};

recognition.onerror = (event) => {
  confidence.textContent = "Error: " + event.error;
};

recognition.onend = () => {
  isRecording = false;
  indicator.classList.remove("active");
  recordBtn.style.display = "inline-block";
  stopBtn.style.display = "none";
};
