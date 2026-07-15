const elements = [
  { number: 1, symbol: "H", name: "Hydrogen", mass: 1.008, type: "nonmetal" },
  { number: 2, symbol: "He", name: "Helium", mass: 4.003, type: "noble" },
  { number: 3, symbol: "Li", name: "Lithium", mass: 6.941, type: "alkali" },
  { number: 4, symbol: "Be", name: "Beryllium", mass: 9.012, type: "alkaline" },
  { number: 5, symbol: "B", name: "Boron", mass: 10.811, type: "nonmetal" },
  { number: 6, symbol: "C", name: "Carbon", mass: 12.011, type: "nonmetal" },
  { number: 7, symbol: "N", name: "Nitrogen", mass: 14.007, type: "nonmetal" },
  { number: 8, symbol: "O", name: "Oxygen", mass: 15.999, type: "nonmetal" },
  { number: 9, symbol: "F", name: "Fluorine", mass: 18.998, type: "halogen" },
  { number: 10, symbol: "Ne", name: "Neon", mass: 20.180, type: "noble" },
  { number: 11, symbol: "Na", name: "Sodium", mass: 22.990, type: "alkali" },
  { number: 12, symbol: "Mg", name: "Magnesium", mass: 24.305, type: "alkaline" },
  { number: 13, symbol: "Al", name: "Aluminum", mass: 26.982, type: "metal" },
  { number: 14, symbol: "Si", name: "Silicon", mass: 28.086, type: "nonmetal" },
  { number: 15, symbol: "P", name: "Phosphorus", mass: 30.974, type: "nonmetal" },
  { number: 16, symbol: "S", name: "Sulfur", mass: 32.065, type: "nonmetal" },
  { number: 17, symbol: "Cl", name: "Chlorine", mass: 35.453, type: "halogen" },
  { number: 18, symbol: "Ar", name: "Argon", mass: 39.948, type: "noble" },
  { number: 19, symbol: "K", name: "Potassium", mass: 39.098, type: "alkali" },
  { number: 20, symbol: "Ca", name: "Calcium", mass: 40.078, type: "alkaline" },
  { number: 26, symbol: "Fe", name: "Iron", mass: 55.845, type: "metal" },
  { number: 29, symbol: "Cu", name: "Copper", mass: 63.546, type: "metal" },
  { number: 30, symbol: "Zn", name: "Zinc", mass: 65.380, type: "metal" },
  { number: 47, symbol: "Ag", name: "Silver", mass: 107.868, type: "metal" },
  { number: 79, symbol: "Au", name: "Gold", mass: 196.967, type: "metal" },
  { number: 80, symbol: "Hg", name: "Mercury", mass: 200.592, type: "metal" },
  { number: 82, symbol: "Pb", name: "Lead", mass: 207.200, type: "metal" },
  { number: 92, symbol: "U", name: "Uranium", mass: 238.029, type: "metal" }
];

const searchInput = document.getElementById("search-input");
const elementGrid = document.getElementById("element-grid");
const detailBox = document.getElementById("detail-box");

function renderElements(filter = "") {
  const filtered = elements.filter(el =>
    el.name.toLowerCase().includes(filter.toLowerCase()) ||
    el.symbol.toLowerCase().includes(filter.toLowerCase()) ||
    el.number.toString().includes(filter)
  );

  elementGrid.innerHTML = filtered
    .map(el => `
      <div class="element ${el.type}" data-symbol="${el.symbol}">
        <div style="font-size: 10px; color: #666;">${el.number}</div>
        <div>${el.symbol}</div>
      </div>
    `)
    .join("");

  elementGrid.querySelectorAll(".element").forEach(el => {
    el.addEventListener("click", () => {
      const symbol = el.getAttribute("data-symbol");
      showDetail(elements.find(e => e.symbol === symbol));
    });
  });
}

function showDetail(element) {
  detailBox.innerHTML = `
    <div class="detail-row">
      <span class="detail-label">Atomic Number</span>
      <span class="detail-value">${element.number}</span>
    </div>
    <div class="detail-row">
      <span class="detail-label">Symbol</span>
      <span class="detail-value">${element.symbol}</span>
    </div>
    <div class="detail-row">
      <span class="detail-label">Name</span>
      <span class="detail-value">${element.name}</span>
    </div>
    <div class="detail-row">
      <span class="detail-label">Atomic Mass</span>
      <span class="detail-value">${element.mass.toFixed(3)}</span>
    </div>
    <div class="detail-row">
      <span class="detail-label">Type</span>
      <span class="detail-value">${element.type.charAt(0).toUpperCase() + element.type.slice(1)}</span>
    </div>
  `;
}

searchInput.addEventListener("input", e => {
  renderElements(e.target.value);
});

renderElements();
