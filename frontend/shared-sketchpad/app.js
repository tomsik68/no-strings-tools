const nameInput = document.getElementById("name-input");
const codeInput = document.getElementById("code-input");
const createBtn = document.getElementById("create-btn");
const joinBtn = document.getElementById("join-btn");
const setupStatus = document.getElementById("setup-status");
const setupCard = document.getElementById("setup-card");
const sketchCard = document.getElementById("sketch-card");
const roomCodeEl = document.getElementById("room-code");
const membersEl = document.getElementById("members");
const roomStatus = document.getElementById("room-status");
const canvas = document.getElementById("pad");
const ctx = canvas.getContext("2d");
const colorInput = document.getElementById("color-input");
const widthInput = document.getElementById("width-input");
const widthVal = document.getElementById("width-val");
const undoBtn = document.getElementById("undo-btn");
const clearBtn = document.getElementById("clear-btn");
const downloadBtn = document.getElementById("download-btn");
const widthField = document.getElementById("width-field");
const heightField = document.getElementById("height-field");
const resizeBtn = document.getElementById("resize-btn");
const maxBtn = document.getElementById("max-btn");
const copyCodeBtn = document.getElementById("copy-code-btn");
const copyLinkBtn = document.getElementById("copy-link-btn");

const ID_PREFIX = "NOSTRINGSSKETCH-";
const ICE_CONFIG = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "turn:openrelay.metered.ca:80", username: "openrelayproject", credential: "openrelayproject" },
    { urls: "turn:openrelay.metered.ca:443", username: "openrelayproject", credential: "openrelayproject" },
    { urls: "turn:openrelay.metered.ca:443?transport=tcp", username: "openrelayproject", credential: "openrelayproject" },
  ],
};
const MAX_WIDTH = 1920, MAX_HEIGHT = 1080, DEFAULT_WIDTH = 640, DEFAULT_HEIGHT = 360;

let peer = null, isHost = false, hostConn = null, guests = new Map(), myName = "";
let strokes = [], currentStroke = null, flushTimer = null;

nameInput.value = localStorage.getItem("shared-sketchpad-name") || "";
nameInput.focus();
widthField.value = DEFAULT_WIDTH;
heightField.value = DEFAULT_HEIGHT;

function showStatus(m, type = "info") {
  setupStatus.textContent = m;
  setupStatus.className = `status ${type}`;
}

function showRoomStatus(m, type = "info") {
  if (!roomStatus) return;
  roomStatus.textContent = m;
  roomStatus.className = `status ${type}`;
  roomStatus.style.display = m ? "block" : "none";
}

if (typeof Peer === "undefined") {
  showStatus("PeerJS failed to load — this app needs a network connection to start (and for peer discovery).", "error");
}

function generateCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

function getName() {
  const name = nameInput.value.trim().substring(0, 20);
  if (!name) { showStatus("Pick a nickname first", "error"); nameInput.focus(); return null; }
  localStorage.setItem("shared-sketchpad-name", name);
  return name;
}

function updateMembers(names) {
  membersEl.textContent = `In room (${names.length}): ${names.join(", ") || "—"}`;
}

function rosterNames() {
  return [myName, ...[...guests.values()].map((g) => g.name)];
}

function showSketch(code) {
  setupCard.style.display = "none";
  sketchCard.style.display = "block";
  roomCodeEl.textContent = code;
  location.hash = code;
  setCanvasSize(DEFAULT_WIDTH, DEFAULT_HEIGHT);
}

function setCanvasSize(w, h) {
  w = Math.max(100, Math.min(MAX_WIDTH, Math.round(w)));
  h = Math.max(100, Math.min(MAX_HEIGHT, Math.round(h)));
  widthField.value = w;
  heightField.value = h;
  const dpr = window.devicePixelRatio || 1;
  canvas.width = w * dpr;
  canvas.height = h * dpr;
  canvas.style.width = `${w}px`;
  canvas.style.height = `${h}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  redraw();
}

function normPoint(e) {
  const rect = canvas.getBoundingClientRect();
  return [
    Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)),
    Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height)),
  ];
}

function pixel([x, y]) {
  const rect = canvas.getBoundingClientRect();
  return [x * rect.width, y * rect.height];
}

function drawSegment(a, b, color, width) {
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.beginPath();
  ctx.moveTo(a[0], a[1]);
  ctx.lineTo(b[0], b[1]);
  ctx.stroke();
}

function drawStroke(stroke) {
  if (stroke.points.length < 2) return;
  ctx.strokeStyle = stroke.color;
  ctx.lineWidth = stroke.width;
  ctx.beginPath();
  const [sx, sy] = pixel(stroke.points[0]);
  ctx.moveTo(sx, sy);
  for (let i = 1; i < stroke.points.length; i++) { const [px, py] = pixel(stroke.points[i]); ctx.lineTo(px, py); }
  ctx.stroke();
}

function redraw() {
  const rect = canvas.getBoundingClientRect();
  ctx.clearRect(0, 0, rect.width, rect.height);
  for (const stroke of strokes) drawStroke(stroke);
}

function applyStrokeSegment(msg) {
  let stroke = strokes.find((s) => s.id === msg.id);
  if (!stroke) {
    stroke = { id: msg.id, owner: msg.from, color: msg.color, width: msg.width, points: [] };
    strokes.push(stroke);
  }
  const prev = stroke.points.length;
  for (const p of msg.points) stroke.points.push(p);
  if (stroke.points.length >= 2 && prev < stroke.points.length) {
    for (let i = Math.max(1, prev); i < stroke.points.length; i++) {
      drawSegment(pixel(stroke.points[i - 1]), pixel(stroke.points[i]), stroke.color, stroke.width);
    }
  }
}

function sendOut(msg) {
  if (isHost) hostBroadcast(msg);
  else if (hostConn && hostConn.open) hostConn.send(msg);
}

function sendBatch(stroke, fromIndex) {
  sendOut({ type: "stroke", id: stroke.id, from: peer.id, color: stroke.color, width: stroke.width, points: stroke.points.slice(fromIndex) });
  stroke.lastSent = stroke.points.length;
}

function flushCurrentStroke() {
  if (currentStroke && currentStroke.points.length > (currentStroke.lastSent || 0)) sendBatch(currentStroke, currentStroke.lastSent || 0);
}

function hostBroadcast(msg, exceptPeerId = null) {
  for (const [id, g] of guests) { if (id !== exceptPeerId && g.conn.open) g.conn.send(msg); }
}

function undoOwnStroke() {
  for (let i = strokes.length - 1; i >= 0; i--) {
    if (strokes[i].owner === peer.id) { strokes.splice(i, 1); redraw(); sendOut({ type: "undo", from: peer.id }); return; }
  }
}

function clearCanvas() {
  strokes.length = 0;
  redraw();
  sendOut({ type: "clear" });
}

function downloadPng() {
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
    a.download = "shared-sketch.png";
    a.click();
    URL.revokeObjectURL(a.href);
  });
}

function hostHandleConnection(conn) {
  conn.on("data", (msg) => {
    if (!msg || typeof msg.type !== "string") return;
    if (msg.type === "join") {
      const name = String(msg.name || "anon").substring(0, 20);
      guests.set(conn.peer, { conn, name });
      updateMembers(rosterNames());
      hostBroadcast({ type: "roster", names: rosterNames() });
      conn.send({ type: "snapshot", strokes });
      return;
    }
    if (!guests.has(conn.peer)) return;
    if (msg.type === "stroke") { applyStrokeSegment(msg); hostBroadcast(msg, conn.peer); }
    else if (msg.type === "clear") { strokes.length = 0; redraw(); hostBroadcast(msg, conn.peer); }
    else if (msg.type === "undo") {
      for (let i = strokes.length - 1; i >= 0; i--) { if (strokes[i].owner === msg.from) { strokes.splice(i, 1); break; } }
      redraw();
      hostBroadcast(msg, conn.peer);
    }
  });
  conn.on("close", () => {
    const guest = guests.get(conn.peer);
    if (!guest) return;
    guests.delete(conn.peer);
    updateMembers(rosterNames());
    hostBroadcast({ type: "roster", names: rosterNames() });
  });
  conn.on("error", (err) => console.error("[shared-sketchpad] guest error:", err));
}

createBtn.addEventListener("click", () => {
  myName = getName();
  if (!myName) return;
  isHost = true;
  const code = generateCode();
  showStatus("Creating room...", "info");
  peer = new Peer(ID_PREFIX + code, { config: ICE_CONFIG });
  peer.on("open", () => { showSketch(code); updateMembers([myName]); });
  peer.on("connection", hostHandleConnection);
  peer.on("error", (err) => showRoomStatus("Error: " + err.type, "error"));
});

joinBtn.addEventListener("click", () => {
  myName = getName();
  if (!myName) return;
  const code = codeInput.value.trim().toUpperCase();
  if (!code) { showStatus("Enter a room code, or click Create Room", "error"); codeInput.focus(); return; }
  showStatus("Connecting...", "info");
  peer = new Peer({ config: ICE_CONFIG });
  peer.on("open", () => {
    hostConn = peer.connect(ID_PREFIX + code, { reliable: true });
    hostConn.on("open", () => { hostConn.send({ type: "join", name: myName }); showSketch(code); });
    hostConn.on("data", (msg) => {
      if (!msg || typeof msg.type !== "string") return;
      if (msg.type === "stroke") applyStrokeSegment(msg);
      else if (msg.type === "clear") { strokes.length = 0; redraw(); }
      else if (msg.type === "undo") {
        for (let i = strokes.length - 1; i >= 0; i--) { if (strokes[i].owner === msg.from) { strokes.splice(i, 1); break; } }
        redraw();
      } else if (msg.type === "snapshot") { strokes = msg.strokes || []; redraw(); }
      else if (msg.type === "roster") updateMembers(msg.names);
    });
    hostConn.on("close", () => { showRoomStatus("Room closed (host left). Refresh to start over.", "error"); canvas.style.pointerEvents = "none"; });
    hostConn.on("error", (err) => console.error("[shared-sketchpad] host error:", err));
  });
  peer.on("error", (err) => {
    if (err.type === "peer-unavailable") showStatus(`Room ${code} not found — check the code`, "error");
    else showStatus("Error: " + err.type, "error");
  });
});

canvas.addEventListener("pointerdown", (e) => {
  e.preventDefault();
  canvas.setPointerCapture(e.pointerId);
  const id = `${peer.id}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  currentStroke = { id, owner: peer.id, color: colorInput.value, width: Number(widthInput.value), points: [normPoint(e)], lastSent: 0 };
  strokes.push(currentStroke);
  flushTimer = setInterval(flushCurrentStroke, 100);
});

canvas.addEventListener("pointermove", (e) => {
  if (!currentStroke) return;
  currentStroke.points.push(normPoint(e));
  const pts = currentStroke.points;
  drawSegment(pixel(pts[pts.length - 2]), pixel(pts[pts.length - 1]), currentStroke.color, currentStroke.width);
});

function endStroke() {
  if (!currentStroke) return;
  flushCurrentStroke();
  clearInterval(flushTimer);
  currentStroke = null;
}
canvas.addEventListener("pointerup", endStroke);
canvas.addEventListener("pointercancel", endStroke);

widthInput.addEventListener("input", () => (widthVal.textContent = widthInput.value));
undoBtn.addEventListener("click", undoOwnStroke);
clearBtn.addEventListener("click", clearCanvas);
downloadBtn.addEventListener("click", downloadPng);
resizeBtn.addEventListener("click", () => setCanvasSize(Number(widthField.value) || DEFAULT_WIDTH, Number(heightField.value) || DEFAULT_HEIGHT));
maxBtn.addEventListener("click", () => setCanvasSize(1280, 720));

[nameInput, codeInput].forEach((input) => {
  input.addEventListener("keydown", (e) => {
    if (e.key !== "Enter") return;
    if (codeInput.value.trim()) joinBtn.click();
    else createBtn.click();
  });
});

copyCodeBtn.addEventListener("click", () => {
  navigator.clipboard.writeText(roomCodeEl.textContent);
  copyCodeBtn.textContent = "✓ Copied";
  setTimeout(() => (copyCodeBtn.textContent = "📋 Copy"), 1500);
});

copyLinkBtn.addEventListener("click", () => {
  navigator.clipboard.writeText(location.href.split("#")[0] + "#" + roomCodeEl.textContent);
  copyLinkBtn.textContent = "✓ Copied";
  setTimeout(() => (copyLinkBtn.textContent = "🔗 Copy Link"), 1500);
});

const linkCode = location.hash.replace("#", "").trim().toUpperCase();
if (linkCode) {
  codeInput.value = linkCode;
  if (nameInput.value.trim()) joinBtn.click();
  else showStatus(`Joining room ${linkCode} — pick a nickname first`, "info");
}
