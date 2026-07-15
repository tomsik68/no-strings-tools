const leftInput = document.getElementById("left");
const rightInput = document.getElementById("right");
const output = document.getElementById("output");
const summary = document.getElementById("summary");
const errorEl = document.getElementById("error");

// Line diff via longest common subsequence
function diffLines(a, b) {
  const n = a.length;
  const m = b.length;
  const dp = Array.from({ length: n + 1 }, () => new Int32Array(m + 1));
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      dp[i][j] = a[i] === b[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }

  const result = [];
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (a[i] === b[j]) {
      result.push({ type: "same", text: a[i] });
      i++;
      j++;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      result.push({ type: "del", text: a[i++] });
    } else {
      result.push({ type: "add", text: b[j++] });
    }
  }
  while (i < n) result.push({ type: "del", text: a[i++] });
  while (j < m) result.push({ type: "add", text: b[j++] });
  return result;
}

function update() {
  const a = leftInput.value.split("\n");
  const b = rightInput.value.split("\n");

  if (a.length * b.length > 4_000_000) {
    errorEl.textContent = "Texts too large to diff (keep under ~2000 lines each)";
    errorEl.style.display = "block";
    output.style.display = "none";
    summary.textContent = "";
    return;
  }
  errorEl.style.display = "none";

  if (!leftInput.value && !rightInput.value) {
    output.style.display = "none";
    summary.textContent = "";
    return;
  }

  const diff = diffLines(a, b);
  const added = diff.filter((d) => d.type === "add").length;
  const removed = diff.filter((d) => d.type === "del").length;

  output.innerHTML = "";
  output.style.display = "block";
  for (const entry of diff) {
    const line = document.createElement("div");
    line.className = "diff-line " + (entry.type === "same" ? "" : entry.type);
    const prefix = entry.type === "add" ? "+ " : entry.type === "del" ? "- " : "  ";
    line.textContent = prefix + entry.text;
    output.appendChild(line);
  }

  summary.textContent =
    added || removed ? `+${added} added, −${removed} removed` : "Texts are identical";
}

leftInput.addEventListener("input", update);
rightInput.addEventListener("input", update);
leftInput.focus();
