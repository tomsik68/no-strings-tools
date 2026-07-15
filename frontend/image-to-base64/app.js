const dropZone = document.getElementById("drop-zone");
const fileInput = document.getElementById("file-input");
const preview = document.getElementById("preview");
const info = document.getElementById("info");
const output = document.getElementById("output");
const copyBtn = document.getElementById("copy-btn");
const copyFeedback = document.getElementById("copy-feedback");

function load(file) {
  if (!file || !file.type.startsWith("image/")) {
    info.textContent = "That doesn't look like an image file.";
    return;
  }
  const reader = new FileReader();
  reader.onload = () => {
    const dataUri = reader.result;
    preview.src = dataUri;
    preview.style.display = "";
    output.value = dataUri;
    output.style.display = "";
    copyBtn.style.display = "";
    copyFeedback.textContent = "";
    const kb = (x) => (x / 1024).toFixed(1) + " KB";
    info.textContent = `${file.name} — ${kb(file.size)} file → ${kb(dataUri.length)} as Base64 (+${Math.round((dataUri.length / file.size - 1) * 100)}%)`;
  };
  reader.readAsDataURL(file);
}

fileInput.addEventListener("change", () => load(fileInput.files[0]));

dropZone.addEventListener("dragover", (e) => {
  e.preventDefault();
  dropZone.classList.add("dragover");
});
dropZone.addEventListener("dragleave", () => dropZone.classList.remove("dragover"));
dropZone.addEventListener("drop", (e) => {
  e.preventDefault();
  dropZone.classList.remove("dragover");
  load(e.dataTransfer.files[0]);
});

copyBtn.addEventListener("click", async () => {
  await navigator.clipboard.writeText(output.value);
  copyFeedback.textContent = " Copied ✓";
});
