const input = document.getElementById("input");
const output = document.getElementById("output");
const inputKind = document.getElementById("input-kind");
const outputKind = document.getElementById("output-kind");
const errorEl = document.getElementById("error");
const copyBtn = document.getElementById("copy-btn");
const copyFeedback = document.getElementById("copy-feedback");

if (typeof jsyaml === "undefined") {
  errorEl.textContent = "YAML library failed to load — connect once so it can cache, then this works offline.";
  errorEl.style.display = "";
}

input.focus();

function convert() {
  const text = input.value.trim();
  copyFeedback.textContent = "";
  errorEl.style.display = "none";
  if (typeof jsyaml === "undefined") {
    errorEl.textContent = "YAML library failed to load — connect once so it can cache, then this works offline.";
    errorEl.style.display = "";
    return;
  }
  if (!text) {
    output.value = "";
    inputKind.textContent = "";
    outputKind.textContent = "";
    return;
  }

  // JSON is a subset of YAML, so try JSON first to pick the right direction
  try {
    const data = JSON.parse(text);
    inputKind.textContent = "(JSON)";
    outputKind.textContent = "(YAML)";
    output.value = jsyaml.dump(data, { lineWidth: 100 });
    return;
  } catch {
    /* not JSON — fall through to YAML */
  }

  try {
    const data = jsyaml.load(text);
    if (typeof data === "string") throw new Error("This doesn't look like YAML or JSON.");
    inputKind.textContent = "(YAML)";
    outputKind.textContent = "(JSON)";
    output.value = JSON.stringify(data, null, 2);
  } catch (e) {
    inputKind.textContent = "";
    outputKind.textContent = "";
    output.value = "";
    errorEl.textContent = (e.message || "Couldn't parse that.").split("\n")[0];
    errorEl.style.display = "";
  }
}

input.addEventListener("input", convert);

copyBtn.addEventListener("click", async () => {
  await navigator.clipboard.writeText(output.value);
  copyFeedback.textContent = " Copied ✓";
});
