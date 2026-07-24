const nameInput = document.getElementById("name-input");
const codeInput = document.getElementById("code-input");
const createBtn = document.getElementById("create-btn");
const joinBtn = document.getElementById("join-btn");
const setupStatus = document.getElementById("setup-status");
const setupCard = document.getElementById("setup-card");
const chatCard = document.getElementById("chat-card");
const roomCodeEl = document.getElementById("room-code");
const copyCodeBtn = document.getElementById("copy-code-btn");
const membersEl = document.getElementById("members");
const messagesEl = document.getElementById("messages");
const msgInput = document.getElementById("msg-input");
const sendBtn = document.getElementById("send-btn");
const attachBtn = document.getElementById("attach-btn");
const fileInput = document.getElementById("file-input");

// Namespace peer IDs so room codes can't collide with other apps
// on the public PeerJS broker
const ID_PREFIX = "NOSTRINGSCHAT-";

// STUN for direct P2P; free public TURN relays as fallback for networks
// that block UDP or isolate clients (public WiFi, corporate, CGNAT)
const ICE_CONFIG = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "turn:openrelay.metered.ca:80", username: "openrelayproject", credential: "openrelayproject" },
    { urls: "turn:openrelay.metered.ca:443", username: "openrelayproject", credential: "openrelayproject" },
    { urls: "turn:openrelay.metered.ca:443?transport=tcp", username: "openrelayproject", credential: "openrelayproject" },
  ],
};
const CHUNK_SIZE = 64 * 1024;
const BUFFER_HIGH = 1024 * 1024;

let peer = null;
let isHost = false;
let hostConn = null; // guest: connection to the host
const guests = new Map(); // host: peerId -> { conn, name }
const incoming = new Map(); // transferId -> { name, size, from, chunks, received, line }
let myName = "";

nameInput.value = localStorage.getItem("p2p-chat-name") || "";
nameInput.focus();

function showStatus(message, type = "info") {
  setupStatus.textContent = message;
  setupStatus.className = `status ${type}`;
}

if (typeof Peer === "undefined") {
  showStatus("PeerJS failed to load — this app needs a network connection to start (and for peer discovery).", "error");
}

function generateCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

function timeStr(ts) {
  return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function fmtSize(bytes) {
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / 1024 / 1024).toFixed(2) + " MB";
}

function span(className, text) {
  const el = document.createElement("span");
  el.className = className;
  el.textContent = text;
  return el;
}

function addLine(children) {
  const line = document.createElement("div");
  children.forEach((c) => line.appendChild(c));
  messagesEl.appendChild(line);
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

function addChat(name, text, ts) {
  addLine([span("msg-time", timeStr(ts)), span("msg-name", name + ": "), span("", text)]);
}

function addSystem(text) {
  console.log("[p2p-chat] system:", text);
  addLine([span("msg-time", timeStr(Date.now())), span("msg-system", text)]);
}

function updateMembers(names) {
  membersEl.textContent = `In room (${names.length}): ${names.join(", ")}`;
}

function showChat(code) {
  setupCard.style.display = "none";
  chatCard.style.display = "block";
  roomCodeEl.textContent = code;
  // Make the address bar itself a shareable invite link
  location.hash = code;
  msgInput.focus();
}

function getName() {
  const name = nameInput.value.trim().substring(0, 20);
  if (!name) {
    showStatus("Pick a nickname first", "error");
    nameInput.focus();
    return null;
  }
  localStorage.setItem("p2p-chat-name", name);
  return name;
}

// --- File receiving (host and guest) ---

function handleFileStart(msg) {
  const entry = {
    name: String(msg.name).substring(0, 100),
    size: Number(msg.size),
    from: msg.from,
    chunks: [],
    received: 0,
    line: span("msg-system", ""),
  };
  incoming.set(msg.id, entry);
  console.log("[p2p-chat] receiving file", entry.name, entry.size, "from", entry.from);
  addLine([span("msg-time", timeStr(Date.now())), span("msg-name", entry.from + ": "), entry.line]);
  entry.line.textContent = `📎 Receiving ${entry.name}… 0%`;
  finishFileIfDone(msg.id, entry);
}

function handleFileChunk(msg) {
  const entry = incoming.get(msg.id);
  if (!entry) return;
  entry.chunks.push(msg.data);
  entry.received += msg.data.byteLength;
  const percent = Math.min(100, Math.round((entry.received / entry.size) * 100));
  entry.line.textContent = `📎 Receiving ${entry.name}… ${percent}%`;
  finishFileIfDone(msg.id, entry);
}

function finishFileIfDone(id, entry) {
  if (entry.received < entry.size) return;
  incoming.delete(id);
  console.log("[p2p-chat] file complete:", entry.name);
  const link = document.createElement("a");
  link.href = URL.createObjectURL(new Blob(entry.chunks));
  link.download = entry.name;
  link.textContent = `📎 ${entry.name} (${fmtSize(entry.size)}) — click to save`;
  entry.line.textContent = "";
  entry.line.appendChild(link);
}

// --- File sending (host broadcasts, guest sends to host for relay) ---

function sendOut(msg) {
  if (isHost) hostBroadcast(msg);
  else hostConn.send(msg);
}

function outBufferFull() {
  if (isHost) return [...guests.values()].some((g) => g.conn.open && g.conn.bufferSize > BUFFER_HIGH);
  return hostConn.bufferSize > BUFFER_HIGH;
}

async function waitForDrain() {
  while (outBufferFull()) await new Promise((r) => setTimeout(r, 50));
}

async function sendFile(file) {
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  console.log("[p2p-chat] sending file", file.name, file.size);
  sendOut({ type: "file-start", id, name: file.name, size: file.size, from: myName });

  const status = span("msg-system", `📎 Sending ${file.name}… 0%`);
  addLine([span("msg-time", timeStr(Date.now())), span("msg-name", myName + ": "), status]);

  let offset = 0;
  while (offset < file.size) {
    const data = await file.slice(offset, offset + CHUNK_SIZE).arrayBuffer();
    await waitForDrain();
    sendOut({ type: "file-chunk", id, data });
    offset += data.byteLength;
    const percent = Math.min(100, Math.round((offset / file.size) * 100));
    status.textContent = `📎 Sending ${file.name}… ${percent}%`;
  }
  status.textContent = `📎 Sent ${file.name} (${fmtSize(file.size)})`;
}

attachBtn.addEventListener("click", () => fileInput.click());
fileInput.addEventListener("change", () => {
  const file = fileInput.files[0];
  fileInput.value = "";
  if (!file) return;
  if (!isHost && (!hostConn || !hostConn.open)) return;
  sendFile(file);
});

// --- Host: relays every message to all guests (star topology) ---

function rosterNames() {
  return [myName, ...[...guests.values()].map((g) => g.name)];
}

function hostBroadcast(msg, exceptPeerId = null) {
  for (const [id, g] of guests) {
    if (id !== exceptPeerId && g.conn.open) g.conn.send(msg);
  }
}

function hostHandleConnection(conn) {
  console.log("[p2p-chat] incoming connection from", conn.peer);

  conn.on("data", (msg) => {
    if (!msg || typeof msg.type !== "string") return;

    if (msg.type === "join") {
      const name = String(msg.name || "anon").substring(0, 20);
      guests.set(conn.peer, { conn, name });
      console.log("[p2p-chat] join:", name, conn.peer);
      addSystem(`${name} joined`);
      hostBroadcast({ type: "system", text: `${name} joined` }, conn.peer);
      hostBroadcast({ type: "roster", names: rosterNames() });
      updateMembers(rosterNames());
      return;
    }

    if (!guests.has(conn.peer)) return;
    const name = guests.get(conn.peer).name;

    if (msg.type === "chat") {
      const out = { type: "chat", name, text: String(msg.text).substring(0, 2000), ts: Date.now() };
      addChat(out.name, out.text, out.ts);
      hostBroadcast(out, conn.peer);
    } else if (msg.type === "file-start") {
      const out = { type: "file-start", id: msg.id, name: msg.name, size: msg.size, from: name };
      handleFileStart(out);
      hostBroadcast(out, conn.peer);
    } else if (msg.type === "file-chunk") {
      handleFileChunk(msg);
      hostBroadcast(msg, conn.peer);
    }
  });

  conn.on("close", () => {
    const guest = guests.get(conn.peer);
    if (!guest) return;
    guests.delete(conn.peer);
    console.log("[p2p-chat] left:", guest.name, conn.peer);
    addSystem(`${guest.name} left`);
    hostBroadcast({ type: "system", text: `${guest.name} left` });
    hostBroadcast({ type: "roster", names: rosterNames() });
    updateMembers(rosterNames());
  });

  conn.on("error", (err) => console.error("[p2p-chat] guest connection error:", err));
}

createBtn.addEventListener("click", () => {
  myName = getName();
  if (!myName) return;

  isHost = true;
  const code = generateCode();
  showStatus("Creating room...", "info");
  peer = new Peer(ID_PREFIX + code, { config: ICE_CONFIG });

  peer.on("open", (id) => {
    console.log("[p2p-chat] hosting room", code, "as", id);
    showChat(code);
    updateMembers([myName]);
    addSystem(`Room ${code} created. Share the code. The room closes when you close this tab.`);
  });

  peer.on("connection", hostHandleConnection);

  peer.on("error", (err) => {
    console.error("[p2p-chat] peer error:", err.type, err);
    showStatus("Error: " + err.type, "error");
  });
});

// --- Guest: single connection to the host ---

joinBtn.addEventListener("click", () => {
  myName = getName();
  if (!myName) return;

  const code = codeInput.value.trim().toUpperCase();
  if (!code) {
    showStatus("Enter a room code, or click Create Room", "error");
    codeInput.focus();
    return;
  }

  showStatus("Connecting...", "info");
  peer = new Peer({ config: ICE_CONFIG });

  peer.on("open", (id) => {
    console.log("[p2p-chat] peer open as", id, "- joining room", code);
    hostConn = peer.connect(ID_PREFIX + code, { reliable: true });

    hostConn.on("open", () => {
      console.log("[p2p-chat] connected to host");
      hostConn.send({ type: "join", name: myName });
      showChat(code);
      addSystem(`Joined room ${code}`);
    });

    hostConn.on("data", (msg) => {
      if (!msg || typeof msg.type !== "string") return;
      if (msg.type === "chat") addChat(msg.name, msg.text, msg.ts);
      else if (msg.type === "system") addSystem(msg.text);
      else if (msg.type === "roster") updateMembers(msg.names);
      else if (msg.type === "file-start") handleFileStart(msg);
      else if (msg.type === "file-chunk") handleFileChunk(msg);
    });

    hostConn.on("close", () => {
      console.log("[p2p-chat] host connection closed");
      addSystem("Room closed (host left). Refresh to start over.");
      msgInput.disabled = true;
      sendBtn.disabled = true;
      attachBtn.disabled = true;
    });

    hostConn.on("error", (err) => console.error("[p2p-chat] host connection error:", err));
  });

  peer.on("error", (err) => {
    console.error("[p2p-chat] peer error:", err.type, err);
    if (err.type === "peer-unavailable") {
      showStatus(`Room ${code} not found — check the code`, "error");
    } else {
      showStatus("Error: " + err.type, "error");
    }
  });
});

// --- Sending text ---

function sendMessage() {
  const text = msgInput.value.trim();
  if (!text) return;

  if (isHost) {
    const msg = { type: "chat", name: myName, text, ts: Date.now() };
    addChat(msg.name, msg.text, msg.ts);
    hostBroadcast(msg);
  } else {
    if (!hostConn || !hostConn.open) return;
    hostConn.send({ type: "chat", text });
    addChat(myName, text, Date.now());
  }
  msgInput.value = "";
}

sendBtn.addEventListener("click", sendMessage);
msgInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") sendMessage();
});

// Enter in setup: join if a code is entered, otherwise create
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

const copyLinkBtn = document.getElementById("copy-link-btn");
copyLinkBtn.addEventListener("click", () => {
  const url = location.href.split("#")[0] + "#" + roomCodeEl.textContent;
  navigator.clipboard.writeText(url);
  copyLinkBtn.textContent = "✓ Copied";
  setTimeout(() => (copyLinkBtn.textContent = "🔗 Copy Link"), 1500);
});

// Invite link support: index.html#ROOMCODE prefills the code and,
// with a saved nickname, joins the room immediately
const linkCode = location.hash.replace("#", "").trim().toUpperCase();
if (linkCode) {
  codeInput.value = linkCode;
  if (nameInput.value.trim()) {
    console.log("[p2p-chat] invite link for room", linkCode, "- auto-joining");
    joinBtn.click();
  } else {
    showStatus(`Joining room ${linkCode} — pick a nickname first`, "info");
  }
}
