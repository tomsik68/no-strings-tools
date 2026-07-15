const fgColor = document.getElementById("fg-color");
const fgHex = document.getElementById("fg-hex");
const bgColor = document.getElementById("bg-color");
const bgHex = document.getElementById("bg-hex");
const swapBtn = document.getElementById("swap-btn");
const ratioEl = document.getElementById("ratio");
const preview = document.getElementById("preview");

fgHex.focus();

function normalizeHex(s) {
  s = s.trim().replace(/^#/, "");
  if (/^[0-9a-f]{3}$/i.test(s)) s = s.replace(/./g, "$&$&");
  return /^[0-9a-f]{6}$/i.test(s) ? "#" + s.toLowerCase() : null;
}

// WCAG relative luminance
function luminance(hex) {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrastRatio(fg, bg) {
  const l1 = luminance(fg);
  const l2 = luminance(bg);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

function setVerdict(id, pass) {
  const el = document.getElementById(id);
  el.className = "verdict " + (pass ? "pass" : "fail");
  el.textContent = el.textContent.replace(/ [✓✗]$/, "") + (pass ? " ✓" : " ✗");
}

function update() {
  const fg = normalizeHex(fgHex.value);
  const bg = normalizeHex(bgHex.value);
  if (!fg || !bg) {
    ratioEl.textContent = "—";
    return;
  }
  fgColor.value = fg;
  bgColor.value = bg;

  const ratio = contrastRatio(fg, bg);
  ratioEl.textContent = ratio.toFixed(2) + ":1";

  setVerdict("aa-normal", ratio >= 4.5);
  setVerdict("aa-large", ratio >= 3);
  setVerdict("aaa-normal", ratio >= 7);
  setVerdict("aaa-large", ratio >= 4.5);

  preview.style.color = fg;
  preview.style.background = bg;
}

fgColor.addEventListener("input", () => { fgHex.value = fgColor.value; update(); });
bgColor.addEventListener("input", () => { bgHex.value = bgColor.value; update(); });
fgHex.addEventListener("input", update);
bgHex.addEventListener("input", update);

swapBtn.addEventListener("click", () => {
  [fgHex.value, bgHex.value] = [bgHex.value, fgHex.value];
  update();
});

update();
