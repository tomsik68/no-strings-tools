const PREFIXES = [
  "alpha", "beta", "gamma", "delta", "nova", "orion", "sirius", "luna", "solar", "terra",
  "aqua", "flame", "wind", "rock", "pulse", "spark", "echo", "node", "mesh", "link",
  "comet", "nebula", "quasar", "vortex", "zenith", "apex", "cypher", "pixel", "nexus", "flux"
];
const SUFFIXES = [
  "net", "wifi", "hub", "zone", "link", "core", "grid", "wave", "beam", "port",
  "base", "node", "cloud", "signal", "stream", "orbit", "ring", "band", "spot", "lane"
];

const ssidEl = document.getElementById("ssid");
const generateBtn = document.getElementById("generate-btn");
const copyBtn = document.getElementById("copy-btn");
const feedbackEl = document.getElementById("feedback");
const historyEl = document.getElementById("history");
const includeNumbers = document.getElementById("include-numbers");
const includeHyphens = document.getElementById("include-hyphens");

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomDigits(count) {
  let s = "";
  for (let i = 0; i < count; i++) s += Math.floor(Math.random() * 10);
  return s;
}

function generate() {
  let prefix = randomItem(PREFIXES);
  let suffix = randomItem(SUFFIXES);
  // Avoid same word twice
  if (prefix === suffix) suffix = randomItem(SUFFIXES);
  const sep = includeHyphens.checked ? "-" : "";
  let ssid = prefix + sep + suffix;
  if (includeNumbers.checked) ssid += sep + randomDigits(2 + Math.floor(Math.random() * 2));
  ssidEl.textContent = ssid;
  addToHistory(ssid);
  feedbackEl.textContent = "";
  return ssid;
}

function addToHistory(ssid) {
  const item = document.createElement("div");
  item.className = "history-item";
  const span = document.createElement("span");
  span.textContent = ssid;
  const btn = document.createElement("button");
  btn.className = "w3-button w3-blue w3-round copy-btn-small";
  btn.textContent = "Copy";
  btn.addEventListener("click", () => copyText(ssid, "Copied"));
  item.appendChild(span);
  item.appendChild(btn);
  historyEl.prepend(item);
  while (historyEl.children.length > 10) {
    historyEl.lastChild.remove();
  }
}

async function copyText(text, msg) {
  try {
    await navigator.clipboard.writeText(text);
    feedbackEl.textContent = msg;
    setTimeout(() => feedbackEl.textContent = "", 1500);
  } catch (e) {
    feedbackEl.textContent = "Could not copy";
  }
}

generateBtn.addEventListener("click", generate);
copyBtn.addEventListener("click", () => {
  const ssid = ssidEl.textContent;
  if (ssid && ssid !== "—") copyText(ssid, "Copied SSID");
});
includeNumbers.addEventListener("change", generate);
includeHyphens.addEventListener("change", generate);

generate();
