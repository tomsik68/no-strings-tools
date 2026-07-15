const canvas = document.getElementById("area");
const countEl = document.getElementById("count");
const maxEl = document.getElementById("max");
const ctx = canvas.getContext("2d");

const pointers = new Map();
let maxSeen = 0;

function resize() {
  const rect = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  draw();
}

function draw() {
  const rect = canvas.getBoundingClientRect();
  ctx.clearRect(0, 0, rect.width, rect.height);
  for (const [id, p] of pointers) {
    const color = `hsl(${(id * 57) % 360} 70% 45%)`;
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 3;

    ctx.beginPath();
    ctx.arc(p.x, p.y, 36, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(p.x - 48, p.y);
    ctx.lineTo(p.x + 48, p.y);
    ctx.moveTo(p.x, p.y - 48);
    ctx.lineTo(p.x, p.y + 48);
    ctx.stroke();

    ctx.font = "13px monospace";
    ctx.fillText(`#${id}  ${Math.round(p.x)}, ${Math.round(p.y)}`, p.x + 44, p.y - 44);
  }
  countEl.textContent = pointers.size;
  maxEl.textContent = maxSeen;
}

function position(e) {
  const rect = canvas.getBoundingClientRect();
  return { x: e.clientX - rect.left, y: e.clientY - rect.top };
}

canvas.addEventListener("pointerdown", (e) => {
  e.preventDefault();
  pointers.set(e.pointerId, position(e));
  maxSeen = Math.max(maxSeen, pointers.size);
  draw();
});

canvas.addEventListener("pointermove", (e) => {
  if (!pointers.has(e.pointerId)) return;
  pointers.set(e.pointerId, position(e));
  draw();
});

for (const type of ["pointerup", "pointercancel", "pointerleave"]) {
  canvas.addEventListener(type, (e) => {
    pointers.delete(e.pointerId);
    draw();
  });
}

window.addEventListener("resize", resize);
resize();
