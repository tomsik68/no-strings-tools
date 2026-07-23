const textInput = document.getElementById("text-input");
const formatSelect = document.getElementById("format-select");
const svg = document.getElementById("barcode");
const errorEl = document.getElementById("error");
const downloadBtn = document.getElementById("download-btn");

if (typeof JsBarcode === "undefined") {
  errorEl.textContent = "Barcode library failed to load — connect once so it can cache, then this works offline.";
  errorEl.style.display = "";
}

textInput.focus();

function generate() {
  const text = textInput.value.trim();
  svg.innerHTML = "";
  errorEl.style.display = "none";
  downloadBtn.style.display = "none";
  if (!text || typeof JsBarcode === "undefined") {
    if (typeof JsBarcode === "undefined") {
      errorEl.textContent = "Barcode library failed to load — connect once so it can cache, then this works offline.";
      errorEl.style.display = "";
    }
    return;
  }

  let ok = true;
  JsBarcode(svg, text, {
    format: formatSelect.value,
    width: 2,
    height: 90,
    margin: 12,
    valid: (v) => (ok = v),
  });

  if (!ok) {
    svg.innerHTML = "";
    errorEl.textContent = "That content doesn't fit the selected format — check the digits/length.";
    errorEl.style.display = "";
    return;
  }
  downloadBtn.style.display = "";
}

textInput.addEventListener("input", generate);
formatSelect.addEventListener("change", generate);

downloadBtn.addEventListener("click", () => {
  const xml = new XMLSerializer().serializeToString(svg);
  const img = new Image();
  img.onload = () => {
    const canvas = document.createElement("canvas");
    canvas.width = img.width * 2;
    canvas.height = img.height * 2;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = `barcode-${textInput.value.trim()}.png`;
    link.click();
  };
  img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(xml)));
});
