const baseUnits = [
  { name: "Length", symbol: "m", description: "meter" },
  { name: "Mass", symbol: "kg", description: "kilogram" },
  { name: "Time", symbol: "s", description: "second" },
  { name: "Electric Current", symbol: "A", description: "ampere" },
  { name: "Temperature", symbol: "K", description: "kelvin" },
  { name: "Amount of Substance", symbol: "mol", description: "mole" },
  { name: "Luminous Intensity", symbol: "cd", description: "candela" }
];

const prefixes = [
  { name: "yotta", symbol: "Y", factor: "10²⁴" },
  { name: "zetta", symbol: "Z", factor: "10²¹" },
  { name: "exa", symbol: "E", factor: "10¹⁸" },
  { name: "peta", symbol: "P", factor: "10¹⁵" },
  { name: "tera", symbol: "T", factor: "10¹²" },
  { name: "giga", symbol: "G", factor: "10⁹" },
  { name: "mega", symbol: "M", factor: "10⁶" },
  { name: "kilo", symbol: "k", factor: "10³" },
  { name: "hecto", symbol: "h", factor: "10²" },
  { name: "deca", symbol: "da", factor: "10¹" },
  { name: "deci", symbol: "d", factor: "10⁻¹" },
  { name: "centi", symbol: "c", factor: "10⁻²" },
  { name: "milli", symbol: "m", factor: "10⁻³" },
  { name: "micro", symbol: "μ", factor: "10⁻⁶" },
  { name: "nano", symbol: "n", factor: "10⁻⁹" },
  { name: "pico", symbol: "p", factor: "10⁻¹²" },
  { name: "femto", symbol: "f", factor: "10⁻¹⁵" },
  { name: "atto", symbol: "a", factor: "10⁻¹⁸" },
  { name: "zepto", symbol: "z", factor: "10⁻²¹" },
  { name: "yocto", symbol: "y", factor: "10⁻²⁴" }
];

const baseTable = document.getElementById("base-table");
baseTable.innerHTML = baseUnits.map(u => `
  <tr>
    <td>${u.name}</td>
    <td>${u.symbol}</td>
    <td>${u.description}</td>
  </tr>
`).join("");

const prefixesTable = document.getElementById("prefixes-table");
prefixesTable.innerHTML = prefixes.map(p => `
  <tr>
    <td>${p.name}</td>
    <td>${p.symbol}</td>
    <td>${p.factor}</td>
  </tr>
`).join("");

document.querySelectorAll(".tab").forEach(tab => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
    document.querySelectorAll(".tab-content").forEach(c => c.classList.remove("active"));
    tab.classList.add("active");
    document.getElementById(tab.getAttribute("data-tab")).classList.add("active");
  });
});
