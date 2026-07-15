const input = document.getElementById("input");
const resultsEl = document.getElementById("results");

function words(text) {
  return text
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2")
    .split(/[^A-Za-z0-9]+/)
    .filter(Boolean)
    .map((w) => w.toLowerCase());
}

const cap = (w) => w.charAt(0).toUpperCase() + w.slice(1);

const styles = {
  camelCase: (w) => w.map((word, i) => (i === 0 ? word : cap(word))).join(""),
  PascalCase: (w) => w.map(cap).join(""),
  snake_case: (w) => w.join("_"),
  "kebab-case": (w) => w.join("-"),
  CONSTANT_CASE: (w) => w.join("_").toUpperCase(),
  "Title Case": (w) => w.map(cap).join(" "),
  lowercase: (w) => w.join(" "),
  UPPERCASE: (w) => w.join(" ").toUpperCase(),
};

const outputs = {};
for (const name of Object.keys(styles)) {
  const box = document.createElement("div");
  box.className = "case-box";
  const label = document.createElement("div");
  label.className = "case-label";
  label.textContent = name;
  const value = document.createElement("div");
  value.className = "case-value";
  box.append(label, value);
  resultsEl.appendChild(box);
  outputs[name] = value;
}

function convert() {
  const w = words(input.value);
  for (const [name, fn] of Object.entries(styles)) {
    outputs[name].textContent = w.length ? fn(w) : "—";
  }
}

input.addEventListener("input", convert);
input.focus();
convert();
