const input = document.getElementById("input");
const output = document.getElementById("output");
const shiftEl = document.getElementById("shift");
const upBtn = document.getElementById("up-btn");
const downBtn = document.getElementById("down-btn");
const copyBtn = document.getElementById("copy-btn");
const copyFeedback = document.getElementById("copy-feedback");

input.focus();

let shift = 0;

const NOTES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const NOTE_INDEX = {
  C: 0, "C#": 1, Db: 1, D: 2, "D#": 3, Eb: 3, E: 4, Fb: 4, "E#": 5, F: 5, "F#": 6,
  Gb: 6, G: 7, "G#": 8, Ab: 8, A: 9, "A#": 10, Bb: 10, B: 11, Cb: 11, "B#": 0,
};

const CHORD_RE = /^([A-G][#b]?)((?:maj|min|m|M|dim|aug|sus|add|\d|[+°ø()\-])*)(?:\/([A-G][#b]?))?$/;
// Non-chord tokens that may appear on a chord line without disqualifying it
const FILLER_RE = /^([|/:%.\-–—]+|x\d+|\(x\d+\)|N\.?C\.?)$/i;

function transposeNote(note) {
  return NOTES[(NOTE_INDEX[note] + shift + 120) % 12];
}

function transposeToken(token) {
  const m = token.match(CHORD_RE);
  if (!m) return token;
  const [, root, suffix, bass] = m;
  return transposeNote(root) + suffix + (bass ? "/" + transposeNote(bass) : "");
}

function isChordLine(line) {
  const tokens = line.trim().split(/\s+/).filter(Boolean);
  if (!tokens.length) return false;
  return tokens.every((t) => CHORD_RE.test(t) || FILLER_RE.test(t));
}

function update() {
  shiftEl.textContent = shift > 0 ? "+" + shift : shift;
  copyFeedback.textContent = "";
  output.value = input.value
    .split("\n")
    .map((line) =>
      isChordLine(line)
        ? line.replace(/\S+/g, (token) => transposeToken(token))
        : line
    )
    .join("\n");
}

upBtn.addEventListener("click", () => {
  shift = (shift + 1) % 12;
  update();
});
downBtn.addEventListener("click", () => {
  shift = shift - 1 <= -12 ? 0 : shift - 1;
  update();
});
input.addEventListener("input", update);

copyBtn.addEventListener("click", async () => {
  await navigator.clipboard.writeText(output.value);
  copyFeedback.textContent = "Copied ✓";
});
