const input = document.getElementById("input");
const output = document.getElementById("output");
const errorEl = document.getElementById("error");

function showError(message) {
  errorEl.textContent = message;
  errorEl.style.display = message ? "block" : "none";
}

function parseCSV(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += c;
      }
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ",") {
      row.push(field);
      field = "";
    } else if (c === "\n") {
      row.push(field);
      field = "";
      rows.push(row);
      row = [];
    } else if (c !== "\r") {
      field += c;
    }
  }
  if (field !== "" || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

function csvField(value) {
  const s = value === null || value === undefined ? "" : String(value);
  return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
}

document.getElementById("csv-to-json").addEventListener("click", () => {
  const rows = parseCSV(input.value.trim());
  if (rows.length < 2) {
    showError("Need a header row plus at least one data row");
    return;
  }
  showError("");
  const headers = rows[0];
  const objects = rows.slice(1).map((row) =>
    Object.fromEntries(headers.map((h, i) => [h, row[i] ?? ""]))
  );
  output.value = JSON.stringify(objects, null, 2);
});

document.getElementById("json-to-csv").addEventListener("click", () => {
  let data;
  try {
    data = JSON.parse(input.value);
  } catch {
    showError("That isn't valid JSON");
    return;
  }
  if (!Array.isArray(data) || data.length === 0 || typeof data[0] !== "object") {
    showError("Expected a JSON array of objects");
    return;
  }
  showError("");
  const headers = [...new Set(data.flatMap((obj) => Object.keys(obj)))];
  const lines = [headers.map(csvField).join(",")];
  for (const obj of data) {
    lines.push(headers.map((h) => csvField(obj[h])).join(","));
  }
  output.value = lines.join("\n");
});

input.focus();
