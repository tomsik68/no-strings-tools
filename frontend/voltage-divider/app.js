const inputVoltage = document.getElementById("input-voltage");
const r1 = document.getElementById("r1");
const r2 = document.getElementById("r2");
const result = document.getElementById("result");

function calculate() {
  const vin = parseFloat(inputVoltage.value) || 0;
  // Don't use `|| 1`: 0 is a legitimate resistance and must not become 1Ω
  const r1Val = isNaN(parseFloat(r1.value)) ? 0 : parseFloat(r1.value);
  const r2Val = isNaN(parseFloat(r2.value)) ? 0 : parseFloat(r2.value);

  if (r1Val + r2Val === 0) {
    result.innerHTML = '<div class="result-row"><span>Enter resistor values</span><span class="result-value">--</span></div>';
    return;
  }

  const vout = vin * (r2Val / (r1Val + r2Val));
  const attenuation = (r2Val / (r1Val + r2Val)) * 100;
  const totalR = r1Val + r2Val;
  const current = (vin / totalR) * 1000; // mA

  result.innerHTML = `
    <div class="result-row"><span>Output Voltage</span><span class="result-value">${vout.toFixed(3)} V</span></div>
    <div class="result-row"><span>Attenuation</span><span class="result-value">${attenuation.toFixed(1)}%</span></div>
    <div class="result-row"><span>Total Resistance</span><span class="result-value">${totalR} Ω</span></div>
    <div class="result-row"><span>Current</span><span class="result-value">${current.toFixed(2)} mA</span></div>
  `;
}

inputVoltage.addEventListener("input", calculate);
r1.addEventListener("input", calculate);
r2.addEventListener("input", calculate);

calculate();
