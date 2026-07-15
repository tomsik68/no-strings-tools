const colors = {
  Black: "#000000",
  Brown: "#8B4513",
  Red: "#FF0000",
  Orange: "#FFA500",
  Yellow: "#FFFF00",
  Green: "#008000",
  Blue: "#0000FF",
  Violet: "#EE82EE",
  Grey: "#808080",
  White: "#FFFFFF",
};

const colorValues = {
  Black: 0,
  Brown: 1,
  Red: 2,
  Orange: 3,
  Yellow: 4,
  Green: 5,
  Blue: 6,
  Violet: 7,
  Grey: 8,
  White: 9,
};

const multipliers = {
  Black: 1,
  Brown: 10,
  Red: 100,
  Orange: 1000,
  Yellow: 10000,
  Green: 100000,
  Blue: 1000000,
  Violet: 10000000,
  Grey: 100000000,
  White: 1000000000,
};

const tolerance = {
  Brown: "±1%",
  Red: "±2%",
  Orange: "±3%",
  Yellow: "±5%",
  Green: "±0.5%",
  Blue: "±0.25%",
  Violet: "±0.1%",
  Grey: "±0.05%",
  White: "±10%",
};

const colorGrid = document.getElementById("color-grid");
const result = document.getElementById("result");

let bands = { band1: "Brown", band2: "Black", band3: "Brown", band4: "Brown" };
let selectedBand = "band1";

function getTextColor(hex) {
  const rgb = parseInt(hex.slice(1), 16);
  const r = (rgb >> 16) & 0xff;
  const g = (rgb >> 8) & 0xff;
  const b = rgb & 0xff;
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? "dark-text" : "light-text";
}

function renderBands() {
  for (let i = 1; i <= 4; i++) {
    const bandId = `band-${i}`;
    const color = bands[`band${i}`];
    const element = document.getElementById(bandId);
    element.style.backgroundColor = colors[color];
    element.style.borderColor = selectedBand === `band${i}` ? "#333" : "#ddd";
    element.style.borderWidth = selectedBand === `band${i}` ? "3px" : "2px";
  }
}

function renderColorGrid() {
  colorGrid.innerHTML = "";

  let availableColors = [];
  if (selectedBand === "band1" || selectedBand === "band2") {
    availableColors = Object.keys(colorValues);
  } else if (selectedBand === "band3") {
    availableColors = Object.keys(multipliers);
  } else if (selectedBand === "band4") {
    availableColors = Object.keys(tolerance);
  }

  availableColors.forEach((colorName) => {
    const option = document.createElement("div");
    option.className = `color-option ${getTextColor(colors[colorName])}`;
    option.style.backgroundColor = colors[colorName];
    option.textContent = colorName;
    option.addEventListener("click", () => {
      bands[selectedBand] = colorName;
      renderBands();
      updateResult();
    });
    colorGrid.appendChild(option);
  });
}

function updateResult() {
  const digit1 = colorValues[bands.band1];
  const digit2 = colorValues[bands.band2];
  const mult = multipliers[bands.band3];
  const tol = tolerance[bands.band4];

  const value = (digit1 * 10 + digit2) * mult;

  let unit = "pF";
  let displayValue = value;
  if (value >= 1000000) {
    displayValue = (value / 1000000).toFixed(2);
    unit = "µF";
  } else if (value >= 1000) {
    displayValue = (value / 1000).toFixed(2);
    unit = "nF";
  }

  result.innerHTML = `
    <div class="result-row">
      <span class="result-label">Value</span>
      <span class="result-value">${displayValue} ${unit}</span>
    </div>
    <div class="result-row">
      <span class="result-label">Scientific</span>
      <span class="result-value">${value} pF</span>
    </div>
    <div class="result-row">
      <span class="result-label">Tolerance</span>
      <span class="result-value">${tol}</span>
    </div>
  `;
}

// Click handlers for bands
for (let i = 1; i <= 4; i++) {
  document.getElementById(`band-${i}`).addEventListener("click", () => {
    selectedBand = `band${i}`;
    renderBands();
    renderColorGrid();
  });
}

renderBands();
renderColorGrid();
updateResult();
