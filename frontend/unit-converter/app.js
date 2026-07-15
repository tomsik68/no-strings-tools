const valueInput = document.getElementById("value-input");
const unitSelect = document.getElementById("unit-select");
const resultsEl = document.getElementById("results");

// Linear unit: k = factor to the category's base unit
const lin = (cat, k) => ({ cat, to: (v) => v * k, from: (v) => v / k });

const units = {
  Celsius: { cat: "Temperature", to: (v) => v, from: (v) => v },
  Fahrenheit: { cat: "Temperature", to: (v) => ((v - 32) * 5) / 9, from: (v) => (v * 9) / 5 + 32 },
  Kelvin: { cat: "Temperature", to: (v) => v - 273.15, from: (v) => v + 273.15 },
  Millimeter: lin("Distance", 1),
  Centimeter: lin("Distance", 10),
  Meter: lin("Distance", 1000),
  Kilometer: lin("Distance", 1e6),
  Inch: lin("Distance", 25.4),
  Foot: lin("Distance", 304.8),
  Yard: lin("Distance", 914.4),
  Mile: lin("Distance", 1609344),
  Milligram: lin("Weight", 1),
  Gram: lin("Weight", 1000),
  Kilogram: lin("Weight", 1e6),
  Ounce: lin("Weight", 28349.5),
  Pound: lin("Weight", 453592),
  Milliliter: lin("Volume", 1),
  Liter: lin("Volume", 1000),
  Cup: lin("Volume", 236.588),
  Pint: lin("Volume", 473.176),
  Gallon: lin("Volume", 3785.41),
};

// One dropdown, grouped by category so the source unit is easy to find
const categories = [...new Set(Object.values(units).map((u) => u.cat))];
for (const cat of categories) {
  const group = document.createElement("optgroup");
  group.label = cat;
  for (const [name, unit] of Object.entries(units)) {
    if (unit.cat !== cat) continue;
    const opt = document.createElement("option");
    opt.value = name;
    opt.textContent = name;
    group.appendChild(opt);
  }
  unitSelect.appendChild(group);
}
unitSelect.value = "Meter";

function fmt(n) {
  if (!isFinite(n)) return "—";
  if (n !== 0 && (Math.abs(n) >= 1e15 || Math.abs(n) < 1e-6)) return n.toExponential(4);
  return n.toFixed(6).replace(/\.?0+$/, "");
}

function convert() {
  const fromName = unitSelect.value;
  const from = units[fromName];
  const value = parseFloat(valueInput.value);
  const base = from.to(isNaN(value) ? 0 : value);

  resultsEl.innerHTML = "";
  for (const [name, unit] of Object.entries(units)) {
    if (unit.cat !== from.cat || name === fromName) continue;
    const box = document.createElement("div");
    box.className = "unit-box";
    const label = document.createElement("div");
    label.className = "unit-label";
    label.textContent = name;
    const val = document.createElement("div");
    val.className = "unit-value";
    val.textContent = fmt(unit.from(base));
    box.append(label, val);
    resultsEl.appendChild(box);
  }
}

valueInput.addEventListener("input", convert);
unitSelect.addEventListener("change", convert);

valueInput.focus();
valueInput.select();
convert();
