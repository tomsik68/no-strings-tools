const initialInput = document.getElementById("initial");
const monthlyInput = document.getElementById("monthly");
const returnRateInput = document.getElementById("return-rate");
const yearsInput = document.getElementById("years");
const totalInvestedEl = document.getElementById("total-invested");
const investmentGainEl = document.getElementById("investment-gain");
const futureValueEl = document.getElementById("future-value");

initialInput.focus();

initialInput.addEventListener("input", calculate);
monthlyInput.addEventListener("input", calculate);
returnRateInput.addEventListener("input", calculate);
yearsInput.addEventListener("input", calculate);

function calculate() {
  const initial = parseFloat(initialInput.value) || 0;
  const monthly = parseFloat(monthlyInput.value) || 0;
  const annualReturn = parseFloat(returnRateInput.value) || 0;
  const years = parseInt(yearsInput.value) || 0;

  if (initial < 0 || monthly < 0 || annualReturn < 0 || years <= 0) {
    totalInvestedEl.textContent = "$0";
    investmentGainEl.textContent = "$0";
    futureValueEl.textContent = "$0";
    return;
  }

  // Monthly return rate
  const monthlyReturn = annualReturn / 100 / 12;
  const months = years * 12;

  // Future value of initial investment
  let futureValue = initial * Math.pow(1 + monthlyReturn, months);

  // Future value of monthly contributions (annuity formula)
  if (monthlyReturn === 0) {
    futureValue += monthly * months;
  } else {
    futureValue += monthly * ((Math.pow(1 + monthlyReturn, months) - 1) / monthlyReturn);
  }

  // Total amount invested
  const totalInvested = initial + monthly * months;

  // Gain
  const gain = futureValue - totalInvested;

  totalInvestedEl.textContent = formatCurrency(totalInvested);
  investmentGainEl.textContent = formatCurrency(gain);
  futureValueEl.textContent = formatCurrency(futureValue);
}

function formatCurrency(value) {
  return "$" + value.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

calculate();
