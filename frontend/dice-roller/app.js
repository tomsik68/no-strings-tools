const diceButtons = document.querySelectorAll(".dice-btn");
const rollType = document.getElementById("roll-type");
const rollValue = document.getElementById("roll-value");
const rollTime = document.getElementById("roll-time");
const logList = document.getElementById("log-list");
const clearBtn = document.getElementById("clear-btn");

const diceSizes = {
  d4: 4,
  d6: 6,
  d8: 8,
  d10: 10,
  d12: 12,
  d20: 20,
  d100: 100,
};

let rolls = JSON.parse(localStorage.getItem("dice-rolls")) || [];

diceButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const diceType = btn.getAttribute("data-dice");
    roll(diceType);
  });
});

clearBtn.addEventListener("click", () => {
  if (rolls.length === 0) return;
  if (confirm("Clear all rolls?")) {
    rolls = [];
    localStorage.setItem("dice-rolls", JSON.stringify(rolls));
    renderLog();
  }
});

function roll(diceType) {
  const max = diceSizes[diceType];
  const result = Math.floor(Math.random() * max) + 1;
  const timestamp = new Date();

  rolls.push({
    dice: diceType,
    result,
    timestamp: timestamp.toISOString(),
  });

  localStorage.setItem("dice-rolls", JSON.stringify(rolls));

  // Display result
  rollType.textContent = diceType.toUpperCase();
  rollValue.textContent = result;
  rollTime.textContent = formatTime(timestamp);

  renderLog();
}

function formatTime(date) {
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  return `${hours}:${minutes}:${seconds}`;
}

function renderLog() {
  if (rolls.length === 0) {
    logList.innerHTML = '<div class="log-empty">No rolls yet.</div>';
    return;
  }

  logList.innerHTML = rolls
    .slice()
    .reverse()
    .map((roll) => {
      const date = new Date(roll.timestamp);
      const time = formatTime(date);
      return `
        <div class="log-entry">
          <div class="roll-info">
            <div class="roll-die">${roll.dice.toUpperCase()}</div>
            <div class="roll-result">${roll.result}</div>
          </div>
          <div class="roll-timestamp">${time}</div>
        </div>
      `;
    })
    .join("");
}

renderLog();
