const canvas = document.getElementById("pad");
const undoBtn = document.getElementById("undo-btn");
const clearBtn = document.getElementById("clear-btn");
const downloadBtn = document.getElementById("download-btn");
const ctx = canvas.getContext("2d");

const strokes = [];
let current = null;

function resize() {
  const rect = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.lineWidth = 3;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.strokeStyle = "#222";
  redraw();
}

function redraw() {
  const rect = canvas.getBoundingClientRect();
  ctx.clearRect(0, 0, rect.width, rect.height);
  for (const stroke of strokes) {
    ctx.beginPath();
    ctx.moveTo(stroke[0][0], stroke[0][1]);
    for (const [x, y] of stroke) ctx.lineTo(x, y);
    ctx.stroke();
  }
}

function point(e) {
  const rect = canvas.getBoundingClientRect();
  return [e.clientX - rect.left, e.clientY - rect.top];
}

canvas.addEventListener("pointerdown", (e) => {
  e.preventDefault();
  canvas.setPointerCapture(e.pointerId);
  current = [point(e)];
  strokes.push(current);
});

canvas.addEventListener("pointermove", (e) => {
  if (!current) return;
  current.push(point(e));
  const [a, b] = current.slice(-2);
  ctx.beginPath();
  ctx.moveTo(a[0], a[1]);
  ctx.lineTo(b[0], b[1]);
  ctx.stroke();
});

const endStroke = () => {
  current = null;
};
canvas.addEventListener("pointerup", endStroke);
canvas.addEventListener("pointercancel", endStroke);

undoBtn.addEventListener("click", () => {
  strokes.pop();
  redraw();
});

clearBtn.addEventListener("click", () => {
  strokes.length = 0;
  redraw();
});

downloadBtn.addEventListener("click", () => {
  // Flatten onto a white background so the PNG isn't transparent
  const out = document.createElement("canvas");
  out.width = canvas.width;
  out.height = canvas.height;
  const octx = out.getContext("2d");
  octx.fillStyle = "white";
  octx.fillRect(0, 0, out.width, out.height);
  octx.drawImage(canvas, 0, 0);
  out.toBlob((blob) => {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "sketch.png";
    a.click();
    URL.revokeObjectURL(a.href);
  });
});

window.addEventListener("resize", resize);
resize();
