const ID_PREFIX = 'NOSTRINGS-FILETX-';

// STUN for direct P2P; free public TURN relays as fallback for networks
// that block UDP or isolate clients (public WiFi, corporate, CGNAT)
const ICE_CONFIG = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'turn:openrelay.metered.ca:80', username: 'openrelayproject', credential: 'openrelayproject' },
    { urls: 'turn:openrelay.metered.ca:443', username: 'openrelayproject', credential: 'openrelayproject' },
    { urls: 'turn:openrelay.metered.ca:443?transport=tcp', username: 'openrelayproject', credential: 'openrelayproject' },
  ],
};
const CHUNK_SIZE = 64 * 1024;
const BUFFER_HIGH = 1024 * 1024;

if (typeof Peer === 'undefined') {
  document.body.insertAdjacentHTML('afterbegin',
    '<p class="w3-panel w3-pale-red w3-border w3-round" style="max-width:520px;margin:16px auto">PeerJS failed to load — this app needs a network connection to start (and for peer discovery).</p>');
}

let peer = null;
let conn = null;
const receiving = new Map(); // id → { name, size, chunks[], received, fillEl, subEl }

// --- Utilities ---

function generateCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

function fmtSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1048576).toFixed(2) + ' MB';
}

function esc(t) {
  const d = document.createElement('div');
  d.textContent = t ?? '';
  return d.innerHTML;
}
function escAttr(t) {
  return String(t ?? '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
}

function setStatus(id, msg, type) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = msg;
  el.className = 'status ' + type;
  el.hidden = false;
}

// --- Transfer log ---

function addTxItem(icon, name, size) {
  const log = document.getElementById('transfer-log');
  const item = document.createElement('div');
  item.className = 'tx-item';
  item.innerHTML =
    `<div class="tx-name">${icon} ${esc(name)} <span class="tx-size">(${fmtSize(size)})</span></div>` +
    `<div class="tx-bar"><div class="tx-fill"></div></div>` +
    `<div class="tx-sub">0%</div>`;
  log.prepend(item);
  return { fillEl: item.querySelector('.tx-fill'), subEl: item.querySelector('.tx-sub') };
}

// --- Send ---

function bufferFull() {
  return conn?.open && conn.bufferSize > BUFFER_HIGH;
}

async function waitDrain() {
  while (bufferFull()) await new Promise(r => setTimeout(r, 50));
}

async function sendFile(file) {
  if (!conn?.open) return;
  const id = crypto.randomUUID();
  const { fillEl, subEl } = addTxItem('📤', file.name, file.size);

  conn.send({ type: 'file-start', id, name: file.name, size: file.size });

  let offset = 0;
  while (offset < file.size) {
    const data = await file.slice(offset, offset + CHUNK_SIZE).arrayBuffer();
    await waitDrain();
    if (!conn?.open) { subEl.textContent = 'Cancelled — disconnected'; return; }
    conn.send({ type: 'file-chunk', id, data });
    offset += data.byteLength;
    const pct = Math.min(100, Math.round((offset / file.size) * 100));
    fillEl.style.width = pct + '%';
    subEl.textContent = pct === 100 ? '✓ Sent' : pct + '%';
  }
  fillEl.classList.add('done');
}

// --- Receive ---

function handleMsg(msg) {
  if (!msg || typeof msg.type !== 'string') return;

  if (msg.type === 'file-start') {
    const { fillEl, subEl } = addTxItem('📥', msg.name, msg.size);
    receiving.set(msg.id, { name: msg.name, size: msg.size, chunks: [], received: 0, fillEl, subEl });
    return;
  }

  if (msg.type === 'file-chunk') {
    const rx = receiving.get(msg.id);
    if (!rx) return;
    rx.chunks.push(msg.data);
    rx.received += msg.data.byteLength;
    const pct = Math.min(100, Math.round((rx.received / rx.size) * 100));
    rx.fillEl.style.width = pct + '%';
    rx.subEl.textContent = pct + '%';

    if (rx.received >= rx.size) {
      receiving.delete(msg.id);
      const url = URL.createObjectURL(new Blob(rx.chunks));
      rx.fillEl.classList.add('done');
      rx.subEl.innerHTML = `<a class="tx-link" href="${url}" download="${escAttr(rx.name)}">⬇ Save ${esc(rx.name)}</a>`;
    }
  }
}

// --- Connection lifecycle ---

function onConnected() {
  document.getElementById('transfer-section').hidden = false;
  setStatus('start-status', 'Connected', 'success');
  document.getElementById('drop-zone').classList.remove('disabled');
}

function onDisconnected() {
  document.getElementById('conn-status').textContent = 'Other device disconnected.';
  document.getElementById('conn-status').className = 'status error';
  document.getElementById('drop-zone').classList.add('disabled');
}

function wireConn(c) {
  conn = c;
  conn.on('open', onConnected);
  conn.on('data', handleMsg);
  conn.on('close', onDisconnected);
  conn.on('error', onDisconnected);
}

// --- Reset ---

function resetToInit() {
  try { conn?.close(); } catch (_) {}
  try { peer?.destroy(); } catch (_) {}
  conn = null; peer = null;
  receiving.clear();
  document.getElementById('transfer-log').innerHTML = '';
  document.getElementById('transfer-section').hidden = true;
  document.getElementById('step-start').hidden = true;
  document.getElementById('step-join').hidden = true;
  document.getElementById('step-init').hidden = false;
  document.getElementById('join-code').value = '';
  document.getElementById('connect-btn').disabled = false;
  document.getElementById('join-status').hidden = true;
  document.getElementById('drop-zone').classList.remove('disabled');
}

// --- Start session (generates code) ---

function startSession() {
  document.getElementById('step-init').hidden = true;
  document.getElementById('step-start').hidden = false;
  const code = generateCode();
  document.getElementById('start-code').textContent = code;
  setStatus('start-status', 'Waiting for the other device…', 'info');

  peer = new Peer(ID_PREFIX + code, { config: ICE_CONFIG });
  peer.on('connection', c => {
    wireConn(c);
    // conn.on('open') fires after wireConn, so onConnected handles the rest
  });
  peer.on('error', err => {
    const msg = err.type === 'unavailable-id'
      ? 'Code already in use — try again'
      : 'Connection error: ' + err.type;
    setStatus('start-status', msg, 'error');
  });
}

// --- Join session (enters code) ---

function joinSession() {
  const code = document.getElementById('join-code').value.trim().toUpperCase();
  if (code.length < 4) { document.getElementById('join-code').focus(); return; }
  document.getElementById('connect-btn').disabled = true;
  setStatus('join-status', 'Connecting…', 'info');

  peer = new Peer({ config: ICE_CONFIG });
  peer.on('open', () => {
    const c = peer.connect(ID_PREFIX + code, { reliable: true });
    wireConn(c);
    conn.on('open', () => {
      document.getElementById('step-join').hidden = true;
    });
    conn.on('error', () => {
      document.getElementById('connect-btn').disabled = false;
      setStatus('join-status', 'Connection failed. Check the code and try again.', 'error');
    });
  });
  peer.on('error', err => {
    const msg = err.type === 'peer-unavailable'
      ? `Code "${code}" not found — check it and try again`
      : 'Error: ' + err.type;
    setStatus('join-status', msg, 'error');
    document.getElementById('connect-btn').disabled = false;
    try { peer?.destroy(); } catch (_) {}
    peer = null;
  });
}

// --- Events ---

document.getElementById('start-session-btn').addEventListener('click', startSession);

document.getElementById('join-session-btn').addEventListener('click', () => {
  document.getElementById('step-init').hidden = true;
  document.getElementById('step-join').hidden = false;
  document.getElementById('join-code').focus();
});

document.getElementById('connect-btn').addEventListener('click', joinSession);

document.getElementById('join-code').addEventListener('keydown', ev => {
  if (ev.key === 'Enter') joinSession();
  requestAnimationFrame(() => { ev.target.value = ev.target.value.toUpperCase(); });
});

document.getElementById('copy-code-btn').addEventListener('click', () => {
  navigator.clipboard.writeText(document.getElementById('start-code').textContent);
  const btn = document.getElementById('copy-code-btn');
  const orig = btn.textContent;
  btn.textContent = '✓ Copied';
  setTimeout(() => { btn.textContent = orig; }, 1800);
});

document.getElementById('copy-url-btn').addEventListener('click', () => {
  const code = document.getElementById('start-code').textContent;
  navigator.clipboard.writeText(location.href.split('#')[0] + '#' + code);
  const btn = document.getElementById('copy-url-btn');
  const orig = btn.textContent;
  btn.textContent = '✓ Copied';
  setTimeout(() => { btn.textContent = orig; }, 1800);
});

const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');

dropZone.addEventListener('click', () => { if (!dropZone.classList.contains('disabled')) fileInput.click(); });
dropZone.addEventListener('dragover', e => { e.preventDefault(); if (!dropZone.classList.contains('disabled')) dropZone.classList.add('drag-over'); });
dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'));
dropZone.addEventListener('drop', e => {
  e.preventDefault();
  dropZone.classList.remove('drag-over');
  if (dropZone.classList.contains('disabled')) return;
  [...e.dataTransfer.files].forEach(f => sendFile(f));
});

fileInput.addEventListener('change', () => {
  [...fileInput.files].forEach(f => sendFile(f));
  fileInput.value = '';
});

document.getElementById('new-session-btn').addEventListener('click', resetToInit);

// Invite link: pre-fill join code from URL hash
const linkCode = location.hash.replace('#', '').trim().toUpperCase();
if (linkCode.length >= 4) {
  document.getElementById('join-code').value = linkCode;
  document.getElementById('step-init').hidden = true;
  document.getElementById('step-join').hidden = false;
}
