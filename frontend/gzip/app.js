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

async function handle(file) {
  if (!file) return;
  errorEl.style.display = "none";
  resultEl.style.display = "none";

  const head = new Uint8Array(await file.slice(0, 2).arrayBuffer());
  const isGzip = head[0] === 0x1f && head[1] === 0x8b;

  try {
    const stream = file.stream().pipeThrough(isGzip ? new DecompressionStream("gzip") : new CompressionStream("gzip"));
    const blob = await new Response(stream).blob();

    const outName = isGzip ? (file.name.replace(/\.gz$/i, "") || "decompressed") : `${file.name}.gz`;
    if (downloadLink.href) URL.revokeObjectURL(downloadLink.href);
    downloadLink.href = URL.createObjectURL(blob);
    downloadLink.download = outName;
    downloadLink.textContent = `⬇️ Download ${outName} — ${formatSize(blob.size)}`;

    if (isGzip) {
      summaryEl.textContent = `Decompressed: ${formatSize(file.size)} → ${formatSize(blob.size)}`;
    } else {
      const saved = Math.round((1 - blob.size / file.size) * 100);
      summaryEl.textContent = saved > 0
        ? `Compressed: ${formatSize(file.size)} → ${formatSize(blob.size)} (${saved}% smaller)`
        : `Compressed: ${formatSize(file.size)} → ${formatSize(blob.size)} — no smaller, it was already compressed`;
    }
    resultEl.style.display = "block";
  } catch {
    errorEl.textContent = isGzip ? "That .gz file looks corrupted" : "Couldn't compress that file";
    errorEl.style.display = "block";
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
