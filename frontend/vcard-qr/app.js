const nameInput = document.getElementById("name-input");
const phoneInput = document.getElementById("phone-input");
const emailInput = document.getElementById("email-input");
const orgInput = document.getElementById("org-input");
const canvas = document.getElementById("qr-canvas");
const downloadBtn = document.getElementById("download-btn");

if (typeof QRCode === "undefined") {
  downloadBtn.insertAdjacentHTML("beforebegin",
    '<p class="w3-text-red w3-small">QR library failed to load — connect once so it can cache, then this works offline.</p>');
}

nameInput.focus();

// Backslash, comma and semicolon are special in vCard values
const esc = (s) => s.trim().replace(/\\/g, "\\\\").replace(/([;,])/g, "\\$1");

function generate() {
  const name = nameInput.value.trim();
  const phone = phoneInput.value.trim();
  const email = emailInput.value.trim();
  const org = orgInput.value.trim();

  canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
  downloadBtn.style.display = "none";
  if (!name || (!phone && !email) || typeof QRCode === "undefined") return;

  const words = name.split(/\s+/);
  const family = words.length > 1 ? words[words.length - 1] : "";
  const given = words.slice(0, words.length > 1 ? -1 : 1).join(" ");

  const lines = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `N:${esc(family)};${esc(given)};;;`,
    `FN:${esc(name)}`,
    phone && `TEL;TYPE=CELL:${esc(phone)}`,
    email && `EMAIL:${esc(email)}`,
    org && `ORG:${esc(org)}`,
    "END:VCARD",
  ].filter(Boolean);

  QRCode.toCanvas(canvas, lines.join("\r\n"), { width: 256, margin: 1, errorCorrectionLevel: "M" }, (error) => {
    if (!error) downloadBtn.style.display = "";
  });
}

[nameInput, phoneInput, emailInput, orgInput].forEach((el) => el.addEventListener("input", generate));

downloadBtn.addEventListener("click", () => {
  const link = document.createElement("a");
  link.href = canvas.toDataURL("image/png");
  link.download = `contact-${nameInput.value.trim().replace(/\s+/g, "-") || "qr"}.png`;
  link.click();
});
