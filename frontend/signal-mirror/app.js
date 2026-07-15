const sunAngle = document.getElementById("sun-angle");
const distance = document.getElementById("distance");
const mirrorSize = document.getElementById("mirror-size");
const observerAngle = document.getElementById("observer-angle");
const result = document.getElementById("result");

function calculate() {
  const sun = parseFloat(sunAngle.value) || 0;
  const dist = parseFloat(distance.value) || 1;
  const mirror = parseFloat(mirrorSize.value) || 1;
  const observer = parseFloat(observerAngle.value) || 0;

  // Mirror reflection angle
  const reflectionAngle = sun + observer;

  // Beam spread angle (approx)
  const beamSpread = (90 / mirror) * 0.5; // degrees

  // Visible area at distance
  const beamWidth = 2 * dist * Math.tan((beamSpread * Math.PI / 180) / 2);

  // Brightness calculation (arbitrary but comparative)
  const brightness = (mirror * mirror * Math.cos(sun * Math.PI / 180)) / (dist * dist);

  result.innerHTML = `
    <div class="result-row">
      <span>Mirror Angle</span>
      <span class="result-value">${reflectionAngle.toFixed(1)}°</span>
    </div>
    <div class="result-row">
      <span>Beam Spread</span>
      <span class="result-value">±${beamSpread.toFixed(1)}°</span>
    </div>
    <div class="result-row">
      <span>Illuminated Area</span>
      <span class="result-value">${beamWidth.toFixed(1)} m</span>
    </div>
    <div class="result-row">
      <span>Brightness Index</span>
      <span class="result-value">${brightness.toFixed(2)}</span>
    </div>
    <div class="result-row">
      <span>Practical Range</span>
      <span class="result-value">${(Math.sqrt(brightness) * 30).toFixed(0)} km</span>
    </div>
  `;
}

sunAngle.addEventListener("input", calculate);
distance.addEventListener("input", calculate);
mirrorSize.addEventListener("input", calculate);
observerAngle.addEventListener("input", calculate);

calculate();
