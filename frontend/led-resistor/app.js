const supplyVoltage = document.getElementById("supply-voltage");
const ledVoltage = document.getElementById("led-voltage");
const desiredCurrent = document.getElementById("desired-current");
const powerRating = document.getElementById("power-rating");
const result = document.getElementById("result");

function calculate() {
  const supply = parseFloat(supplyVoltage.value) || 0;
  const led = parseFloat(ledVoltage.value) || 0;
  const current = parseFloat(desiredCurrent.value) || 0;
  const power = parseFloat(powerRating.value) || 0;

  if (supply <= led || current === 0) {
    result.innerHTML = '<div style="color: #c62828;">Invalid values</div>';
    return;
  }

  const voltage = supply - led;
  const resistance = (voltage / current) * 1000; // in ohms
  const powerDissipated = (voltage * voltage) / resistance;

  // Find nearest standard resistor
  const standardValues = [10, 12, 15, 18, 22, 27, 33, 39, 47, 56, 68, 82];
  let nearestR = resistance;
  let minDiff = Infinity;

  for (let decade = 1; decade <= 100000; decade *= 10) {
    standardValues.forEach(val => {
      const r = val * decade;
      const diff = Math.abs(r - resistance);
      if (diff < minDiff) {
        minDiff = diff;
        nearestR = r;
      }
    });
  }

  const actualCurrent = (voltage * 1000) / nearestR;
  const actualPower = (voltage * voltage) / nearestR;
  const safetyMargin = ((power * 1000 - actualPower * 1000) / (power * 1000)) * 100;

  result.innerHTML = `
    <div class="result-row"><span>Ideal Resistance</span><span class="result-value">${resistance.toFixed(1)} Ω</span></div>
    <div class="result-row"><span>Nearest Standard</span><span class="result-value">${nearestR} Ω</span></div>
    <div class="result-row"><span>Actual Current</span><span class="result-value">${actualCurrent.toFixed(1)} mA</span></div>
    <div class="result-row"><span>Power Dissipated</span><span class="result-value">${actualPower.toFixed(3)} W</span></div>
    <div class="result-row"><span>Safety Margin</span><span class="result-value" style="color: ${safetyMargin > 20 ? '#4caf50' : '#ff9800'}">${safetyMargin.toFixed(0)}%</span></div>
  `;
}

supplyVoltage.addEventListener("input", calculate);
ledVoltage.addEventListener("input", calculate);
desiredCurrent.addEventListener("input", calculate);
powerRating.addEventListener("input", calculate);

calculate();
