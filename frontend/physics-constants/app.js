const constants = [
  { name: "Speed of Light", symbol: "c", value: "3.00 × 10⁸ m/s" },
  { name: "Gravitational Constant", symbol: "G", value: "6.67 × 10⁻¹¹ N⋅m²/kg²" },
  { name: "Planck Constant", symbol: "h", value: "6.63 × 10⁻³⁴ J⋅s" },
  { name: "Electron Charge", symbol: "e", value: "1.60 × 10⁻¹⁹ C" },
  { name: "Avogadro's Number", symbol: "Nₐ", value: "6.02 × 10²³ mol⁻¹" },
  { name: "Boltzmann Constant", symbol: "k", value: "1.38 × 10⁻²³ J/K" },
  { name: "Gas Constant", symbol: "R", value: "8.31 J/(mol⋅K)" },
  { name: "Gravitational Acceleration", symbol: "g", value: "9.81 m/s²" },
  { name: "Permittivity of Free Space", symbol: "ε₀", value: "8.85 × 10⁻¹² F/m" },
  { name: "Permeability of Free Space", symbol: "μ₀", value: "1.26 × 10⁻⁶ H/m" }
];

const list = document.getElementById("constants-list");
list.innerHTML = constants.map(c => `
  <li class="constant-item">
    <div class="constant-name">${c.name}</div>
    <div class="constant-symbol">${c.symbol}</div>
    <div class="constant-value">${c.value}</div>
  </li>
`).join("");
