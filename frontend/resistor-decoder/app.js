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
  Gold: "#FFD700",
  Silver: "#C0C0C0",
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
  Gold: 0.1,
  Silver: 0.01,
};

const tolerance = {
  Brown: "±1%",
  Red: "±2%",
  Orange: "±3%",
  Yellow: "±4%",
  Green: "±0.5%",
  Blue: "±0.25%",
  Violet: "±0.1%",
  Grey: "±0.05%",
  Gold: "±5%",
  Silver: "±10%",
};

const modeButtons = document.querySelectorAll(".mode-btn");
const resistorDisplay = document.getElementById("resistor-display");
const colorGrid = document.getElementById("color-grid");
const resultValue = document.getElementById("result-value");
const resultTolerance = document.getElementById("result-tolerance");

let mode = "4-band";
let bands = { "4-band": ["Brown", "Black", "Red", "Gold"], "5-band": ["Brown", "Black", "Black", "Red", "Gold"] };
let selectedBand = 0;

modeButtons.forEach((btn) => {
  btn.addEventListener("click", (e) => {
    modeButtons.forEach((b) => b.classList.remove("active"));
    e.target.classList.add("active");
    mode = e.target.getAttribute("data-mode");
    selectedBand = 0;
    render();
  });
});

function getTextColor(hex) {
  const rgb = parseInt(hex.slice(1), 16);
  const r = (rgb >> 16) & 0xff;
  const g = (rgb >> 8) & 0xff;
  const b = (rgb >> 0) & 0xff;
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? "dark-text" : "light-text";
}

function renderResistor() {
  const bandArray = bands[mode];
  resistorDisplay.innerHTML = bandArray
    .map((color, index) => {
      const labels = mode === "4-band" ? ["1st Digit", "2nd Digit", "Multiplier", "Tolerance"] : ["1st Digit", "2nd Digit", "3rd Digit", "Multiplier", "Tolerance"];
      return `
        <div style="position: relative;">
          <div class="band-label">${labels[index]}</div>
          <div
            class="band"
            data-index="${index}"
            style="background-color: ${colors[color]};"
          ></div>
          <div class="color-name">${color}</div>
        </div>
      `;
    })
    .join("");

  resistorDisplay.querySelectorAll(".band").forEach((band) => {
    band.addEventListener("click", (e) => {
      selectedBand = parseInt(e.currentTarget.getAttribute("data-index"));
      renderColorGrid();
    });
  });
}

function renderColorGrid() {
  const bandArray = bands[mode];
  const isBand4or5 = mode === "4-band" ? 2 : 3;
  const isToleranceBand = selectedBand === bandArray.length - 1;

  let availableColors = Object.keys(colors);

  if (!isToleranceBand && selectedBand < isBand4or5) {
    availableColors = Object.keys(colorValues);
  } else if (selectedBand === isBand4or5) {
    availableColors = Object.keys(multipliers);
  } else if (isToleranceBand) {
    availableColors = Object.keys(tolerance);
  }

  colorGrid.innerHTML = availableColors
    .map((color) => {
      return `
        <div
          class="color-option ${getTextColor(colors[color])}"
          style="background-color: ${colors[color]};"
          data-color="${color}"
        >
          ${color}
        </div>
      `;
    })
    .join("");

  colorGrid.querySelectorAll(".color-option").forEach((option) => {
    option.addEventListener("click", (e) => {
      const color = e.target.getAttribute("data-color");
      bands[mode][selectedBand] = color;
      render();
    });
  });
}

function calculateResistance() {
  const bandArray = bands[mode];

  if (mode === "4-band") {
    const digit1 = colorValues[bandArray[0]];
    const digit2 = colorValues[bandArray[1]];
    const multiplier = multipliers[bandArray[2]];
    const tol = tolerance[bandArray[3]];

    const value = (digit1 * 10 + digit2) * multiplier;
    return { value, tolerance: tol };
  } else {
    const digit1 = colorValues[bandArray[0]];
    const digit2 = colorValues[bandArray[1]];
    const digit3 = colorValues[bandArray[2]];
    const multiplier = multipliers[bandArray[3]];
    const tol = tolerance[bandArray[4]];

    const value = (digit1 * 100 + digit2 * 10 + digit3) * multiplier;
    return { value, tolerance: tol };
  }
}

function formatResistance(ohms) {
  if (ohms >= 1000000) {
    return (ohms / 1000000).toFixed(2).replace(/\.?0+$/, "") + " MΩ";
  } else if (ohms >= 1000) {
    return (ohms / 1000).toFixed(2).replace(/\.?0+$/, "") + " kΩ";
  } else {
    return ohms.toFixed(2).replace(/\.?0+$/, "") + " Ω";
  }
}

function render() {
  renderResistor();
  renderColorGrid();

  const result = calculateResistance();
  resultValue.textContent = formatResistance(result.value);
  resultTolerance.textContent = result.tolerance;
}

render();
