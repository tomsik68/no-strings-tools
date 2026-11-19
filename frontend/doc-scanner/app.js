const $ = (id) => document.getElementById(id);
const video = $("video"), crop = $("crop"), ctx = crop.getContext("2d");
const pages = []; // JPEG data URLs
let photo = null;  // canvas holding the current full-resolution photo
let corners = [];  // [x, y] in photo pixels: TL, TR, BR, BL
let dragging = -1;
const MAX_SIDE = 2000; // longest side of a scanned page, in pixels

// ---- Camera ----
async function startCamera() {
  try {
    video.srcObject = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "environment", width: { ideal: 1920 }, height: { ideal: 1080 } },
    });
  } catch {
    video.hidden = true; $("snap").hidden = true; $("cam-err").hidden = false;
  }
}

function showCrop(source, w, h) {
  photo = document.createElement("canvas");
  const s = Math.min(1, 3000 / Math.max(w, h));
  photo.width = Math.round(w * s); photo.height = Math.round(h * s);
  photo.getContext("2d").drawImage(source, 0, 0, photo.width, photo.height);
  const ix = photo.width * 0.1, iy = photo.height * 0.1;
  corners = [[ix, iy], [photo.width - ix, iy], [photo.width - ix, photo.height - iy], [ix, photo.height - iy]];
  crop.width = photo.width; crop.height = photo.height;
  $("camera-step").hidden = true; $("crop-step").hidden = false;
  drawCrop(); $("add").focus();
}

$("snap").addEventListener("click", () => {
  if (!video.videoWidth) return;
  showCrop(video, video.videoWidth, video.videoHeight);
});

$("file").addEventListener("change", (e) => {
  const f = e.target.files[0]; if (!f) return;
  const img = new Image();
  img.onload = () => { showCrop(img, img.naturalWidth, img.naturalHeight); URL.revokeObjectURL(img.src); };
  img.onerror = () => { $("status").textContent = "That file isn't an image we can read."; };
  img.src = URL.createObjectURL(f);
  e.target.value = "";
});

$("retake").addEventListener("click", backToCamera);
function backToCamera() {
  $("crop-step").hidden = true; $("camera-step").hidden = false;
  (video.hidden ? $("file").parentElement : $("snap")).focus();
}

// ---- Corner editing ----
function drawCrop() {
  ctx.drawImage(photo, 0, 0);
  const r = Math.max(photo.width, photo.height) / 60;
  ctx.lineWidth = r / 3; ctx.strokeStyle = "#2196F3"; ctx.fillStyle = "rgba(33,150,243,.35)";
  ctx.beginPath(); corners.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.closePath();
  ctx.stroke();
  corners.forEach(([x, y]) => { ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); });
}

function toPhoto(e) {
  const b = crop.getBoundingClientRect();
  return [(e.clientX - b.left) * crop.width / b.width, (e.clientY - b.top) * crop.height / b.height];
}

crop.addEventListener("pointerdown", (e) => {
  const [x, y] = toPhoto(e);
  let best = -1, bestD = Infinity;
  corners.forEach(([cx, cy], i) => { const d = Math.hypot(cx - x, cy - y); if (d < bestD) { bestD = d; best = i; } });
  dragging = best; corners[dragging] = [x, y];
  crop.setPointerCapture(e.pointerId); drawCrop();
});
crop.addEventListener("pointermove", (e) => {
  if (dragging < 0) return;
  const [x, y] = toPhoto(e);
  corners[dragging] = [Math.max(0, Math.min(crop.width, x)), Math.max(0, Math.min(crop.height, y))];
  drawCrop();
});
crop.addEventListener("pointerup", () => { dragging = -1; });

// ---- Perspective warp + clean-up ----
// Solve the 3x3 homography mapping the unit square's corners to the quad.
function homography(q) {
  const src = [[0, 0], [1, 0], [1, 1], [0, 1]], A = [], b = [];
  for (let i = 0; i < 4; i++) {
    const [x, y] = src[i], [u, v] = q[i];
    A.push([x, y, 1, 0, 0, 0, -u * x, -u * y]); b.push(u);
    A.push([0, 0, 0, x, y, 1, -v * x, -v * y]); b.push(v);
  }
  for (let c = 0; c < 8; c++) { // Gaussian elimination with partial pivoting
    let p = c;
    for (let r = c + 1; r < 8; r++) if (Math.abs(A[r][c]) > Math.abs(A[p][c])) p = r;
    [A[c], A[p]] = [A[p], A[c]]; [b[c], b[p]] = [b[p], b[c]];
    for (let r = 0; r < 8; r++) {
      if (r === c) continue;
      const f = A[r][c] / A[c][c];
      for (let k = c; k < 8; k++) A[r][k] -= f * A[c][k];
      b[r] -= f * b[c];
    }
  }
  return b.map((v, i) => v / A[i][i]);
}

function scanPage() {
  const [tl, tr, br, bl] = corners, d = (a, c) => Math.hypot(a[0] - c[0], a[1] - c[1]);
  let w = Math.max(d(tl, tr), d(bl, br)), h = Math.max(d(tl, bl), d(tr, br));
  const s = Math.min(1, MAX_SIDE / Math.max(w, h));
  w = Math.round(w * s); h = Math.round(h * s);
  if (w < 20 || h < 20) return null;
  const [a, b, c, e, f, g, i, j] = homography(corners);
  const src = photo.getContext("2d").getImageData(0, 0, photo.width, photo.height).data;
  const out = document.createElement("canvas"); out.width = w; out.height = h;
  const oc = out.getContext("2d"), img = oc.createImageData(w, h), px = img.data;
  const gray = new Float32Array(w * h), hist = new Uint32Array(256);
  for (let y = 0; y < h; y++) {
    const ny = (y + 0.5) / h;
    for (let x = 0; x < w; x++) {
      const nx = (x + 0.5) / w, z = i * nx + j * ny + 1;
      const sx = Math.min(photo.width - 1, Math.max(0, Math.round((a * nx + b * ny + c) / z)));
      const sy = Math.min(photo.height - 1, Math.max(0, Math.round((e * nx + f * ny + g) / z)));
      const k = (sy * photo.width + sx) * 4;
      const l = 0.299 * src[k] + 0.587 * src[k + 1] + 0.114 * src[k + 2];
      gray[y * w + x] = l; hist[l | 0]++;
    }
  }
  // Stretch levels so ink goes dark and paper goes white.
  const pct = (p) => { let n = 0, t = p * w * h; for (let v = 0; v < 256; v++) if ((n += hist[v]) >= t) return v; return 255; };
  const lo = pct(0.02), hi = Math.max(lo + 1, pct(0.6));
  for (let n = 0; n < w * h; n++) {
    const v = Math.max(0, Math.min(255, ((gray[n] - lo) / (hi - lo)) * 255));
    px[n * 4] = px[n * 4 + 1] = px[n * 4 + 2] = v; px[n * 4 + 3] = 255;
  }
  oc.putImageData(img, 0, 0);
  return out.toDataURL("image/jpeg", 0.85);
}

$("add").addEventListener("click", () => {
  $("status").textContent = "Processing…";
  setTimeout(() => { // let the status paint before the heavy loop
    const page = scanPage();
    if (!page) { $("status").textContent = "That selection is too small. Spread the corners around the page."; return; }
    pages.push(page);
    renderPages(); $("status").textContent = `Page ${pages.length} added.`;
    backToCamera();
  }, 20);
});

// ---- Page list + PDF ----
function renderPages() {
  $("count").textContent = `(${pages.length})`;
  $("pdf").disabled = !pages.length;
  $("pages").innerHTML = pages.map((src, n) =>
    `<div class="page" data-i="${n}"><img src="${src}" alt="Page ${n + 1}. Drag or use arrow keys to reorder." tabindex="0" draggable="false" /><button class="w3-button w3-red w3-tiny w3-round" data-n="${n}" aria-label="Remove page ${n + 1}">×</button></div>`
  ).join("");
}
$("pages").addEventListener("click", (e) => {
  const n = e.target.dataset.n; if (n === undefined) return;
  pages.splice(+n, 1); renderPages();
});

// ---- Reorder: drag a thumbnail (mouse or touch), or arrow keys on a focused one ----
function movePage(from, to) {
  if (to < 0 || to >= pages.length || to === from) return false;
  pages.splice(to, 0, pages.splice(from, 1)[0]);
  renderPages(); $("status").textContent = `Moved page ${from + 1} to position ${to + 1}.`;
  return true;
}
let dragFrom = -1, dropTo = -1;
const pageAt = (x, y) => document.elementFromPoint(x, y)?.closest("#pages .page");
$("pages").addEventListener("pointerdown", (e) => {
  if (e.target.tagName !== "IMG") return;
  dragFrom = +e.target.parentElement.dataset.i; dropTo = dragFrom;
  e.target.parentElement.classList.add("dragging");
  $("pages").setPointerCapture(e.pointerId);
});
$("pages").addEventListener("pointermove", (e) => {
  if (dragFrom < 0) return;
  const el = pageAt(e.clientX, e.clientY); if (!el) return;
  dropTo = +el.dataset.i;
  document.querySelectorAll("#pages .page").forEach((p) => p.classList.toggle("drop", p === el && dropTo !== dragFrom));
});
const endDrag = () => {
  if (dragFrom < 0) return;
  const [from, to] = [dragFrom, dropTo]; dragFrom = -1;
  if (!movePage(from, to)) renderPages();
};
$("pages").addEventListener("pointerup", endDrag);
$("pages").addEventListener("pointercancel", endDrag);
$("pages").addEventListener("keydown", (e) => {
  if (e.target.tagName !== "IMG" || !["ArrowLeft", "ArrowRight"].includes(e.key)) return;
  e.preventDefault();
  const from = +e.target.parentElement.dataset.i, to = from + (e.key === "ArrowLeft" ? -1 : 1);
  if (movePage(from, to)) $("pages").children[to].querySelector("img").focus();
});

$("pdf").addEventListener("click", async () => {
  if (!window.PDFLib) { $("status").textContent = "PDF library didn't load. Connect once to cache it, then try again."; return; }
  const doc = await PDFLib.PDFDocument.create();
  const A4 = [595.28, 841.89];
  for (const src of pages) {
    const jpg = await doc.embedJpg(src);
    const landscape = jpg.width > jpg.height;
    const [pw, ph] = landscape ? [A4[1], A4[0]] : A4;
    const s = Math.min(pw / jpg.width, ph / jpg.height);
    const page = doc.addPage([pw, ph]);
    page.drawImage(jpg, { x: (pw - jpg.width * s) / 2, y: (ph - jpg.height * s) / 2, width: jpg.width * s, height: jpg.height * s });
  }
  const blob = new Blob([await doc.save()], { type: "application/pdf" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob); a.download = `scan-${new Date().toISOString().slice(0, 10)}.pdf`;
  a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  $("status").textContent = `Saved ${pages.length}-page PDF.`;
});

// Keyboard: Space/Enter captures on the camera step (when not on another control).
document.addEventListener("keydown", (e) => {
  if ((e.key === " " || e.key === "Enter") && !$("camera-step").hidden && !e.target.closest("button, label, input")) {
    e.preventDefault(); $("snap").click();
  }
});

startCamera();
$("snap").focus();
