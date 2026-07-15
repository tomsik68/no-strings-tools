const generateBtn = document.getElementById("generate-btn");
const paletteGrid = document.getElementById("palette-grid");

let palette = [];

generateBtn.addEventListener("click", generatePalette);

function randomHex() {
  return Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0");
}

function hexToRgb(hex) {
  const result = /^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? `rgb(${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)})` : "";
}

function generatePalette() {
  palette = Array.from({ length: 5 }, () => randomHex());
  renderPalette();
}

function renderPalette() {
  paletteGrid.innerHTML = palette
    .map(
      (hex, index) => `
        <div class="color-card">
          <div class="color-swatch" style="background-color: #${hex};"></div>
          <div class="color-info">
            <div class="color-hex" data-hex="${hex}">#${hex.toUpperCase()}</div>
            <div class="color-copy-feedback" id="feedback-${index}"></div>
          </div>
        </div>
      `
    )
    .join("");

  paletteGrid.querySelectorAll(".color-hex").forEach((hexEl, index) => {
    hexEl.addEventListener("click", () => {
      const hex = hexEl.getAttribute("data-hex");
      navigator.clipboard.writeText(`#${hex}`).then(() => {
        const feedback = document.getElementById(`feedback-${index}`);
        feedback.textContent = "Copied!";
        setTimeout(() => {
          feedback.textContent = "";
        }, 1500);
      });
    });
  });
}

generatePalette();
