const statusEl = document.getElementById("status");
const buttons = {
  left: document.getElementById("left"),
  right: document.getElementById("right"),
  both: document.getElementById("both"),
  sweep: document.getElementById("sweep"),
};

let audioCtx = null;
let playing = null; // { osc, gain, button }

function stop() {
  if (!playing) return;
  const { gain, osc, button } = playing;
  gain.gain.setTargetAtTime(0, audioCtx.currentTime, 0.02); // fade out to avoid a click
  osc.stop(audioCtx.currentTime + 0.1);
  button.classList.remove("playing");
  statusEl.innerHTML = "&nbsp;";
  playing = null;
}

function play(button, pan, seconds, freqFrom, freqTo) {
  audioCtx ??= new AudioContext();
  audioCtx.resume();
  stop();

  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  const panner = audioCtx.createStereoPanner();

  osc.frequency.value = freqFrom;
  if (freqTo) osc.frequency.exponentialRampToValueAtTime(freqTo, audioCtx.currentTime + seconds);
  panner.pan.value = pan;

  gain.gain.value = 0;
  gain.gain.setTargetAtTime(0.25, audioCtx.currentTime, 0.02); // fade in
  gain.gain.setTargetAtTime(0, audioCtx.currentTime + seconds - 0.1, 0.02);

  osc.connect(gain).connect(panner).connect(audioCtx.destination);
  osc.start();
  osc.stop(audioCtx.currentTime + seconds);

  playing = { osc, gain, button };
  button.classList.add("playing");
  osc.onended = () => {
    if (playing && playing.osc === osc) {
      button.classList.remove("playing");
      statusEl.innerHTML = "&nbsp;";
      playing = null;
    }
  };
}

buttons.left.addEventListener("click", () => {
  play(buttons.left, -1, 1.5, 440);
  statusEl.textContent = "Playing on the LEFT channel…";
});
buttons.right.addEventListener("click", () => {
  play(buttons.right, 1, 1.5, 440);
  statusEl.textContent = "Playing on the RIGHT channel…";
});
buttons.both.addEventListener("click", () => {
  play(buttons.both, 0, 1.5, 440);
  statusEl.textContent = "Playing on BOTH channels…";
});
buttons.sweep.addEventListener("click", () => {
  play(buttons.sweep, 0, 5, 100, 10000);
  statusEl.textContent = "Sweeping 100 Hz → 10 kHz…";
});
