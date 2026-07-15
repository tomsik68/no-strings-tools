const input = document.getElementById("value-input");
const result = document.getElementById("result");
const errorEl = document.getElementById("error");

input.focus();

const VALUES = [
  [1000, "M"], [900, "CM"], [500, "D"], [400, "CD"], [100, "C"], [90, "XC"],
  [50, "L"], [40, "XL"], [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"],
];

function toRoman(n) {
  let out = "";
  for (const [value, symbol] of VALUES) {
    while (n >= value) {
      out += symbol;
      n -= value;
    }
  }
  return out;
}

function fromRoman(s) {
  let rest = s;
  let total = 0;
  for (const [value, symbol] of VALUES) {
    while (rest.startsWith(symbol)) {
      total += value;
      rest = rest.slice(symbol.length);
    }
  }
  // Round-trip check rejects malformed numerals like "IIII" or "VX"
  return rest === "" && toRoman(total) === s ? total : null;
}

function update() {
  const raw = input.value.trim().toUpperCase();
  result.textContent = "";
  errorEl.style.display = "none";
  if (!raw) return;

  if (/^\d+$/.test(raw)) {
    const n = Number(raw);
    if (n < 1 || n > 3999) {
      errorEl.textContent = "Roman numerals cover 1 to 3999.";
      errorEl.style.display = "";
      return;
    }
    result.textContent = toRoman(n);
  } else if (/^[MDCLXVI]+$/.test(raw)) {
    const n = fromRoman(raw);
    if (n === null) {
      errorEl.textContent = "That's not a well-formed Roman numeral.";
      errorEl.style.display = "";
      return;
    }
    result.textContent = n;
  } else {
    errorEl.textContent = "Use digits (2026) or the letters M D C L X V I.";
    errorEl.style.display = "";
  }
}

input.addEventListener("input", update);
