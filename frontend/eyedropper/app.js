const pickBtn = document.getElementById("pick-btn");
const errorEl = document.getElementById("error");
const resultEl = document.getElementById("result");
const swatch = document.getElementById("swatch");
const hexEl = document.getElementById("hex");
const rgbEl = document.getElementById("rgb");
const historyEl = document.getElementById("history");

function show(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);

  resultEl.style.display = "block";
  swatch.style.background = hex;
  hexEl.textContent = hex;
  rgbEl.textContent = `rgb(${r}, ${g}, ${b})`;
}

function addToHistory(hex) {
  const chip = document.createElement("button");
  chip.className = "history-swatch";
  chip.style.background = hex;
  chip.setAttribute("aria-label", `Recall color ${hex}`);
  chip.addEventListener("click", () => show(hex));
  historyEl.prepend(chip);
}

pickBtn.addEventListener("click", async () => {
  try {
    const { sRGBHex } = await new EyeDropper().open();
    console.log("[eyedropper] picked", sRGBHex);
    show(sRGBHex);
    addToHistory(sRGBHex);
  } catch {
    // User pressed Escape — not an error
  }
});

function copyOnClick(boxId, el) {
  document.getElementById(boxId).addEventListener("click", () => {
    navigator.clipboard.writeText(el.textContent);
  });
}
copyOnClick("hex-box", hexEl);
copyOnClick("rgb-box", rgbEl);

if (!("EyeDropper" in window)) {
  pickBtn.disabled = true;
  errorEl.textContent = "The EyeDropper API needs Chrome or Edge";
  errorEl.style.display = "block";
}
