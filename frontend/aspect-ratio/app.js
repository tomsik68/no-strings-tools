const origW = document.getElementById("orig-w");
const origH = document.getElementById("orig-h");
const newW = document.getElementById("new-w");
const newH = document.getElementById("new-h");
const ratioEl = document.getElementById("ratio");
const ratioDecimalEl = document.getElementById("ratio-decimal");

origW.focus();

const gcd = (a, b) => (b ? gcd(b, a % b) : a);
const round = (x) => Math.round(x * 1000) / 1000;

function updateRatio() {
  const w = Number(origW.value);
  const h = Number(origH.value);
  if (w > 0 && h > 0) {
    const d = gcd(w, h);
    ratioEl.textContent = `${w / d}:${h / d}`;
    ratioDecimalEl.textContent = round(w / h);
  } else {
    ratioEl.textContent = "—";
    ratioDecimalEl.textContent = "";
  }
}

function scale(changed) {
  const w = Number(origW.value);
  const h = Number(origH.value);
  if (!(w > 0 && h > 0)) return;
  if (changed === newW) {
    newH.value = newW.value ? round((Number(newW.value) * h) / w) : "";
  } else {
    newW.value = newH.value ? round((Number(newH.value) * w) / h) : "";
  }
}

origW.addEventListener("input", () => { updateRatio(); scale(newW); });
origH.addEventListener("input", () => { updateRatio(); scale(newW); });
newW.addEventListener("input", () => scale(newW));
newH.addEventListener("input", () => scale(newH));

updateRatio();
