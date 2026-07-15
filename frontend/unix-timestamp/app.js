const timestampInput = document.getElementById("timestamp-input");
const timestampResult = document.getElementById("timestamp-result");
const datetimeInput = document.getElementById("datetime-input");
const timezoneSelect = document.getElementById("timezone-select");
const datetimeResult = document.getElementById("datetime-result");
const nowTimestamp = document.getElementById("now-timestamp");

function updateTimestampToDate() {
  const value = timestampInput.value.trim();
  if (!value) {
    timestampResult.textContent = "--";
    return;
  }

  let timestamp = parseInt(value);
  if (isNaN(timestamp)) {
    timestampResult.textContent = "Invalid timestamp";
    return;
  }

  // Detect if milliseconds (too large for seconds)
  if (timestamp > 100000000000) {
    timestamp = Math.floor(timestamp / 1000);
  }

  const date = new Date(timestamp * 1000);
  const iso = date.toISOString();
  const local = date.toLocaleString();

  timestampResult.innerHTML = `
    <div><strong>ISO:</strong> ${iso}</div>
    <div><strong>Local:</strong> ${local}</div>
    <div><strong>Unix:</strong> ${timestamp}s</div>
  `;
}

function updateDateToTimestamp() {
  const value = datetimeInput.value;
  if (!value) {
    datetimeResult.textContent = "--";
    return;
  }

  const date = new Date(value);
  const timestamp = Math.floor(date.getTime() / 1000);
  const ms = date.getTime();

  datetimeResult.innerHTML = `
    <div><strong>Seconds:</strong> ${timestamp}</div>
    <div><strong>Milliseconds:</strong> ${ms}</div>
  `;
}

function updateNow() {
  const now = Math.floor(Date.now() / 1000);
  const ms = Date.now();
  const iso = new Date().toISOString();

  nowTimestamp.innerHTML = `
    <div><strong>Seconds:</strong> ${now}</div>
    <div><strong>Milliseconds:</strong> ${ms}</div>
    <div><strong>ISO:</strong> ${iso}</div>
  `;
}

// Set current datetime in input
const now = new Date();
const year = now.getFullYear();
const month = String(now.getMonth() + 1).padStart(2, "0");
const day = String(now.getDate()).padStart(2, "0");
const hours = String(now.getHours()).padStart(2, "0");
const minutes = String(now.getMinutes()).padStart(2, "0");
datetimeInput.value = `${year}-${month}-${day}T${hours}:${minutes}`;

timestampInput.addEventListener("input", updateTimestampToDate);
datetimeInput.addEventListener("input", updateDateToTimestamp);
timezoneSelect.addEventListener("change", updateDateToTimestamp);

updateTimestampToDate();
updateDateToTimestamp();
updateNow();

// Update "now" every second
setInterval(updateNow, 1000);
