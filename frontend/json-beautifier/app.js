const jsonInput = document.getElementById("json-input");
const output = document.getElementById("output");
const errorContainer = document.getElementById("error-container");
const copyBtn = document.getElementById("copy-btn");
const copyFeedback = document.getElementById("copy-feedback");

jsonInput.focus();

function beautify() {
  const input = jsonInput.value.trim();

  if (!input) {
    output.textContent = "Paste JSON above...";
    errorContainer.innerHTML = "";
    return;
  }

  try {
    const parsed = JSON.parse(input);
    const formatted = JSON.stringify(parsed, null, 2);
    output.textContent = formatted;
    errorContainer.innerHTML = "";
  } catch (error) {
    output.textContent = "";
    errorContainer.innerHTML = `<div class="error">Invalid JSON: ${escapeHtml(error.message)}</div>`;
  }
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

jsonInput.addEventListener("input", beautify);

copyBtn.addEventListener("click", () => {
  const text = output.textContent;
  if (!text || text === "Paste JSON above...") return;

  navigator.clipboard.writeText(text).then(() => {
    copyFeedback.textContent = "Copied!";
    setTimeout(() => {
      copyFeedback.textContent = "";
    }, 2000);
  });
});
