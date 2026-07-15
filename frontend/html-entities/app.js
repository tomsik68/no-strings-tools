const plainInput = document.getElementById("plain-input");
const encodedInput = document.getElementById("encoded-input");

plainInput.focus();

const NAMED = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };

function encode(s) {
  return [...s]
    .map((ch) => {
      if (NAMED[ch]) return NAMED[ch];
      const cp = ch.codePointAt(0);
      return cp > 127 ? `&#${cp};` : ch;
    })
    .join("");
}

function decode(s) {
  const doc = new DOMParser().parseFromString(s, "text/html");
  return doc.documentElement.textContent;
}

plainInput.addEventListener("input", () => {
  encodedInput.value = encode(plainInput.value);
});

encodedInput.addEventListener("input", () => {
  plainInput.value = decode(encodedInput.value);
});
