const titleEl = document.getElementById("title");
const slugEl = document.getElementById("slug");
const fb = document.getElementById("fb");

function slugify(s) {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/['']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

function render() {
  const slug = slugify(titleEl.value);
  slugEl.textContent = slug || "—";
  fb.textContent = "";
}

titleEl.addEventListener("input", render);
document.getElementById("copy").addEventListener("click", async () => {
  const slug = slugEl.textContent;
  if (!slug || slug === "—") return;
  try {
    await navigator.clipboard.writeText(slug);
    fb.textContent = "Copied";
    setTimeout(() => (fb.textContent = ""), 1500);
  } catch {
    fb.textContent = "Couldn't copy";
  }
});

titleEl.focus();
render();
