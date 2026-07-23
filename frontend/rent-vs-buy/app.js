const $ = (id) => document.getElementById(id);
const money = (n) => Math.round(n).toLocaleString();

function monthlyPayment(principal, annualRate, years) {
  const r = annualRate / 100 / 12;
  const n = years * 12;
  if (r === 0) return principal / n;
  return principal * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
}

function render() {
  const price = parseFloat($("price").value) || 0;
  const downPct = parseFloat($("down").value) || 0;
  const rate = parseFloat($("rate").value) || 0;
  const term = parseFloat($("years").value) || 30;
  const rent = parseFloat($("rent").value) || 0;
  const horizon = parseFloat($("horizon").value) || 1;
  const growth = parseFloat($("growth").value) || 0;

  const down = price * (downPct / 100);
  const loan = price - down;
  const pmt = monthlyPayment(loan, rate, term);
  const months = horizon * 12;

  // Remaining balance after `months` payments
  const r = rate / 100 / 12;
  let balance = loan;
  let interestPaid = 0;
  for (let i = 0; i < months && balance > 0; i++) {
    const interest = balance * r;
    const principal = Math.min(balance, pmt - interest);
    interestPaid += interest;
    balance -= principal;
  }

  const homeValue = price * Math.pow(1 + growth / 100, horizon);
  const equity = homeValue - balance;
  const buyCashOut = pmt * months + down; // cash spent
  const buyNetCost = buyCashOut - equity; // opportunity-naive net cost
  const rentCost = rent * months;
  const diff = rentCost - buyNetCost;

  $("out").innerHTML = `
    <div class="w3-text-grey w3-small">Monthly mortgage</div>
    <div style="font-size:24px;font-weight:700;">${money(pmt)}</div>
    <div class="w3-text-grey w3-small w3-margin-top">After ${horizon} years</div>
    <table class="w3-table w3-small" style="margin-top:4px;">
      <tr><td>Cash paid (buy)</td><td><strong>${money(buyCashOut)}</strong></td></tr>
      <tr><td>Est. equity</td><td><strong>${money(equity)}</strong></td></tr>
      <tr><td>Net cost of buying</td><td><strong>${money(buyNetCost)}</strong></td></tr>
      <tr><td>Rent paid</td><td><strong>${money(rentCost)}</strong></td></tr>
    </table>
    <div class="w3-margin-top" style="font-size:18px;font-weight:700;">
      ${diff > 0
        ? `Buying looks ~${money(diff)} cheaper over ${horizon}y`
        : `Renting looks ~${money(-diff)} cheaper over ${horizon}y`}
    </div>
    <p class="w3-text-grey w3-small">Ignores taxes, fees, maintenance, insurance, and investment returns on the down payment.</p>`;
}

["price", "down", "rate", "years", "rent", "horizon", "growth"].forEach((id) => {
  $(id).addEventListener("input", render);
});
$("price").focus();
render();
