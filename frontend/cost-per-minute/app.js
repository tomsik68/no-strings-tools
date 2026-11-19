// Minutes of working time in each period (8 h day, 40 h week, 2080 h year).
const MINUTES = {
  second: 1 / 60,
  minute: 1,
  hour: 60,
  day: 8 * 60,
  week: 40 * 60,
  month: (2080 * 60) / 12,
  year: 2080 * 60,
};

const amountEl = document.getElementById("amount");
const perEl = document.getElementById("per");
const outEl = document.getElementById("out");
const errEl = document.getElementById("err");

function fmt(n) {
  const digits = n < 1 ? 4 : n < 100 ? 2 : 0;
  return n.toLocaleString(undefined, { minimumFractionDigits: digits, maximumFractionDigits: digits });
}

function render() {
  const amount = parseFloat(amountEl.value);
  const valid = Number.isFinite(amount) && amount >= 0;
  errEl.hidden = valid || amountEl.value === "";
  if (!valid) { outEl.innerHTML = ""; return; }

  const perMinute = amount / MINUTES[perEl.value];
  outEl.innerHTML = Object.entries(MINUTES).map(([unit, mins]) =>
    `<tr${unit === perEl.value ? ' class="hl"' : ""}><td>per ${unit}</td><td>${fmt(perMinute * mins)}</td></tr>`
  ).join("");
}

amountEl.addEventListener("input", render);
perEl.addEventListener("change", render);
render();
