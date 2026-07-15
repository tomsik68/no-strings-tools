const senderBtn = document.getElementById("sender-btn");
const receiverBtn = document.getElementById("receiver-btn");
const step1 = document.getElementById("step-1");
const senderPath = document.getElementById("sender-path");
const receiverPath = document.getElementById("receiver-path");
const fileTransfer = document.getElementById("file-transfer");

const createOfferBtn = document.getElementById("create-offer-btn");
const offerBox = document.getElementById("offer-box");
const offerStatus = document.getElementById("offer-status");
const step2Sender = document.getElementById("step-2-sender");
const step3Sender = document.getElementById("step-3-sender");

const step2Receiver = document.getElementById("step-2-receiver");
const step3Receiver = document.getElementById("step-3-receiver");

const fileInput = document.getElementById("file-input");
const transferStatus = document.getElementById("transfer-status");
const progressBar = document.getElementById("progress-bar");
const progressFill = document.getElementById("progress-fill");
const transferLog = document.getElementById("transfer-log");

let peer = null;
let conn = null;
let isInitiator = false;

function addLog(message) {
  const timestamp = new Date().toLocaleTimeString();
  const line = document.createElement("div");
  line.textContent = `[${timestamp}] ${message}`;
  transferLog.appendChild(line);
  transferLog.scrollTop = transferLog.scrollHeight;
}

function generateRoomId() {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
}

function showStatus(element, message, type = "info") {
  element.textContent = message;
  element.className = `status ${type}`;
}

function showFileTransferUI() {
  if (fileTransfer.classList.contains("active")) return;
  console.log("[p2p-file] connection open, showing transfer UI");

  step1.style.display = "none";
  senderPath.style.display = "none";
  receiverPath.style.display = "none";
  fileTransfer.classList.add("active");
  // The inline display:none in index.html overrides the .active class
  fileTransfer.style.display = "block";
  addLog("✓ Connected! Ready to transfer files");
  showStatus(transferStatus, "✓ Connected. Choose a file to send.", "connected");
}

function setupDataConnection(dataConn) {
  conn = dataConn;
  console.log("[p2p-file] data connection to", conn.peer, "- open:", conn.open);

  conn.on("open", () => {
    showFileTransferUI();
  });

  // The connection may already be open before the handler above is attached
  if (conn.open) {
    showFileTransferUI();
  }

  conn.on("data", (data) => {
    if (typeof data === "string") {
      console.log("[p2p-file] received message:", data);
      const msg = JSON.parse(data);
      if (msg.type === "file-start") {
        addLog(`📥 Receiving: ${msg.name} (${(msg.size / 1024 / 1024).toFixed(2)} MB)`);
        window.fileBuffer = [];
        window.fileMetadata = msg;
      }
    } else {
      window.fileBuffer.push(data);
      const received = window.fileBuffer.reduce((sum, chunk) => sum + chunk.byteLength, 0);
      const percent = Math.round((received / window.fileMetadata.size) * 100);
      updateProgress(percent);

      if (received === window.fileMetadata.size) {
        saveReceivedFile();
      }
    }
  });

  conn.on("close", () => {
    console.log("[p2p-file] data connection closed");
    showStatus(transferStatus, "Connection closed", "error");
    addLog("Connection closed");
  });

  conn.on("error", (err) => {
    console.error("[p2p-file] data connection error:", err);
    showStatus(transferStatus, "Error: " + err, "error");
    addLog("Error: " + err);
  });

  conn.on("iceStateChanged", (state) => {
    console.log("[p2p-file] ICE state:", state);
  });
}

function updateProgress(percent) {
  progressBar.style.display = "block";
  progressFill.style.width = percent + "%";
  progressFill.textContent = percent + "%";
}

function saveReceivedFile() {
  const blob = new Blob(window.fileBuffer);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = window.fileMetadata.name;
  a.click();
  URL.revokeObjectURL(url);
  addLog(`✓ File saved: ${window.fileMetadata.name}`);
  updateProgress(0);
}

// Sender: Create room and wait for connection
senderBtn.addEventListener("click", () => {
  isInitiator = true;
  step1.style.display = "none";
  senderPath.style.display = "block";
  step2Sender.style.display = "block";
});

createOfferBtn.addEventListener("click", () => {
  const roomId = generateRoomId();
  peer = new Peer(roomId);

  peer.on("open", () => {
    offerBox.textContent = roomId;
    offerBox.style.display = "block";
    showStatus(offerStatus, `✓ Room: ${roomId}. Share this code.`, "connected");
    addLog(`Room created: ${roomId}`);

    const copyBtn = document.createElement("button");
    copyBtn.className = "w3-button w3-blue w3-round btn-action";
    copyBtn.style.marginTop = "8px";
    copyBtn.textContent = "📋 Copy Code";
    copyBtn.addEventListener("click", () => {
      navigator.clipboard.writeText(roomId);
      showStatus(offerStatus, "✓ Copied!", "connected");
      setTimeout(() => {
        step2Sender.style.display = "none";
        step3Sender.style.display = "block";
      }, 1000);
    });
    offerStatus.parentElement.insertBefore(copyBtn, offerStatus.nextSibling);
  });

  peer.on("connection", (incomingConn) => {
    console.log("[p2p-file] incoming connection from", incomingConn.peer);
    setupDataConnection(incomingConn);
  });

  peer.on("error", (err) => {
    console.error("[p2p-file] peer error:", err.type, err);
    showStatus(offerStatus, "Error: " + err.type, "error");
  });
});

// Receiver: Join room
receiverBtn.addEventListener("click", () => {
  isInitiator = false;
  step1.style.display = "none";
  receiverPath.style.display = "block";
  step2Receiver.style.display = "block";
});

const answerPaste = document.getElementById("answer-paste");
const createAnswerBtn = document.getElementById("create-answer-btn");
const answerStatus = document.getElementById("answer-status");

createAnswerBtn.addEventListener("click", () => {
  const roomId = answerPaste.value.trim().toUpperCase();

  if (!roomId) {
    showStatus(answerStatus, "Enter room code", "error");
    return;
  }

  peer = new Peer();

  peer.on("open", (id) => {
    console.log("[p2p-file] peer open as", id, "- connecting to room", roomId);
    // reliable: ordered, lossless delivery — required for file chunks
    setupDataConnection(peer.connect(roomId, { reliable: true }));
  });

  peer.on("error", (err) => {
    console.error("[p2p-file] peer error:", err.type, err);
    showStatus(answerStatus, "Error: " + err.type, "error");
    addLog("Connection error: " + err.type);
  });

  showStatus(answerStatus, "Connecting to room...", "info");
  addLog(`Joining room: ${roomId}`);
  step2Receiver.style.display = "none";
  step3Receiver.style.display = "block";
});

// File transfer
// The file input is visually hidden; the visible button proxies clicks to it
document.getElementById("choose-file-btn").addEventListener("click", () => {
  fileInput.click();
});

fileInput.addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  if (!conn || conn.open !== true) {
    showStatus(transferStatus, "Not connected", "error");
    return;
  }

  addLog(`📤 Sending: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`);
  showStatus(transferStatus, "Transferring...", "info");

  const metadata = {
    type: "file-start",
    name: file.name,
    size: file.size
  };
  conn.send(JSON.stringify(metadata));

  const chunkSize = 64 * 1024;
  let offset = 0;

  const sendChunk = () => {
    if (offset >= file.size) {
      addLog("✓ File sent successfully!");
      showStatus(transferStatus, "Complete!", "connected");
      updateProgress(0);
      fileInput.value = "";
      return;
    }

    const chunk = file.slice(offset, offset + chunkSize);
    const reader = new FileReader();

    reader.onload = (e) => {
      conn.send(e.target.result);
      offset += chunkSize;
      const percent = Math.round((offset / file.size) * 100);
      updateProgress(Math.min(percent, 100));

      if (conn.bufferSize < 1024 * 1024) {
        setTimeout(sendChunk, 0);
      } else {
        setTimeout(sendChunk, 100);
      }
    };

    reader.readAsArrayBuffer(chunk);
  };

  sendChunk();
});
