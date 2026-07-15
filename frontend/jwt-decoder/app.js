const jwtInput = document.getElementById("jwt-input");
const headerOutput = document.getElementById("header-output");
const payloadOutput = document.getElementById("payload-output");
const signatureOutput = document.getElementById("signature-output");
const errorContainer = document.getElementById("error-container");
const statusContainer = document.getElementById("status-container");

// JWTs use base64url (- and _ instead of + and /, no padding), so plain atob()
// fails on most real tokens. Also decode bytes as UTF-8, not Latin-1.
function base64UrlDecode(str) {
  let s = str.replace(/-/g, "+").replace(/_/g, "/");
  while (s.length % 4) s += "=";
  const bytes = Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

function decodeJWT(token) {
  errorContainer.textContent = "";
  statusContainer.textContent = "";

  if (!token.trim()) {
    headerOutput.textContent = "--";
    payloadOutput.textContent = "--";
    signatureOutput.textContent = "--";
    return;
  }

  const parts = token.trim().split(".");

  if (parts.length !== 3) {
    const error = document.createElement("div");
    error.className = "error";
    error.textContent = "Invalid JWT format. Must have 3 parts separated by dots.";
    errorContainer.appendChild(error);
    headerOutput.textContent = "--";
    payloadOutput.textContent = "--";
    signatureOutput.textContent = "--";
    return;
  }

  try {
    // Decode header
    const headerJson = JSON.parse(base64UrlDecode(parts[0]));
    headerOutput.textContent = JSON.stringify(headerJson, null, 2);

    // Decode payload
    const payloadJson = JSON.parse(base64UrlDecode(parts[1]));
    payloadOutput.textContent = JSON.stringify(payloadJson, null, 2);

    // Signature (can't decode, just show)
    signatureOutput.textContent = parts[2];

    // Check expiry if present
    if (payloadJson.exp) {
      const expDate = new Date(payloadJson.exp * 1000);
      const now = new Date();
      const isExpired = now > expDate;

      const status = document.createElement("div");
      status.className = `status ${isExpired ? "invalid" : "valid"}`;
      status.innerHTML = isExpired
        ? `⚠️ Token expired on ${expDate.toLocaleString()}`
        : `✓ Token valid until ${expDate.toLocaleString()}`;
      statusContainer.appendChild(status);
    }
  } catch (error) {
    const err = document.createElement("div");
    err.className = "error";
    err.textContent = "Decode error: " + error.message;
    errorContainer.appendChild(err);
  }
}

jwtInput.addEventListener("input", (e) => {
  decodeJWT(e.target.value);
});

// Auto-focus
jwtInput.focus();
