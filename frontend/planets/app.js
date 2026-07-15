const planets = [
  { name: "Mercury", icon: "☿️", diameter: 3882, distance: 57.9, moons: 0 },
  { name: "Venus", icon: "♀️", diameter: 12104, distance: 108.2, moons: 0 },
  { name: "Earth", icon: "🌍", diameter: 12742, distance: 149.6, moons: 1 },
  { name: "Mars", icon: "♂️", diameter: 6779, distance: 227.9, moons: 2 },
  { name: "Jupiter", icon: "♃", diameter: 139820, distance: 778.5, moons: 95 },
  { name: "Saturn", icon: "♄", diameter: 116460, distance: 1434.0, moons: 146 },
  { name: "Uranus", icon: "♅", diameter: 50724, distance: 2871.0, moons: 28 },
  { name: "Neptune", icon: "♆", diameter: 49244, distance: 4495.1, moons: 16 }
];

const grid = document.getElementById("planets-grid");
const detailBox = document.getElementById("detail-box");

grid.innerHTML = planets.map(p => `
  <div class="planet-card" data-name="${p.name}">
    <div class="planet-icon">${p.icon}</div>
    <div class="planet-name">${p.name}</div>
  </div>
`).join("");

grid.querySelectorAll(".planet-card").forEach(card => {
  card.addEventListener("click", () => {
    const name = card.getAttribute("data-name");
    const planet = planets.find(p => p.name === name);
    detailBox.innerHTML = `
      <div class="detail-row">
        <span class="detail-label">Diameter</span>
        <span class="detail-value">${planet.diameter} km</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Distance from Sun</span>
        <span class="detail-value">${planet.distance} million km</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Moons</span>
        <span class="detail-value">${planet.moons}</span>
      </div>
    `;
  });
});
