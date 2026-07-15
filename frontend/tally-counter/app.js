const countEl = document.getElementById("count");
const plusBtn = document.getElementById("plus-btn");
const minusBtn = document.getElementById("minus-btn");
const resetBtn = document.getElementById("reset-btn");

const STORAGE_KEY = "tally-counter-count";
let count = Number(localStorage.getItem(STORAGE_KEY)) || 0;

function render() {
  countEl.textContent = count;
  localStorage.setItem(STORAGE_KEY, count);
}

function change(delta) {
  count += delta;
  render();
}

plusBtn.addEventListener("click", () => change(1));
minusBtn.addEventListener("click", () => change(-1));

resetBtn.addEventListener("click", () => {
  if (count !== 0 && !confirm(`Reset count of ${count} to zero?`)) return;
  count = 0;
  render();
});

document.addEventListener("keydown", (e) => {
  if (e.target.tagName === "BUTTON" && e.key === " ") return; // let focused buttons handle Space
  if (e.key === " " || e.key === "ArrowUp" || e.key === "+") {
    e.preventDefault();
    change(1);
  } else if (e.key === "ArrowDown" || e.key === "-") {
    e.preventDefault();
    change(-1);
  }
});

plusBtn.focus();
render();
