const input = document.getElementById("input");
const total = document.getElementById("total");
const info = document.getElementById("info");

// One token: "1,200.50" / "1.200,50" / "7,99" / "$-3" / "(5)" → number; "2kg", "1x" → null.
function parse(token) {
  let s = token.replace(/['_]/g, "");
  const neg = /\(.*\)/.test(s); // accounting negatives: (5)
  s = s.replace(/[()]/g, "").replace(/^\p{Sc}+|\p{Sc}+$/gu, ""); // currency signs only; "2kg", "1x" stay text
  if (neg) s = "-" + s;
  const lastComma = s.lastIndexOf(","), lastDot = s.lastIndexOf(".");
  if (lastComma > -1 && lastDot > -1) {
    s = lastComma > lastDot ? s.replace(/\./g, "").replace(",", ".") : s.replace(/,/g, "");
  } else if (lastComma > -1) {
    s = /^[+-]?\d{1,3}(,\d{3})+$/.test(s) ? s.replace(/,/g, "") : s.replace(",", ".");
  }
  return /^[+-]?(\d+\.?\d*|\.\d+)$/.test(s) ? { n: Number(s), dp: (s.split(".")[1] || "").length } : null;
}

function update() {
  let sum = 0, count = 0, dp = 0;
  for (const token of input.value.split(/\s+/)) {
    const p = token && parse(token);
    if (p) { sum += p.n; count++; dp = Math.max(dp, p.dp); }
  }
  total.textContent = sum.toLocaleString(undefined, { minimumFractionDigits: dp, maximumFractionDigits: Math.min(dp, 20) });
  total.dataset.raw = sum.toFixed(Math.min(dp, 100));
  info.textContent = `${count} number${count === 1 ? "" : "s"}`;
}

document.getElementById("copy").addEventListener("click", (e) => {
  navigator.clipboard.writeText(total.dataset.raw).then(() => {
    e.target.textContent = "Copied";
    setTimeout(() => (e.target.textContent = "Copy"), 1200);
  });
});
input.addEventListener("input", update);
input.focus();
update();
