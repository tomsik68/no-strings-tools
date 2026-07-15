const dropZone = document.getElementById("drop-zone");
const fileInput = document.getElementById("file-input");
const resultEl = document.getElementById("result");
const summaryEl = document.getElementById("summary");
const downloadLink = document.getElementById("download-link");
const errorEl = document.getElementById("error");

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} kB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

// Re-encoding through a canvas drops every metadata block (EXIF, GPS, XMP,
// thumbnails); orientation is baked into the pixels first so the clean copy
// still displays the right way up
async function handle(file) {
  if (!file) return;
  errorEl.style.display = "none";
  resultEl.style.display = "none";
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

  const canvas = document.createElement("canvas");
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  canvas.getContext("2d").drawImage(bitmap, 0, 0);

  const png = file.type === "image/png";
  const blob = await new Promise((resolve) =>
    canvas.toBlob(resolve, png ? "image/png" : "image/jpeg", 0.92),
  );

  const baseName = file.name.replace(/\.[^.]+$/, "");
  const outName = `${baseName}-clean.${png ? "png" : "jpg"}`;
  if (downloadLink.href) URL.revokeObjectURL(downloadLink.href);
  downloadLink.href = URL.createObjectURL(blob);
  downloadLink.download = outName;
  downloadLink.textContent = `⬇️ Download ${outName} — ${formatSize(blob.size)}`;
  summaryEl.textContent = `Metadata removed (${bitmap.width}×${bitmap.height}, ${formatSize(file.size)} → ${formatSize(blob.size)})`;
  resultEl.style.display = "block";
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
