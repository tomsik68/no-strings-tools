const input = document.getElementById("input");
const baseSelect = document.getElementById("base-select");
const bases = document.getElementById("bases");

function convertBases() {
  const value = input.value.trim();
  const fromBase = parseInt(baseSelect.value);

  if (!value) {
    bases.innerHTML = "";
    return;
  }

  let decimal = null;

  try {
    decimal = parseInt(value, fromBase);
  } catch (e) {
    bases.innerHTML = '<div class="error" style="grid-column: 1/-1;">❌ Invalid number for selected base</div>';
    return;
  }

  if (isNaN(decimal)) {
    bases.innerHTML = '<div class="error" style="grid-column: 1/-1;">❌ Invalid number for selected base</div>';
    return;
  }

  if (decimal < 0) {
    bases.innerHTML = '<div class="error" style="grid-column: 1/-1;">❌ Only positive integers supported</div>';
    return;
  }

  const conversions = [
    { name: "Decimal", base: 10, value: decimal.toString(10) },
    { name: "Binary", base: 2, value: decimal.toString(2) },
    { name: "Octal", base: 8, value: decimal.toString(8) },
    { name: "Hexadecimal", base: 16, value: decimal.toString(16).toUpperCase() }
  ];

  bases.innerHTML = conversions.map(conv => `
    <div class="base-box">
      <div class="base-label">${conv.name} (Base ${conv.base})</div>
      <div class="base-value">${conv.value}</div>
    </div>
  `).join("");
}

input.addEventListener("input", convertBases);
baseSelect.addEventListener("change", convertBases);
convertBases();
