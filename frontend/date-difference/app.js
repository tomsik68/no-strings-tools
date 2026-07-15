const fromInput = document.getElementById("from");
const toInput = document.getElementById("to");
const daysEl = document.getElementById("days");
const weeksEl = document.getElementById("weeks");
const breakdownEl = document.getElementById("breakdown");

const today = new Date().toISOString().slice(0, 10);
fromInput.value = today;
toInput.value = today;

function calculate() {
  const from = new Date(fromInput.value + "T00:00:00");
  const to = new Date(toInput.value + "T00:00:00");
  if (isNaN(from) || isNaN(to)) {
    daysEl.textContent = weeksEl.textContent = breakdownEl.textContent = "—";
    return;
  }

  const [a, b] = from <= to ? [from, to] : [to, from];
  const totalDays = Math.round((b - a) / 86400000);

  daysEl.textContent = totalDays.toLocaleString();
  weeksEl.textContent =
    totalDays < 7
      ? "—"
      : `${Math.floor(totalDays / 7)} weeks` + (totalDays % 7 ? `, ${totalDays % 7} days` : "");

  let years = b.getFullYear() - a.getFullYear();
  let months = b.getMonth() - a.getMonth();
  let days = b.getDate() - a.getDate();
  if (days < 0) {
    months--;
    days += new Date(b.getFullYear(), b.getMonth(), 0).getDate();
  }
  if (months < 0) {
    years--;
    months += 12;
  }

  const parts = [];
  if (years) parts.push(`${years}y`);
  if (months) parts.push(`${months}m`);
  parts.push(`${days}d`);
  breakdownEl.textContent = parts.join(" ");
}

fromInput.addEventListener("input", calculate);
toInput.addEventListener("input", calculate);
fromInput.focus();
calculate();
