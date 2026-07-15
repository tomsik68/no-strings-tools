const dropZone = document.getElementById("drop-zone");
const fileInput = document.getElementById("file-input");
const grid = document.getElementById("grid");

// Machado et al. (2009) full-severity simulation matrices (linear RGB)
const MATRICES = {
  original: null,
  protanopia: [0.152286, 1.052583, -0.204868, 0.114503, 0.786281, 0.099216, -0.003882, -0.048116, 1.051998],
  deuteranopia: [0.367322, 0.860646, -0.227968, 0.280085, 0.672501, 0.047413, -0.01182, 0.04294, 0.968881],
  tritanopia: [1.255528, -0.076749, -0.178779, -0.078411, 0.930809, 0.147602, 0.004733, 0.691367, 0.3039],
};

const MAX_SIDE = 800;

const toLinear = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const toSrgb = (c) => (c <= 0.0031308 ? c * 12.92 : 1.055 * c ** (1 / 2.4) - 0.055);

function load(file) {
  if (!file || !file.type.startsWith("image/")) return;
  const img = new Image();
  img.onload = () => {
    URL.revokeObjectURL(img.src);
    const scale = Math.min(1, MAX_SIDE / Math.max(img.width, img.height));
    const w = Math.round(img.width * scale);
    const h = Math.round(img.height * scale);

    for (const [name, matrix] of Object.entries(MATRICES)) {
      const canvas = document.getElementById(`canvas-${name}`);
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, w, h);
      if (!matrix) continue;

      const imageData = ctx.getImageData(0, 0, w, h);
      const d = imageData.data;
      for (let i = 0; i < d.length; i += 4) {
        const r = toLinear(d[i] / 255);
        const g = toLinear(d[i + 1] / 255);
        const b = toLinear(d[i + 2] / 255);
        d[i] = 255 * toSrgb(Math.min(1, Math.max(0, matrix[0] * r + matrix[1] * g + matrix[2] * b)));
        d[i + 1] = 255 * toSrgb(Math.min(1, Math.max(0, matrix[3] * r + matrix[4] * g + matrix[5] * b)));
        d[i + 2] = 255 * toSrgb(Math.min(1, Math.max(0, matrix[6] * r + matrix[7] * g + matrix[8] * b)));
      }
      ctx.putImageData(imageData, 0, 0);
    }
    grid.style.display = "";
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
