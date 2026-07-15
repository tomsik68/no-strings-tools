const textInput = document.getElementById("text-input");
const canvas = document.getElementById("qr-canvas");
const downloadBtn = document.getElementById("download-btn");
const downloadFeedback = document.getElementById("download-feedback");

textInput.focus();

function generateQR() {
  const text = textInput.value.trim();

  // Clear previous QR code
  canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);

  if (!text) return;

  QRCode.toCanvas(canvas, text, { width: 256, margin: 1, errorCorrectionLevel: "H" }, (error) => {
    if (error) {
      console.error(error);
    }
  });
}

textInput.addEventListener("input", generateQR);

downloadBtn.addEventListener("click", () => {
  const text = textInput.value.trim();
  if (!text) return;

  const link = document.createElement("a");
  link.href = canvas.toDataURL("image/png");
  link.download = `qr-${text.substring(0, 20)}.png`;
  link.click();

  downloadFeedback.textContent = "Downloaded!";
  setTimeout(() => {
    downloadFeedback.textContent = "";
  }, 2000);
});
