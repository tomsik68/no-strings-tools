const input = document.getElementById("input");
const errorEl = document.getElementById("error");
const resultsEl = document.getElementById("results");
const paramsEl = document.getElementById("params");

const defaultPorts = { "http:": "80", "https:": "443", "ftp:": "21", "ws:": "80", "wss:": "443" };

function parse() {
  const raw = input.value.trim();
  if (!raw) {
    errorEl.style.display = "none";
    resultsEl.style.display = "none";
    return;
  }

  let url;
  try {
    // Be forgiving: assume https:// when the scheme is missing
    url = new URL(/^[a-z][a-z0-9+.-]*:/i.test(raw) ? raw : "https://" + raw);
  } catch {
    errorEl.textContent = "That doesn't look like a valid URL";
    errorEl.style.display = "block";
    resultsEl.style.display = "none";
    return;
  }

  errorEl.style.display = "none";
  resultsEl.style.display = "grid";

  document.getElementById("protocol").textContent = url.protocol.replace(":", "");
  document.getElementById("host").textContent = url.hostname || "—";
  document.getElementById("port").textContent =
    url.port || (defaultPorts[url.protocol] ? defaultPorts[url.protocol] + " (default)" : "—");
  document.getElementById("path").textContent = decodeURIComponent(url.pathname);
  document.getElementById("hash").textContent = url.hash ? decodeURIComponent(url.hash.slice(1)) : "—";

  paramsEl.innerHTML = "";
  const entries = [...url.searchParams.entries()];
  if (entries.length === 0) {
    paramsEl.textContent = "—";
    paramsEl.className = "part-value";
    return;
  }
  paramsEl.className = "";
  for (const [key, value] of entries) {
    const row = document.createElement("div");
    row.className = "param-row";
    const k = document.createElement("div");
    k.className = "part-value";
    k.style.fontWeight = "600";
    k.textContent = key;
    const v = document.createElement("div");
    v.className = "part-value";
    v.textContent = value || "(empty)";
    row.append(k, v);
    paramsEl.appendChild(row);
  }
}

input.addEventListener("input", parse);
input.focus();
parse();
