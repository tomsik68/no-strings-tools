const keyList = document.getElementById("key-list");
const emptyEl = document.getElementById("empty");
const downloadBtn = document.getElementById("download-btn");
const restoreInput = document.getElementById("restore-input");
const statusEl = document.getElementById("status");

const FORMAT = "nostrings-tools-backup";

// A value is embedded as parsed JSON only when re-stringifying it reproduces
// the stored string exactly; anything else stays a raw string. Either way,
// restore is byte-for-byte lossless.
function exportValue(raw) {
  try {
    const parsed = JSON.parse(raw);
    if (typeof parsed === "object" && parsed !== null && JSON.stringify(parsed) === raw) return parsed;
  } catch {}
  return raw;
}

function collect() {
  const entries = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    entries[key] = exportValue(localStorage.getItem(key));
  }
  return entries;
}

function formatSize(chars) {
  return chars < 1024 ? `${chars} B` : `${(chars / 1024).toFixed(1)} kB`;
}

function render() {
  keyList.innerHTML = "";
  const keys = [];
  for (let i = 0; i < localStorage.length; i++) keys.push(localStorage.key(i));
  keys.sort();

  emptyEl.style.display = keys.length ? "none" : "block";
  keyList.style.display = keys.length ? "" : "none";
  downloadBtn.disabled = !keys.length;

  for (const key of keys) {
    const name = document.createElement("span");
    name.textContent = key;
    const size = document.createElement("span");
    size.className = "w3-text-grey w3-small";
    size.textContent = formatSize(localStorage.getItem(key).length);
    const li = document.createElement("li");
    li.className = "key-row";
    li.append(name, size);
    keyList.appendChild(li);
  }
}

function showStatus(message, ok) {
  statusEl.textContent = message;
  statusEl.className = ok ? "status-ok" : "status-err";
  statusEl.style.display = "block";
}

downloadBtn.addEventListener("click", () => {
  const backup = {
    format: FORMAT,
    version: 1,
    exportedAt: new Date().toISOString(),
    entries: collect(),
  };
  const filename = `nostrings-backup-${backup.exportedAt.slice(0, 10)}.json`;
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
  showStatus(`Saved ${Object.keys(backup.entries).length} entries to ${filename}`, true);
});

restoreInput.addEventListener("change", async () => {
  const file = restoreInput.files[0];
  if (!file) return;
  restoreInput.value = ""; // allow picking the same file again

  let backup;
  try {
    backup = JSON.parse(await file.text());
  } catch {
    return showStatus("That file isn't valid JSON", false);
  }
  if (backup?.format !== FORMAT || typeof backup.entries !== "object" || backup.entries === null) {
    return showStatus("That doesn't look like a No Strings Tools backup", false);
  }

  const keys = Object.keys(backup.entries);
  const overwritten = keys.filter((k) => localStorage.getItem(k) !== null);
  if (overwritten.length && !confirm(`This replaces ${overwritten.length} existing entr${overwritten.length === 1 ? "y" : "ies"}:\n${overwritten.join(", ")}\n\nContinue?`)) {
    return;
  }

  for (const key of keys) {
    const value = backup.entries[key];
    localStorage.setItem(key, typeof value === "string" ? value : JSON.stringify(value));
  }
  render();
  showStatus(`Restored ${keys.length} entries from ${file.name}`, true);
});

render();
