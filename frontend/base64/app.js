const encodeInput = document.getElementById("encode-input");
const encodeOutput = document.getElementById("encode-output");
const decodeInput = document.getElementById("decode-input");
const decodeOutput = document.getElementById("decode-output");
const copyEncodedBtn = document.getElementById("copy-encoded");
const copyDecodedBtn = document.getElementById("copy-decoded");

function encode() {
  const text = encodeInput.value;
  if (!text) {
    encodeOutput.textContent = "--";
    return;
  }
  try {
    // UTF-8 encode first: btoa() alone throws on any non-Latin1 character
    const bytes = new TextEncoder().encode(text);
    let binary = "";
    bytes.forEach((b) => (binary += String.fromCharCode(b)));
    encodeOutput.textContent = btoa(binary);
  } catch (error) {
    encodeOutput.textContent = "Error: " + error.message;
  }
}

function decode() {
  const text = decodeInput.value;
  if (!text) {
    decodeOutput.textContent = "--";
    return;
  }
  try {
    const binary = atob(text.trim());
    const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
    decodeOutput.textContent = new TextDecoder().decode(bytes);
  } catch (error) {
    decodeOutput.textContent = "Error: Invalid base64";
  }
}

encodeInput.addEventListener("input", encode);
decodeInput.addEventListener("input", decode);

copyEncodedBtn.addEventListener("click", () => {
  const text = encodeOutput.textContent;
  if (text && text !== "--") {
    navigator.clipboard.writeText(text);
    copyEncodedBtn.textContent = "✓ Copied!";
    setTimeout(() => {
      copyEncodedBtn.textContent = "📋 Copy";
    }, 2000);
  }
});

copyDecodedBtn.addEventListener("click", () => {
  const text = decodeOutput.textContent;
  if (text && text !== "--") {
    navigator.clipboard.writeText(text);
    copyDecodedBtn.textContent = "✓ Copied!";
    setTimeout(() => {
      copyDecodedBtn.textContent = "📋 Copy";
    }, 2000);
  }
});

// Tab switching
document.querySelectorAll(".tab").forEach(tab => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
    document.querySelectorAll(".tab-content").forEach(c => c.classList.remove("active"));
    tab.classList.add("active");
    document.getElementById(tab.getAttribute("data-tab")).classList.add("active");
  });
});

// Auto-focus
encodeInput.focus();
