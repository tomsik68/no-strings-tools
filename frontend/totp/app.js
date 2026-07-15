const secretInput = document.getElementById("secret-input");
const codeEl = document.getElementById("code");
const barWrap = document.getElementById("bar-wrap");
const bar = document.getElementById("bar");
const statusEl = document.getElementById("status");

const PERIOD = 30;
const DIGITS = 6;

secretInput.focus();

function base32Decode(s) {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  s = s.toUpperCase().replace(/[\s-]/g, "").replace(/=+$/, "");
  if (!s || [...s].some((c) => !alphabet.includes(c))) return null;
  let bits = 0;
  let value = 0;
  const bytes = [];
  for (const c of s) {
    value = (value << 5) | alphabet.indexOf(c);
    bits += 5;
    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 0xff);
      bits -= 8;
    }
  }
  return new Uint8Array(bytes);
}

async function totp(keyBytes, counter) {
  const key = await crypto.subtle.importKey("raw", keyBytes, { name: "HMAC", hash: "SHA-1" }, false, ["sign"]);
  const msg = new Uint8Array(8);
  new DataView(msg.buffer).setBigUint64(0, BigInt(counter));
  const hmac = new Uint8Array(await crypto.subtle.sign("HMAC", key, msg));
  const offset = hmac[hmac.length - 1] & 0x0f;
  const binary =
    ((hmac[offset] & 0x7f) << 24) | (hmac[offset + 1] << 16) | (hmac[offset + 2] << 8) | hmac[offset + 3];
  return String(binary % 10 ** DIGITS).padStart(DIGITS, "0");
}

let timer = null;
let lastCounter = null;

async function update() {
  const keyBytes = base32Decode(secretInput.value);
  if (!keyBytes || keyBytes.length === 0) {
    codeEl.textContent = "";
    barWrap.style.display = "none";
    statusEl.textContent = secretInput.value.trim() ? "That's not valid Base32." : "";
    lastCounter = null;
    return;
  }

  const now = Math.floor(Date.now() / 1000);
  const counter = Math.floor(now / PERIOD);
  const remaining = PERIOD - (now % PERIOD);

  if (counter !== lastCounter) {
    lastCounter = counter;
    codeEl.textContent = await totp(keyBytes, counter);
  }
  barWrap.style.display = "";
  bar.style.width = (remaining / PERIOD) * 100 + "%";
  statusEl.textContent = `New code in ${remaining} s`;
}

secretInput.addEventListener("input", () => {
  lastCounter = null;
  update();
  clearInterval(timer);
  timer = setInterval(update, 1000);
});

codeEl.addEventListener("click", async () => {
  if (!codeEl.textContent) return;
  await navigator.clipboard.writeText(codeEl.textContent);
  statusEl.textContent = "Copied ✓";
});
