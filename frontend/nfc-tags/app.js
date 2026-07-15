const scanBtn = document.getElementById("scan-btn");
const recordsEl = document.getElementById("records");
const writeInput = document.getElementById("write-input");
const writeBtn = document.getElementById("write-btn");
const statusEl = document.getElementById("status");

let scanning = false;

function showStatus(message, ok) {
  statusEl.textContent = message;
  statusEl.className = ok ? "status-ok" : "status-err";
  statusEl.style.display = "block";
}

function decodeRecord(record) {
  if (record.recordType === "text") {
    return new TextDecoder(record.encoding || "utf-8").decode(record.data);
  }
  if (record.recordType === "url" || record.recordType === "absolute-url") {
    return new TextDecoder().decode(record.data);
  }
  return `(${record.recordType}, ${record.data ? record.data.byteLength : 0} bytes)`;
}

function showReading(event) {
  navigator.vibrate?.(60);
  for (const record of event.message.records) {
    const div = document.createElement("div");
    div.className = "record";
    const meta = document.createElement("div");
    meta.className = "meta";
    meta.textContent = `${record.recordType} · tag ${event.serialNumber || "?"} · ${new Date().toLocaleTimeString()}`;
    const body = document.createElement("div");
    body.textContent = decodeRecord(record);
    div.append(meta, body);
    recordsEl.prepend(div);
  }
  if (!event.message.records.length) {
    const div = document.createElement("div");
    div.className = "record";
    div.textContent = `Empty tag (${event.serialNumber || "no serial"})`;
    recordsEl.prepend(div);
  }
}

scanBtn.addEventListener("click", async () => {
  if (scanning) return;
  try {
    const reader = new NDEFReader();
    await reader.scan();
    reader.onreading = showReading;
    scanning = true;
    scanBtn.textContent = "📡 Reading — hold a tag to your phone…";
    scanBtn.disabled = true;
    statusEl.style.display = "none";
  } catch (err) {
    showStatus(err.name === "NotAllowedError" ? "NFC permission was denied" : "Couldn't start NFC — is it enabled in your phone's settings?", false);
  }
});

writeBtn.addEventListener("click", async () => {
  const text = writeInput.value.trim();
  if (!text) {
    writeInput.focus();
    return showStatus("Type something to write first", false);
  }
  showStatus("Hold a tag to the back of your phone…", true);
  writeBtn.disabled = true;
  try {
    const isUrl = /^https?:\/\//i.test(text);
    await new NDEFReader().write(isUrl ? { records: [{ recordType: "url", data: text }] } : text);
    navigator.vibrate?.(60);
    showStatus(`Written to the tag as ${isUrl ? "a URL" : "text"} ✓`, true);
  } catch (err) {
    showStatus(err.name === "NotAllowedError" ? "NFC permission was denied" : "Writing failed — tag may be read-only or too small", false);
  } finally {
    writeBtn.disabled = false;
  }
});

if (!("NDEFReader" in window)) {
  scanBtn.disabled = true;
  writeBtn.disabled = true;
  showStatus("Web NFC isn't supported here — it needs Chrome on Android with NFC hardware", false);
}
