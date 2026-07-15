const dropZone = document.getElementById("drop-zone");
const fileInput = document.getElementById("file-input");
const fileList = document.getElementById("file-list");
const mergeBtn = document.getElementById("merge-btn");
const errorEl = document.getElementById("error");

let files = [];

function render() {
  fileList.innerHTML = "";
  files.forEach((file, i) => {
    const row = document.createElement("div");
    row.className = "file-row";

    const name = document.createElement("span");
    name.className = "name";
    name.textContent = `${i + 1}. ${file.name}`;

    const up = button("↑", `Move ${file.name} up`, () => move(i, -1));
    const down = button("↓", `Move ${file.name} down`, () => move(i, 1));
    up.disabled = i === 0;
    down.disabled = i === files.length - 1;
    const remove = button("✕", `Remove ${file.name}`, () => {
      files.splice(i, 1);
      render();
    });

    row.append(name, up, down, remove);
    fileList.append(row);
  });
  mergeBtn.style.display = files.length >= 2 ? "" : "none";
  mergeBtn.textContent = `Merge ${files.length} PDFs & download`;
}

function button(label, ariaLabel, onClick) {
  const btn = document.createElement("button");
  btn.className = "w3-button w3-border w3-round";
  btn.textContent = label;
  btn.setAttribute("aria-label", ariaLabel);
  btn.addEventListener("click", onClick);
  return btn;
}

function move(i, delta) {
  const j = i + delta;
  [files[i], files[j]] = [files[j], files[i]];
  render();
}

function add(newFiles) {
  errorEl.style.display = "none";
  for (const f of newFiles) {
    if (f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf")) files.push(f);
  }
  render();
}

fileInput.addEventListener("change", () => {
  add(fileInput.files);
  fileInput.value = "";
});

dropZone.addEventListener("dragover", (e) => {
  e.preventDefault();
  dropZone.classList.add("dragover");
});
dropZone.addEventListener("dragleave", () => dropZone.classList.remove("dragover"));
dropZone.addEventListener("drop", (e) => {
  e.preventDefault();
  dropZone.classList.remove("dragover");
  add(e.dataTransfer.files);
});

mergeBtn.addEventListener("click", async () => {
  mergeBtn.disabled = true;
  mergeBtn.textContent = "Merging…";
  errorEl.style.display = "none";
  try {
    const merged = await PDFLib.PDFDocument.create();
    for (const file of files) {
      const src = await PDFLib.PDFDocument.load(await file.arrayBuffer(), { ignoreEncryption: true });
      const pages = await merged.copyPages(src, src.getPageIndices());
      pages.forEach((p) => merged.addPage(p));
    }
    const bytes = await merged.save();
    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob([bytes], { type: "application/pdf" }));
    link.download = "merged.pdf";
    link.click();
    URL.revokeObjectURL(link.href);
  } catch (e) {
    errorEl.textContent = "Couldn't merge — one of the files may be corrupted or password-protected.";
    errorEl.style.display = "";
  }
  mergeBtn.disabled = false;
  render();
});
