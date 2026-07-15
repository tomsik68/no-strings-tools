const input = document.getElementById("input");
const hashesEl = document.getElementById("hashes");
const fileInput = document.getElementById("file-input");
const fileInfo = document.getElementById("file-info");
const fileName = document.getElementById("file-name");
const clearFileBtn = document.getElementById("clear-file");
const errorEl = document.getElementById("error");

const algos = ["SHA-1", "SHA-256", "SHA-384", "SHA-512"];
const outputs = {};

for (const algo of algos) {
  const box = document.createElement("div");
  box.className = "hash-box";
  const label = document.createElement("div");
  label.className = "hash-label";
  label.textContent = algo;
  const value = document.createElement("div");
  value.className = "hash-value";
  box.append(label, value);
  hashesEl.appendChild(box);
  outputs[algo] = value;
}

let seq = 0;

async function computeBytes(data, mySeq) {
  for (const algo of algos) {
    const digest = await crypto.subtle.digest(algo, data);
    if (seq !== mySeq) return; // newer input arrived while hashing
    outputs[algo].textContent = [...new Uint8Array(digest)]
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }
}

function computeText() {
  errorEl.style.display = "none";
  fileInfo.style.display = "none";
  computeBytes(new TextEncoder().encode(input.value), ++seq);
}

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} kB`;
  if (bytes < 1073741824) return `${(bytes / 1048576).toFixed(1)} MB`;
  return `${(bytes / 1073741824).toFixed(2)} GB`;
}

async function hashFile(file) {
  if (!file) return;
  errorEl.style.display = "none";
  fileName.textContent = `📄 ${file.name} — ${formatSize(file.size)}`;
  fileInfo.style.display = "block";

  const mySeq = ++seq;
  for (const algo of algos) outputs[algo].textContent = "hashing…";
  try {
    const buffer = await file.arrayBuffer();
    if (seq !== mySeq) return;
    await computeBytes(buffer, mySeq);
  } catch {
    if (seq !== mySeq) return;
    for (const algo of algos) outputs[algo].textContent = "—";
    errorEl.textContent = "Couldn't read that file — it may be too large for this browser";
    errorEl.style.display = "block";
  }
}

input.addEventListener("input", computeText);

fileInput.addEventListener("change", () => hashFile(fileInput.files[0]));

clearFileBtn.addEventListener("click", () => {
  fileInput.value = "";
  computeText();
  input.focus();
});

document.addEventListener("dragover", (e) => e.preventDefault());
document.addEventListener("drop", (e) => {
  e.preventDefault();
  hashFile(e.dataTransfer.files[0]);
});

input.focus();
computeText();
