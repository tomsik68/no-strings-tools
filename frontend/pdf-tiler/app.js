pdfjsLib.GlobalWorkerOptions.workerSrc =
  'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js';

const SCALE = 4; // render at 4× (~288 DPI)
const PREVIEW_W = 240;

// Output paper sizes: wPt/hPt in portrait PDF points, used for output canvas + PDF page
const OUTPUT_SIZES = {
  A3:     { wPt: 841.89, hPt: 1190.55 },
  A4:     { wPt: 595.28, hPt:  841.89 },
  A5:     { wPt: 419.53, hPt:  595.28 },
  Letter: { wPt: 612,    hPt:  792    },
  Legal:  { wPt: 612,    hPt: 1008    },
};

let cropCanvas = null;
let currentFilename = 'tiled.pdf';
let currentGap = 0;

// --- State ---

function showState(id) {
  ['state-drop', 'state-processing', 'state-result', 'state-error'].forEach(s => {
    document.getElementById(s).hidden = s !== id;
  });
}

// --- Paper size helpers ---

// Detect which known paper size the input PDF matches (within 8pt tolerance).
// Works for both portrait and landscape input since we normalise to portrait before comparing.
function detectInputSize(wPt, hPt) {
  const pw = Math.min(wPt, hPt);
  const ph = Math.max(wPt, hPt);
  for (const [name, s] of Object.entries(OUTPUT_SIZES)) {
    if (Math.abs(pw - s.wPt) < 8 && Math.abs(ph - s.hPt) < 8) return name;
  }
  return 'A4';
}

function getOutputPx() {
  const name = document.getElementById('paper-size-select').value;
  const s = OUTPUT_SIZES[name] || OUTPUT_SIZES.A4;
  return { w: Math.round(s.wPt * SCALE), h: Math.round(s.hPt * SCALE), wPt: s.wPt, hPt: s.hPt };
}

// --- Tile layout ---
// Returns { cols, rows, cellW, cellH, scaled }.
// If the crop is bigger than the output page, returns 1 copy scaled to fit.

function getTileLayout() {
  const { w: outW, h: outH } = getOutputPx();
  const cropW = cropCanvas.width;
  const cropH = cropCanvas.height;
  const gap = currentGap;

  if (cropW > outW || cropH > outH) {
    const sc = Math.min(outW / cropW, outH / cropH);
    return { cols: 1, rows: 1, cellW: Math.round(cropW * sc), cellH: Math.round(cropH * sc), scaled: true };
  }

  const cols = Math.max(1, Math.floor((outW + gap) / (cropW + gap)));
  const rows = Math.max(1, Math.floor((outH + gap) / (cropH + gap)));
  return { cols, rows, cellW: cropW, cellH: cropH, scaled: false };
}

// --- Crop detection ---
// Finds the bounding box of non-white pixels (grayscale < 240).

function detectCrop(canvas) {
  const { width, height } = canvas;
  const data = canvas.getContext('2d').getImageData(0, 0, width, height).data;
  let minX = width, maxX = -1, minY = height, maxY = -1;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      if (gray < 240) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  if (maxX === -1) return { x: 0, y: 0, w: width, h: height };

  const pad = 12;
  const x  = Math.max(0, minX - pad);
  const y  = Math.max(0, minY - pad);
  const x2 = Math.min(width  - 1, maxX + pad);
  const y2 = Math.min(height - 1, maxY + pad);
  return { x, y, w: x2 - x + 1, h: y2 - y + 1 };
}

// --- Preview ---

function renderPreview() {
  if (!cropCanvas) return;
  const { w: outW, h: outH } = getOutputPx();
  const { cols, rows, cellW, cellH, scaled } = getTileLayout();

  const preview = document.getElementById('preview-canvas');
  const sc = PREVIEW_W / outW;
  preview.width  = PREVIEW_W;
  preview.height = Math.round(outH * sc);
  const ctx = preview.getContext('2d');
  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, preview.width, preview.height);

  const cw = Math.round(cellW * sc);
  const ch = Math.round(cellH * sc);
  const g  = Math.round(currentGap * sc);

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      ctx.drawImage(cropCanvas, c * (cw + g), r * (ch + g), cw, ch);
    }
  }

  const n = cols * rows;
  const info = document.getElementById('grid-info');
  if (scaled) {
    info.innerHTML = `<strong>1 copy per page</strong> &nbsp;—&nbsp; scaled to fit`;
  } else {
    info.innerHTML =
      `<strong>${n} cop${n === 1 ? 'y' : 'ies'} per page</strong> &nbsp;—&nbsp; ` +
      `${cols} col${cols > 1 ? 's' : ''} × ${rows} row${rows > 1 ? 's' : ''}`;
  }
}

// --- Process PDF ---

async function processPDF(file) {
  currentFilename = file.name.replace(/\.pdf$/i, '') + '_tiled.pdf';
  showState('state-processing');

  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf  = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const page = await pdf.getPage(1);

    // Detect paper size from unscaled viewport (dimensions are in PDF points at scale=1)
    const vp1 = page.getViewport({ scale: 1 });
    document.getElementById('paper-size-select').value = detectInputSize(vp1.width, vp1.height);

    // Render page at high resolution
    const viewport = page.getViewport({ scale: SCALE });
    const rendered = document.createElement('canvas');
    rendered.width  = Math.round(viewport.width);
    rendered.height = Math.round(viewport.height);
    const ctx = rendered.getContext('2d');
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, rendered.width, rendered.height);
    await page.render({ canvasContext: ctx, viewport }).promise;

    // Auto-crop whitespace
    const crop = detectCrop(rendered);
    cropCanvas = document.createElement('canvas');
    cropCanvas.width  = crop.w;
    cropCanvas.height = crop.h;
    const cc = cropCanvas.getContext('2d');
    cc.fillStyle = 'white';
    cc.fillRect(0, 0, crop.w, crop.h);
    cc.drawImage(rendered, crop.x, crop.y, crop.w, crop.h, 0, 0, crop.w, crop.h);

    showState('state-result');
    renderPreview();
  } catch (err) {
    console.error(err);
    document.getElementById('error-msg').textContent =
      err?.message || 'The file may be password-protected or corrupted.';
    showState('state-error');
  }
}

// --- Download ---

function canvasToBlob(canvas, type, quality) {
  return new Promise(resolve => canvas.toBlob(resolve, type, quality));
}

async function downloadTiled() {
  const btn = document.getElementById('download-btn');
  btn.disabled = true;
  btn.textContent = 'Creating PDF…';

  try {
    const { w: outW, h: outH, wPt, hPt } = getOutputPx();
    const { cols, rows, cellW, cellH } = getTileLayout();
    const gap = currentGap;

    const out = document.createElement('canvas');
    out.width  = outW;
    out.height = outH;
    const ctx = out.getContext('2d');
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, outW, outH);

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        ctx.drawImage(cropCanvas, c * (cellW + gap), r * (cellH + gap), cellW, cellH);
      }
    }

    const { PDFDocument } = PDFLib;
    const pdfDoc  = await PDFDocument.create();
    const pdfPage = pdfDoc.addPage([wPt, hPt]);

    const blob    = await canvasToBlob(out, 'image/jpeg', 0.95);
    const jpgBytes = new Uint8Array(await blob.arrayBuffer());
    const jpgImg  = await pdfDoc.embedJpg(jpgBytes);
    pdfPage.drawImage(jpgImg, { x: 0, y: 0, width: wPt, height: hPt });

    const pdfBytes = await pdfDoc.save();
    const url = URL.createObjectURL(new Blob([pdfBytes], { type: 'application/pdf' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = currentFilename;
    a.click();
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error(err);
    alert('Error creating PDF: ' + (err?.message || err));
  } finally {
    btn.disabled = false;
    btn.textContent = '⬇ Download tiled PDF';
  }
}

// --- Events ---

const fileInput = document.getElementById('file-input');
const dropZone  = document.getElementById('drop-zone');

fileInput.addEventListener('change', () => {
  if (fileInput.files[0]) processPDF(fileInput.files[0]);
});

dropZone.addEventListener('click', () => fileInput.click());
dropZone.addEventListener('dragover', e => { e.preventDefault(); dropZone.classList.add('drag-over'); });
dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'));
dropZone.addEventListener('drop', e => {
  e.preventDefault();
  dropZone.classList.remove('drag-over');
  const file = e.dataTransfer.files[0];
  if (file?.type === 'application/pdf' || file?.name?.endsWith('.pdf')) processPDF(file);
});

document.getElementById('paper-size-select').addEventListener('change', renderPreview);

document.querySelectorAll('.margin-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.margin-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentGap = parseInt(btn.dataset.gap);
    renderPreview();
  });
});

document.getElementById('download-btn').addEventListener('click', downloadTiled);

document.getElementById('reset-btn').addEventListener('click', () => {
  cropCanvas = null;
  currentGap = 0;
  fileInput.value = '';
  document.querySelectorAll('.margin-btn').forEach((b, i) => b.classList.toggle('active', i === 0));
  showState('state-drop');
});

document.getElementById('retry-btn').addEventListener('click', () => {
  fileInput.value = '';
  showState('state-drop');
});
