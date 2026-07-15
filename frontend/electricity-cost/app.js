const wattsInput = document.getElementById("watts-input");
const hoursInput = document.getElementById("hours-input");
const priceInput = document.getElementById("price-input");
const results = document.getElementById("results");

const STORAGE_KEY = "electricity-cost-price";
priceInput.value = localStorage.getItem(STORAGE_KEY) || "";

const fmt = (x) => (x >= 100 ? Math.round(x).toLocaleString() : x >= 1 ? x.toFixed(2) : x.toPrecision(2));

function update() {
  const watts = Number(wattsInput.value);
  const hours = Number(hoursInput.value);
  const price = Number(priceInput.value);
  if (priceInput.value) localStorage.setItem(STORAGE_KEY, priceInput.value);

  if (!(watts > 0 && hours > 0 && price >= 0)) {
    results.style.display = "none";
    return;
  }

  const kwhDay = (watts * hours) / 1000;
  const rows = [
    ["day", kwhDay],
    ["month", kwhDay * 30.44],
    ["year", kwhDay * 365.25],
  ];
  for (const [period, kwh] of rows) {
    document.getElementById(`kwh-${period}`).textContent = fmt(kwh) + " kWh";
    document.getElementById(`cost-${period}`).textContent = fmt(kwh * price);
  }
  results.style.display = "";
}

[wattsInput, hoursInput, priceInput].forEach((el) => el.addEventListener("input", update));
wattsInput.focus();
update();
