const ssidInput = document.getElementById("ssid-input");
const passwordInput = document.getElementById("password-input");
const securitySelect = document.getElementById("security-select");
const canvas = document.getElementById("qr-canvas");
const downloadBtn = document.getElementById("download-btn");

ssidInput.focus();

// Special characters in the WIFI: format must be backslash-escaped
function escapeField(s) {
  return s.replace(/([\\;,:"])/g, "\\$1");
}

function generate() {
  const ssid = ssidInput.value;
  const password = passwordInput.value;
  const security = securitySelect.value;

  passwordInput.disabled = security === "nopass";

  canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
  downloadBtn.style.display = "none";

  if (!ssid || (security !== "nopass" && !password)) return;

  const payload =
    security === "nopass"
      ? `WIFI:T:nopass;S:${escapeField(ssid)};;`
      : `WIFI:T:${security};S:${escapeField(ssid)};P:${escapeField(password)};;`;

  QRCode.toCanvas(canvas, payload, { width: 256, margin: 1, errorCorrectionLevel: "M" }, (error) => {
    if (!error) downloadBtn.style.display = "";
  });
}

ssidInput.addEventListener("input", generate);
passwordInput.addEventListener("input", generate);
securitySelect.addEventListener("change", generate);

downloadBtn.addEventListener("click", () => {
  const link = document.createElement("a");
  link.href = canvas.toDataURL("image/png");
  link.download = `wifi-${ssidInput.value.trim() || "qr"}.png`;
  link.click();
});
