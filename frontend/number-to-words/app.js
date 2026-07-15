const input = document.getElementById("number-input");
const wordsEl = document.getElementById("words");
const copyBtn = document.getElementById("copy-btn");
const copyFeedback = document.getElementById("copy-feedback");

input.focus();

const ONES = ["", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten",
  "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen"];
const TENS = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];
const SCALES = ["", " thousand", " million", " billion", " trillion"];

function threeDigits(n) {
  const parts = [];
  if (n >= 100) {
    parts.push(ONES[Math.floor(n / 100)] + " hundred");
    n %= 100;
  }
  if (n >= 20) {
    parts.push(TENS[Math.floor(n / 10)] + (n % 10 ? "-" + ONES[n % 10] : ""));
  } else if (n > 0) {
    parts.push(ONES[n]);
  }
  return parts.join(" ");
}

function integerToWords(digits) {
  if (digits === "0") return "zero";
  const groups = [];
  for (let i = digits.length; i > 0; i -= 3) groups.unshift(Number(digits.slice(Math.max(0, i - 3), i)));
  if (groups.length > SCALES.length) return null;
  const parts = [];
  groups.forEach((g, i) => {
    if (g) parts.push(threeDigits(g) + SCALES[groups.length - 1 - i]);
  });
  return parts.join(" ");
}

function toWords(raw) {
  raw = raw.trim().replace(/[\s,]/g, "");
  if (!raw) return "";
  const m = raw.match(/^(-)?(\d+)(?:\.(\d+))?$/);
  if (!m) return "Enter a plain number, like 1234.56";
  const [, minus, intPart, decPart] = m;
  const intWords = integerToWords(intPart.replace(/^0+(?=\d)/, ""));
  if (intWords === null) return "That's too big — up to 999 trillion is supported.";
  let result = (minus ? "minus " : "") + intWords;
  if (decPart) result += " point " + [...decPart].map((d) => ONES[d] || "zero").join(" ");
  return result;
}

function update() {
  const words = toWords(input.value);
  wordsEl.textContent = words;
  copyBtn.style.display = words && !words.startsWith("Enter") && !words.startsWith("That's") ? "" : "none";
  copyFeedback.textContent = "";
}

copyBtn.addEventListener("click", async () => {
  await navigator.clipboard.writeText(wordsEl.textContent);
  copyFeedback.textContent = " Copied ✓";
});

input.addEventListener("input", update);
