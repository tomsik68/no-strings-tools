const dropZone = document.getElementById("drop-zone");
const fileInput = document.getElementById("file-input");
const infoEl = document.getElementById("info");
const resultsEl = document.getElementById("results");
const errorEl = document.getElementById("error");

const TARGETS = [2048, 1280, 800];
const JPEG_QUALITY = 0.85;

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} kB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

const toBlob = (canvas) => new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", JPEG_QUALITY));

async function resizeTo(bitmap, maxSide) {
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  canvas.getContext("2d").drawImage(bitmap, 0, 0, w, h);
  return { blob: await toBlob(canvas), w, h };
}

async function handle(file) {
  if (!file) return;
  errorEl.style.display = "none";
  if (!file.type.startsWith("image/")) {
    errorEl.textContent = "That doesn't look like an image";
    errorEl.style.display = "block";
    return;
  }

  let bitmap;
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    errorEl.textContent = "Couldn't read that image";
    errorEl.style.display = "block";
    return;
  }

  infoEl.textContent = `${file.name} — ${bitmap.width}×${bitmap.height}, ${formatSize(file.size)}`;
  infoEl.style.display = "block";
  resultsEl.innerHTML = "";
  resultsEl.style.display = "block";

  const original = Math.max(bitmap.width, bitmap.height);
  const targets = [...new Set([...TARGETS.filter((t) => t < original), original])];
  const baseName = file.name.replace(/\.[^.]+$/, "");

  for (const target of targets) {
    const { blob, w, h } = await resizeTo(bitmap, target);

    const label = document.createElement("span");
    label.textContent = target === original ? `${w}×${h} (original size, recompressed)` : `${w}×${h}`;

    const link = document.createElement("a");
    link.className = "w3-button w3-blue w3-round w3-small";
    link.href = URL.createObjectURL(blob);
    link.download = `${baseName}-${target}px.jpg`;
    link.textContent = `⬇️ ${formatSize(blob.size)}`;

    const li = document.createElement("li");
    li.className = "size-row";
    li.append(label, link);
    resultsEl.appendChild(li);
  }
}

fileInput.addEventListener("change", () => handle(fileInput.files[0]));

document.addEventListener("dragover", (e) => {
  e.preventDefault();
  dropZone.classList.add("over");
});
document.addEventListener("dragleave", () => dropZone.classList.remove("over"));
document.addEventListener("drop", (e) => {
  e.preventDefault();
  dropZone.classList.remove("over");
  handle(e.dataTransfer.files[0]);
});
