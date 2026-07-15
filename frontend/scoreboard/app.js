const playersEl = document.getElementById("players");
const addBtn = document.getElementById("add-btn");
const resetBtn = document.getElementById("reset-btn");

const STORAGE_KEY = "scoreboard-players";
let players = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null") || [
  { name: "Player 1", score: 0 },
  { name: "Player 2", score: 0 },
];

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(players));
}

function render() {
  playersEl.innerHTML = "";
  players.forEach((p, i) => {
    const row = document.createElement("div");
    row.className = "player-row";

    const name = document.createElement("input");
    name.className = "w3-input w3-border w3-round name";
    name.value = p.name;
    name.setAttribute("aria-label", "Player name");
    name.addEventListener("input", () => {
      p.name = name.value;
      save();
    });

    const score = document.createElement("span");
    score.className = "score";
    score.textContent = p.score;

    const minus = button("−", `Subtract 1 from ${p.name}`, () => changeScore(i, -1));
    const plus = button("+", `Add 1 to ${p.name}`, () => changeScore(i, 1));
    plus.classList.add("w3-green");
    const custom = button("±", `Add custom points to ${p.name}`, () => {
      const amount = Number(prompt(`Points for ${p.name} (negative to subtract):`));
      if (amount) changeScore(i, amount);
    });
    const remove = button("✕", `Remove ${p.name}`, () => {
      players.splice(i, 1);
      save();
      render();
    });

    row.append(name, score, minus, plus, custom, remove);
    playersEl.append(row);
  });
}

function button(label, ariaLabel, onClick) {
  const btn = document.createElement("button");
  btn.className = "w3-button w3-border w3-round";
  btn.textContent = label;
  btn.setAttribute("aria-label", ariaLabel);
  btn.addEventListener("click", onClick);
  return btn;
}

function changeScore(i, delta) {
  players[i].score += delta;
  save();
  render();
}

addBtn.addEventListener("click", () => {
  players.push({ name: `Player ${players.length + 1}`, score: 0 });
  save();
  render();
});

resetBtn.addEventListener("click", () => {
  if (!confirm("Set all scores back to zero?")) return;
  players.forEach((p) => (p.score = 0));
  save();
  render();
});

render();
