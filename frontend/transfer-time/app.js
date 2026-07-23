const $ = (id) => document.getElementById(id);

function fmtDuration(sec) {
  if (!Number.isFinite(sec) || sec < 0) return "—";
  if (sec < 1) return "< 1 second";
  if (sec < 60) return Math.round(sec) + " seconds";
  if (sec < 3600) {
    const m = Math.floor(sec / 60);
    const s = Math.round(sec % 60);
    return `${m} min ${s}s`;
  }
  if (sec < 86400) {
    const h = Math.floor(sec / 3600);
    const m = Math.round((sec % 3600) / 60);
    return `${h} h ${m} min`;
  }
  const d = Math.floor(sec / 86400);
  const h = Math.round((sec % 86400) / 3600);
  return `${d} day${d !== 1 ? "s" : ""} ${h} h`;
}

function sizeBytes() {
  const v = parseFloat($("size").value) || 0;
  const u = $("size-unit").value;
  if (u === "KB") return v * 1e3;
  if (u === "MB") return v * 1e6;
  if (u === "GB") return v * 1e9;
  if (u === "TB") return v * 1e12;
  return v * 1e9;
}

function bitsPerSecond() {
  const v = parseFloat($("speed").value) || 0;
  const u = $("speed-unit").value;
  if (u === "mbps") return v * 1e6;
  if (u === "gbps") return v * 1e9;
  if (u === "kbps") return v * 1e3;
  if (u === "MBps") return v * 8e6;
  return v * 1e6;
}

function update() {
  const bytes = sizeBytes();
  const bps = bitsPerSecond();
  if (!(bytes > 0 && bps > 0)) {
    $("out").innerHTML = '<span class="w3-text-grey">Enter size and speed.</span>';
    return;
  }
  const sec = (bytes * 8) / bps;
  const MBps = bps / 8e6;
  $("out").innerHTML = `
    <div class="w3-text-grey w3-small">Estimated time</div>
    <div style="font-size:28px;font-weight:700;">${fmtDuration(sec)}</div>
    <div class="w3-text-grey w3-small w3-margin-top">Effective ≈ ${MBps >= 1 ? MBps.toFixed(1) + " MB/s" : (MBps * 1000).toFixed(0) + " KB/s"}</div>`;
}

// Ensure select values match JS
$("size-unit").innerHTML = `
  <option value="MB">MB</option>
  <option value="GB" selected>GB</option>
  <option value="TB">TB</option>
  <option value="KB">KB</option>`;
$("speed-unit").innerHTML = `
  <option value="mbps" selected>Mbps (megabits)</option>
  <option value="MBps">MB/s (megabytes)</option>
  <option value="gbps">Gbps</option>
  <option value="kbps">Kbps</option>`;

["size", "size-unit", "speed", "speed-unit"].forEach((id) => $(id).addEventListener("input", update));
$("size").focus();
update();
