const grid = document.getElementById("ascii-grid");

for (let i = 32; i < 127; i++) {
  const card = document.createElement("div");
  card.className = "ascii-card";
  card.innerHTML = `
    <div class="ascii-char">${String.fromCharCode(i)}</div>
    <div class="ascii-code">${i}</div>
  `;
  grid.appendChild(card);
}
