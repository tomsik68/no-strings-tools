const rateAmount = document.getElementById("rate-amount");
const ratePeriod = document.getElementById("rate-period");
const durationHours = document.getElementById("duration-hours");
const durationMinutes = document.getElementById("duration-minutes");
const totalCost = document.getElementById("total-cost");
const breakdown = document.getElementById("breakdown");
const budget = document.getElementById("budget");
const maxDuration = document.getElementById("max-duration");

function calculateCost() {
  const rate = parseFloat(rateAmount.value) || 0;
  const period = ratePeriod.value;
  const hours = parseFloat(durationHours.value) || 0;
  const minutes = parseFloat(durationMinutes.value) || 0;

  // Convert duration to minutes
  const totalMinutes = hours * 60 + minutes;

  // Calculate cost based on period
  let cost = 0;
  if (period === "hour") {
    const hourCount = totalMinutes / 60;
    cost = hourCount * rate;
  } else if (period === "30min") {
    const blocks = Math.ceil(totalMinutes / 30);
    cost = blocks * rate;
  } else if (period === "day") {
    const dayCount = totalMinutes / (24 * 60);
    cost = dayCount * rate;
  }

  totalCost.textContent = "$" + cost.toFixed(2);

  // Show breakdown
  let breakdownText = "";
  if (period === "hour") {
    const hourCount = totalMinutes / 60;
    breakdownText = `${hourCount.toFixed(2)} hours × $${rate}/hr`;
  } else if (period === "30min") {
    const blocks = Math.ceil(totalMinutes / 30);
    breakdownText = `${blocks} blocks (30min) × $${rate}`;
  } else if (period === "day") {
    const dayCount = totalMinutes / (24 * 60);
    breakdownText = `${dayCount.toFixed(2)} days × $${rate}/day`;
  }

  breakdown.innerHTML = `<div class="breakdown-row"><span>${breakdownText}</span><span>$${cost.toFixed(2)}</span></div>`;
}

function calculateMaxDuration() {
  const rate = parseFloat(rateAmount.value) || 0;
  const period = ratePeriod.value;
  const budgetAmount = parseFloat(budget.value) || 0;

  if (rate === 0) {
    maxDuration.textContent = "∞";
    return;
  }

  let totalMinutes = 0;
  if (period === "hour") {
    const hours = budgetAmount / rate;
    totalMinutes = hours * 60;
  } else if (period === "30min") {
    const blocks = Math.floor(budgetAmount / rate);
    totalMinutes = blocks * 30;
  } else if (period === "day") {
    const days = budgetAmount / rate;
    totalMinutes = days * 24 * 60;
  }

  const h = Math.floor(totalMinutes / 60);
  const m = Math.floor(totalMinutes % 60);

  maxDuration.textContent = `${h}h ${m}m`;
}

rateAmount.addEventListener("input", () => {
  calculateCost();
  calculateMaxDuration();
});
ratePeriod.addEventListener("change", () => {
  calculateCost();
  calculateMaxDuration();
});
durationHours.addEventListener("input", calculateCost);
durationMinutes.addEventListener("input", calculateCost);
budget.addEventListener("input", calculateMaxDuration);

calculateCost();
calculateMaxDuration();
