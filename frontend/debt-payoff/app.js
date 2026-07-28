const $ = (id) => document.getElementById(id);
const money = (n) => Math.round(n).toLocaleString();

function simulate(balance, apr, payment) {
  const r = apr / 100 / 12;
  let bal = balance;
  let months = 0;
  let interest = 0;
  while (bal > 0.005 && months < 1200) {
    const i = bal * r;
    if (payment <= i) return null; // payment doesn't cover interest
    interest += i;
    bal = bal + i - Math.min(payment, bal + i);
    months++;
  }
  return { months, interest, total: balance + interest };
}

function fmtMonths(m) {
  const y = Math.floor(m / 12);
  const r = m % 12;
  if (!y) return `${m} month${m !== 1 ? "s" : ""}`;
  if (!r) return `${y} year${y !== 1 ? "s" : ""}`;
  return `${y}y ${r}mo`;
}

function payoffDate(months) {
  const d = new Date();
  d.setMonth(d.getMonth() + months);
  return d.toLocaleDateString(undefined, { month: "long", year: "numeric" });
}

function render() {
  const balance = parseFloat($("balance").value) || 0;
  const apr = parseFloat($("apr").value) || 0;
  const payment = parseFloat($("payment").value) || 0;
  const out = $("out");

  if (!(balance > 0 && payment > 0)) {
    out.innerHTML = '<p class="w3-text-grey">Enter balance and payment.</p>';
    return;
  }
  const res = simulate(balance, apr, payment);
  if (!res) {
    out.innerHTML = '<div class="w3-panel w3-pale-red w3-round" style="padding: 12px;">Payment doesn\'t cover the monthly interest — the debt never goes down.</div>';
    return;
  }

  const rows = [0, 25, 50, 100].map((extra) => {
    if (extra === 0) return "";
    const r2 = simulate(balance, apr, payment + extra);
    if (!r2) return "";
    const savedM = res.months - r2.months;
    const savedI = res.interest - r2.interest;
    if (savedM <= 0) return "";
    return `<tr><td>+${extra}/mo</td><td><strong>${fmtMonths(r2.months)}</strong></td><td>saves ${money(savedI)}</td></tr>`;
  }).join("");

  out.innerHTML = `
    <div class="w3-panel w3-white w3-round w3-border" style="padding: 16px;">
      <div class="w3-text-grey w3-small">Debt-free in</div>
      <div style="font-size: 30px; font-weight: 700;">${fmtMonths(res.months)}</div>
      <div class="w3-text-grey w3-small">${payoffDate(res.months)}</div>
      <div class="w3-text-grey w3-small" style="margin-top: 10px;">Total interest</div>
      <div style="font-size: 22px; font-weight: 700;">${money(res.interest)}</div>
      <div class="w3-text-grey w3-small">Total paid ${money(res.total)}</div>
    </div>
    ${rows ? `<div class="w3-panel w3-white w3-round w3-border" style="padding: 12px 16px;">
      <div class="w3-text-grey w3-small" style="margin-bottom: 4px;">Pay a bit more</div>
      <table class="w3-table w3-small">${rows}</table>
    </div>` : ""}`;
}

["balance", "apr", "payment"].forEach((id) => $(id).addEventListener("input", render));
$("balance").focus();
render();
