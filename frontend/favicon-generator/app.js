const dropZone = document.getElementById("drop-zone");
const fileInput = document.getElementById("file-input");
const iconsEl = document.getElementById("icons");
const snippetWrap = document.getElementById("snippet-wrap");
const snippet = document.getElementById("snippet");
const copyBtn = document.getElementById("copy-btn");
const copyFeedback = document.getElementById("copy-feedback");

const SIZES = [
  { px: 16, name: "favicon-16.png" },
  { px: 32, name: "favicon-32.png" },
  { px: 180, name: "apple-touch-icon.png" },
  { px: 192, name: "icon-192.png" },
  { px: 512, name: "icon-512.png" },
];

function load(file) {
  if (!file || !file.type.startsWith("image/")) return;
  const img = new Image();
  img.onload = () => {
    URL.revokeObjectURL(img.src);
    iconsEl.innerHTML = "";
    // Crop to centered square so non-square images don't get squished
    const side = Math.min(img.width, img.height);
    const sx = (img.width - side) / 2;
    const sy = (img.height - side) / 2;

    for (const { px, name } of SIZES) {
      const canvas = document.createElement("canvas");
      canvas.width = px;
      canvas.height = px;
      canvas.style.width = Math.min(px, 64) + "px";
      canvas.style.height = Math.min(px, 64) + "px";
      canvas.getContext("2d").drawImage(img, sx, sy, side, side, 0, 0, px, px);

      const link = document.createElement("a");
      link.textContent = `${name} ↓`;
      link.href = canvas.toDataURL("image/png");
      link.download = name;

      const item = document.createElement("div");
      item.className = "icon-item";
      item.append(canvas, link);
      iconsEl.append(item);
    }

    snippet.value = `<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16.png">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="icon" type="image/png" sizes="512x512" href="/icon-512.png">`;
    snippetWrap.style.display = "";
    copyFeedback.textContent = "";
  };
  img.src = URL.createObjectURL(file);
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
  await navigator.clipboard.writeText(snippet.value);
  copyFeedback.textContent = " Copied ✓";
});
