const imeiInput = document.getElementById("imei-input");
const generateBtn = document.getElementById("generate-btn");
const randomBtn = document.getElementById("random-btn");
const downloadBtn = document.getElementById("download-btn");
const messageEl = document.getElementById("message");
const barcodeEl = document.getElementById("barcode");

function luhnChecksum(digits) {
  let sum = 0;
  let alternate = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let n = parseInt(digits[i], 10);
    if (alternate) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    alternate = !alternate;
  }
  return sum % 10;
}

function isValidImei(imei) {
  if (!/^\d{15}$/.test(imei)) return false;
  return luhnChecksum(imei) === 0;
}

function generateRandomImei() {
  const tac = ["35", "01", "86", "99", "45", "23"][Math.floor(Math.random() * 6)];
  let digits = tac;
  for (let i = 0; i < 12; i++) digits += Math.floor(Math.random() * 10);
  // Find check digit that makes Luhn valid
  for (let check = 0; check <= 9; check++) {
    if (luhnChecksum(digits + check) === 0) return digits + check;
  }
  return digits + "0";
}

function showMessage(text, isError) {
  messageEl.className = isError ? "error" : "valid";
  messageEl.textContent = text;
  messageEl.style.display = text ? "block" : "none";
}

function generate() {
  const imei = imeiInput.value.trim();
  if (!/^\d+$/.test(imei)) {
    showMessage("Please enter digits only.", true);
    downloadBtn.style.display = "none";
    return;
  }
  if (imei.length !== 15) {
    showMessage(`IMEI must be exactly 15 digits (you entered ${imei.length}).`, true);
    downloadBtn.style.display = "none";
    return;
  }
  if (!isValidImei(imei)) {
    showMessage("Checksum failed — this is not a valid IMEI.", true);
    downloadBtn.style.display = "none";
    return;
  }

  try {
    JsBarcode("#barcode", imei, {
      format: "CODE128",
      lineColor: "#000",
      width: 2,
      height: 80,
      displayValue: true,
      fontSize: 16,
      margin: 10,
    });
    showMessage("Valid IMEI — barcode generated.", false);
    downloadBtn.style.display = "inline-block";
  } catch (e) {
    showMessage("Could not generate barcode: " + e.message, true);
    downloadBtn.style.display = "none";
  }
}

function downloadPng() {
  const svg = barcodeEl;
  const serializer = new XMLSerializer();
  const svgStr = serializer.serializeToString(svg);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  const img = new Image();
  const svgBlob = new Blob([svgStr], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(svgBlob);
  img.onload = () => {
    canvas.width = img.width * 2;
    canvas.height = img.height * 2;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    URL.revokeObjectURL(url);
    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/png");
    a.download = `imei-${imeiInput.value.trim()}.png`;
    a.click();
  };
  img.src = url;
}

randomBtn.addEventListener("click", () => {
  imeiInput.value = generateRandomImei();
  generate();
});

generateBtn.addEventListener("click", generate);
downloadBtn.addEventListener("click", downloadPng);
imeiInput.addEventListener("input", () => {
  imeiInput.value = imeiInput.value.replace(/\D/g, "");
});
imeiInput.addEventListener("keydown", e => {
  if (e.key === "Enter") generate();
});
imeiInput.focus();
