const billEl = document.getElementById("bill");
const tipEl = document.getElementById("tip");
const taxEl = document.getElementById("tax");
const taxInc = document.getElementById("tax-included");
const splitEl = document.getElementById("split");
const out = document.getElementById("out");

function money(n) { return (Math.round(n * 100) / 100).toFixed(2); }

function render() {
  const bill = parseFloat(billEl.value) || 0;
  const tipPct = parseFloat(tipEl.value) || 0;
  const taxPct = parseFloat(taxEl.value) || 0;
  const n = Math.max(1, parseInt(splitEl.value, 10) || 1);
  const included = taxInc.checked;

  let net = bill;
  let tax = 0;
  if (taxPct > 0) {
    if (included) {
      net = bill / (1 + taxPct / 100);
      tax = bill - net;
    } else {
      tax = bill * (taxPct / 100);
    }
  }
  const tip = (included ? bill : net) * (tipPct / 100);
  const total = (included ? bill : net + tax) + tip;
  const each = total / n;

  out.innerHTML = `
    <div class="w3-text-grey w3-small">Tip</div>
    <div style="font-size: 20px; font-weight: 700;">${money(tip)}</div>
    ${taxPct ? `<div class="w3-text-grey w3-small w3-margin-top">Tax</div><div style="font-weight: 600;">${money(tax)}</div>` : ""}
    <div class="w3-text-grey w3-small w3-margin-top">Total</div>
    <div style="font-size: 28px; font-weight: 700;">${money(total)}</div>
    ${n > 1 ? `<div class="w3-text-grey w3-small w3-margin-top">Per person (${n})</div><div style="font-size: 22px; font-weight: 700;">${money(each)}</div>` : ""}
  `;
}

[billEl, tipEl, taxEl, splitEl].forEach((el) => el.addEventListener("input", render));
taxInc.addEventListener("change", render);
document.querySelectorAll(".tip-p").forEach((b) => b.addEventListener("click", () => {
  tipEl.value = b.dataset.v;
  render();
}));

billEl.focus();
render();
