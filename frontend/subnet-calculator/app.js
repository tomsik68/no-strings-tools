const input = document.getElementById("input");
const errorEl = document.getElementById("error");
const resultsEl = document.getElementById("results");

const fields = ["Netmask", "Wildcard", "Network", "Broadcast", "First host", "Last host", "Usable hosts"];
const outputs = {};
for (const name of fields) {
  const box = document.createElement("div");
  box.className = "subnet-box";
  const label = document.createElement("div");
  label.className = "subnet-label";
  label.textContent = name;
  const value = document.createElement("div");
  value.className = "subnet-value";
  box.append(label, value);
  resultsEl.appendChild(box);
  outputs[name] = value;
}

const toStr = (n) => [(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255].join(".");

function calculate() {
  const m = input.value.trim().match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})\/(\d{1,2})$/);
  const octets = m ? m.slice(1, 5).map(Number) : [];
  const prefix = m ? Number(m[5]) : -1;

  if (!m || octets.some((o) => o > 255) || prefix > 32) {
    errorEl.textContent = "Enter a valid CIDR, e.g. 192.168.1.10/24";
    errorEl.style.display = "block";
    resultsEl.style.display = "none";
    return;
  }
  errorEl.style.display = "none";
  resultsEl.style.display = "grid";

  const ip = ((octets[0] << 24) | (octets[1] << 16) | (octets[2] << 8) | octets[3]) >>> 0;
  const mask = prefix === 0 ? 0 : (~0 << (32 - prefix)) >>> 0;
  const network = (ip & mask) >>> 0;
  const broadcast = (network | (~mask >>> 0)) >>> 0;

  outputs["Netmask"].textContent = toStr(mask);
  outputs["Wildcard"].textContent = toStr(~mask >>> 0);
  outputs["Network"].textContent = toStr(network) + "/" + prefix;
  outputs["Broadcast"].textContent = toStr(broadcast);

  if (prefix >= 31) {
    // /31 point-to-point and /32 host route have no network/broadcast split
    outputs["First host"].textContent = toStr(network);
    outputs["Last host"].textContent = toStr(broadcast);
    outputs["Usable hosts"].textContent = prefix === 31 ? "2" : "1";
  } else {
    outputs["First host"].textContent = toStr(network + 1);
    outputs["Last host"].textContent = toStr(broadcast - 1);
    outputs["Usable hosts"].textContent = (2 ** (32 - prefix) - 2).toLocaleString();
  }
}

input.addEventListener("input", calculate);
input.focus();
input.select();
calculate();
