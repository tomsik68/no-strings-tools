const results = document.getElementById("results");
const LABELS = ["A", "B", "C"];

function update() {
  const items = LABELS.map((label, i) => {
    const price = Number(document.getElementById(`price-${i}`).value);
    const amount = Number(document.getElementById(`amount-${i}`).value);
    return price > 0 && amount > 0 ? { label, perUnit: price / amount } : null;
  }).filter(Boolean);

  results.innerHTML = "";
  if (items.length < 2) return;

  const best = Math.min(...items.map((it) => it.perUnit));
  for (const it of items) {
    const row = document.createElement("div");
    row.className = "result-row" + (it.perUnit === best ? " best" : "");
    const name = document.createElement("span");
    const pct = ((it.perUnit / best - 1) * 100).toFixed(0);
    name.textContent = it.perUnit === best ? `${it.label} — best deal 🏆` : `${it.label} — ${pct}% more expensive`;
    const value = document.createElement("span");
    value.textContent = it.perUnit >= 10 ? it.perUnit.toFixed(2) : it.perUnit.toPrecision(3);
    value.append(" / unit");
    row.append(name, value);
    results.append(row);
  }
}

document.querySelectorAll("input").forEach((el) => el.addEventListener("input", update));
document.getElementById("price-0").focus();
