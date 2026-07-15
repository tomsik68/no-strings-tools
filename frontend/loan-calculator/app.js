const principalInput = document.getElementById("principal");
const rateInput = document.getElementById("rate");
const yearsInput = document.getElementById("years");
const monthlyPaymentEl = document.getElementById("monthly-payment");
const totalInterestEl = document.getElementById("total-interest");
const totalPaidEl = document.getElementById("total-paid");

principalInput.focus();

principalInput.addEventListener("input", calculate);
rateInput.addEventListener("input", calculate);
yearsInput.addEventListener("input", calculate);

function calculate() {
  const principal = parseFloat(principalInput.value) || 0;
  const annualRate = parseFloat(rateInput.value) || 0;
  const years = parseInt(yearsInput.value) || 0;

  if (principal <= 0 || annualRate < 0 || years <= 0) {
    monthlyPaymentEl.textContent = "$0";
    totalInterestEl.textContent = "$0";
    totalPaidEl.textContent = "$0";
    return;
  }

  // Monthly interest rate
  const monthlyRate = annualRate / 100 / 12;
  const numPayments = years * 12;

  // Calculate monthly payment using the loan formula
  let monthlyPayment;
  if (monthlyRate === 0) {
    monthlyPayment = principal / numPayments;
  } else {
    monthlyPayment = (principal * (monthlyRate * Math.pow(1 + monthlyRate, numPayments))) / (Math.pow(1 + monthlyRate, numPayments) - 1);
  }

  const totalPaid = monthlyPayment * numPayments;
  const totalInterest = totalPaid - principal;

  monthlyPaymentEl.textContent = formatCurrency(monthlyPayment);
  totalInterestEl.textContent = formatCurrency(totalInterest);
  totalPaidEl.textContent = formatCurrency(totalPaid);
}

function formatCurrency(value) {
  return "$" + value.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

calculate();
