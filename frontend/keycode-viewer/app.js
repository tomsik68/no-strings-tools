const promptEl = document.getElementById("prompt");
const keyDisplay = document.getElementById("key-display");
const details = document.getElementById("details");
const keyEl = document.getElementById("key");
const codeEl = document.getElementById("code");
const keycodeEl = document.getElementById("keycode");
const modifiersEl = document.getElementById("modifiers");

window.addEventListener("keydown", (event) => {
  event.preventDefault();

  promptEl.style.display = "none";
  keyDisplay.style.display = "block";
  details.style.display = "grid";

  keyDisplay.textContent = event.key === " " ? "Space" : event.key;
  keyEl.textContent = JSON.stringify(event.key);
  codeEl.textContent = event.code || "—";
  keycodeEl.textContent = event.keyCode;

  const mods = [];
  if (event.ctrlKey) mods.push("Ctrl");
  if (event.shiftKey) mods.push("Shift");
  if (event.altKey) mods.push("Alt");
  if (event.metaKey) mods.push("Meta");
  modifiersEl.textContent = mods.length ? mods.join(" + ") : "none";
});
