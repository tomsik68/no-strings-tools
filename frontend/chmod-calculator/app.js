const octalInput = document.getElementById("octal");
const symbolicEl = document.getElementById("symbolic");
const commandEl = document.getElementById("command");
const checkboxes = [...document.querySelectorAll("input[type=checkbox]")];

// Permission bits: bit 8 = owner read ... bit 0 = others execute
function bitsToValue() {
  let value = 0;
  for (const cb of checkboxes) {
    if (cb.checked) value |= 1 << Number(cb.dataset.bit);
  }
  return value;
}

function render(value) {
  for (const cb of checkboxes) {
    cb.checked = Boolean(value & (1 << Number(cb.dataset.bit)));
  }

  const octal = [(value >> 6) & 7, (value >> 3) & 7, value & 7].join("");
  if (document.activeElement !== octalInput) octalInput.value = octal;

  const flags = "rwx";
  let symbolic = "";
  for (let bit = 8; bit >= 0; bit--) {
    symbolic += value & (1 << bit) ? flags[(8 - bit) % 3] : "-";
  }
  symbolicEl.textContent = symbolic;
  commandEl.textContent = `chmod ${octal} file`;
}

checkboxes.forEach((cb) => cb.addEventListener("change", () => render(bitsToValue())));

octalInput.addEventListener("input", () => {
  const digits = octalInput.value.trim();
  if (!/^[0-7]{1,3}$/.test(digits)) return;
  const padded = digits.padStart(3, "0");
  const value = (Number(padded[0]) << 6) | (Number(padded[1]) << 3) | Number(padded[2]);
  render(value);
});

octalInput.focus();
octalInput.select();
render(0o755);
