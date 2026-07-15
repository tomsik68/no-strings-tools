const input = document.getElementById("text-input");
const stats = document.getElementById("stats");
const copyBtn = document.getElementById("copy-btn");
const copyFeedback = document.getElementById("copy-feedback");

input.focus();

const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: "base" });

const OPS = {
  sort: (lines) => [...lines].sort(collator.compare),
  "sort-desc": (lines) => [...lines].sort(collator.compare).reverse(),
  dedupe: (lines) => [...new Set(lines)],
  reverse: (lines) => [...lines].reverse(),
  shuffle: (lines) => {
    const a = [...lines];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  },
  trim: (lines) => lines.map((l) => l.trim()),
  "remove-empty": (lines) => lines.filter((l) => l.trim() !== ""),
};

function updateStats() {
  const lines = input.value ? input.value.split("\n") : [];
  const unique = new Set(lines).size;
  stats.textContent = `${lines.length} lines` + (unique < lines.length ? ` (${unique} unique)` : "");
  copyFeedback.textContent = "";
}

document.querySelectorAll("[data-op]").forEach((btn) => {
  btn.addEventListener("click", () => {
    if (!input.value) return;
    input.value = OPS[btn.dataset.op](input.value.split("\n")).join("\n");
    updateStats();
  });
});

copyBtn.addEventListener("click", async () => {
  await navigator.clipboard.writeText(input.value);
  copyFeedback.textContent = "Copied ✓";
});

input.addEventListener("input", updateStats);
updateStats();
