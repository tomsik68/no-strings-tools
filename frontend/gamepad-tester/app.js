const promptEl = document.getElementById("prompt");
const padEl = document.getElementById("pad");
const padName = document.getElementById("pad-name");
const buttonsEl = document.getElementById("buttons");
const axesEl = document.getElementById("axes");

let buttonBoxes = [];
let axisRows = [];

function buildUI(gamepad) {
  padName.textContent = gamepad.id;
  buttonsEl.innerHTML = "";
  axesEl.innerHTML = "";
  buttonBoxes = [];
  axisRows = [];

  gamepad.buttons.forEach((_, i) => {
    const box = document.createElement("div");
    box.className = "btn-box";
    const label = document.createElement("div");
    label.textContent = "B" + i;
    const value = document.createElement("div");
    value.className = "btn-value";
    box.append(label, value);
    buttonsEl.appendChild(box);
    buttonBoxes.push({ box, value });
  });

  gamepad.axes.forEach((_, i) => {
    const row = document.createElement("div");
    row.className = "axis-row";
    const label = document.createElement("div");
    label.className = "axis-label";
    label.textContent = "Axis " + i;
    const bar = document.createElement("div");
    bar.className = "axis-bar";
    const fill = document.createElement("div");
    fill.className = "axis-fill";
    bar.appendChild(fill);
    const value = document.createElement("div");
    value.className = "axis-value";
    row.append(label, bar, value);
    axesEl.appendChild(row);
    axisRows.push({ fill, value });
  });
}

function poll() {
  const gamepad = [...navigator.getGamepads()].find((g) => g);
  if (gamepad) {
    promptEl.style.display = "none";
    padEl.style.display = "block";
    if (buttonBoxes.length !== gamepad.buttons.length) buildUI(gamepad);

    gamepad.buttons.forEach((button, i) => {
      buttonBoxes[i].box.classList.toggle("pressed", button.pressed);
      buttonBoxes[i].value.textContent = button.value > 0 ? button.value.toFixed(2) : "";
    });
    gamepad.axes.forEach((axis, i) => {
      axisRows[i].fill.style.left = `calc(${((axis + 1) / 2) * 100}% - 2px)`;
      axisRows[i].value.textContent = axis.toFixed(2);
    });
  } else {
    promptEl.style.display = "block";
    padEl.style.display = "none";
    buttonBoxes = [];
  }
  requestAnimationFrame(poll);
}

window.addEventListener("gamepadconnected", (e) => console.log("[gamepad] connected:", e.gamepad.id));
window.addEventListener("gamepaddisconnected", (e) => console.log("[gamepad] disconnected:", e.gamepad.id));
poll();
