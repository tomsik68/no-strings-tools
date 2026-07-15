const input = document.getElementById("input");
const countEl = document.getElementById("count");
const pickBtn = document.getElementById("pick-btn");
const resultEl = document.getElementById("result");

function entries() {
  return input.value.split("\n").map((s) => s.trim()).filter(Boolean);
}

function updateCount() {
  const n = entries().length;
  countEl.textContent = n ? `${n} entries` : "";
}

function pick() {
  const list = entries();
  if (list.length === 0) {
    resultEl.textContent = "Add some entries first";
    resultEl.style.fontSize = "18px";
    return;
  }
  resultEl.style.fontSize = "";

  // Brief shuffle animation before settling
  let ticks = 0;
  const spin = setInterval(() => {
    resultEl.textContent = list[Math.floor(Math.random() * list.length)];
    if (++ticks >= 10) {
      clearInterval(spin);
      const winner = list[Math.floor(Math.random() * list.length)];
      resultEl.textContent = "🎉 " + winner;
    }
  }, 60);
}

input.addEventListener("input", updateCount);
pickBtn.addEventListener("click", pick);
input.focus();
updateCount();
