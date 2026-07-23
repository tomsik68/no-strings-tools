const ID_PREFIX = 'NOSTRINGS-PAD-';

if (typeof Peer === 'undefined') {
  document.body.insertAdjacentHTML('afterbegin',
    '<p class="w3-panel w3-pale-red w3-border w3-round" style="max-width:520px;margin:16px auto">PeerJS failed to load — this app needs a network connection to start.</p>');
}

let peer = null;
let isHost = false;
const guests = new Map();
let hostConn = null;

function generateCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

function setStatus(id, msg, type = 'info') {
  const el = document.getElementById(id);
  el.textContent = msg;
  el.className = 'status ' + type;
  el.hidden = false;
}

const pad = document.getElementById('pad');

function setPad(content) {
  const start = pad.selectionStart;
  const end = pad.selectionEnd;
  pad.value = content;
  pad.setSelectionRange(start, end);
}

function broadcast(msg, exceptPeer = null) {
  for (const [id, conn] of guests) {
    if (id !== exceptPeer && conn.open) conn.send(msg);
  }
}

pad.addEventListener('input', () => {
  const msg = { type: 'text', content: pad.value };
  if (isHost) {
    broadcast(msg);
  } else if (hostConn?.open) {
    hostConn.send(msg);
  }
});

// --- Host ---

function startHost() {
  document.getElementById('step-init').hidden = true;
  document.getElementById('step-host').hidden = false;
  document.getElementById('pad-section').hidden = false;
  pad.focus();
  isHost = true;

  const code = generateCode();
  document.getElementById('host-code').textContent = code;

  peer = new Peer(ID_PREFIX + code);
  peer.on('open', () => setStatus('host-status', 'Waiting for the other device…', 'info'));

  peer.on('connection', conn => {
    guests.set(conn.peer, conn);

    conn.on('open', () => {
      conn.send({ type: 'state', content: pad.value });
      const n = guests.size;
      setStatus('host-status', `${n} device${n > 1 ? 's' : ''} connected`, 'success');
    });

    conn.on('data', msg => {
      if (msg.type !== 'text') return;
      setPad(msg.content);
      broadcast(msg, conn.peer);
    });

    conn.on('close', () => {
      guests.delete(conn.peer);
      const n = guests.size;
      setStatus('host-status', n ? `${n} device${n > 1 ? 's' : ''} connected` : 'Waiting for the other device…', n ? 'success' : 'info');
    });

    conn.on('error', () => guests.delete(conn.peer));
  });

  peer.on('error', err => {
    const msg = err.type === 'unavailable-id' ? 'Code already in use — try again' : 'Error: ' + err.type;
    setStatus('host-status', msg, 'error');
  });
}

// --- Guest ---

function startGuest() {
  const code = document.getElementById('join-code').value.trim().toUpperCase();
  if (code.length < 4) { document.getElementById('join-code').focus(); return; }
  setStatus('guest-status', 'Connecting…', 'info');
  document.getElementById('connect-btn').disabled = true;

  peer = new Peer();
  peer.on('open', () => {
    hostConn = peer.connect(ID_PREFIX + code, { reliable: true });

    hostConn.on('data', msg => {
      if (msg.type !== 'state' && msg.type !== 'text') return;
      setPad(msg.content);
      if (msg.type === 'state') {
        document.getElementById('step-join').hidden = true;
        document.getElementById('pad-section').hidden = false;
        setStatus('pad-status', 'Connected', 'success');
        pad.focus();
      }
    });

    hostConn.on('close', () => {
      setStatus('pad-status', 'Connection closed — host left. Your text is still here.', 'error');
      pad.readOnly = true;
    });

    hostConn.on('error', err => {
      setStatus('guest-status', 'Connection error: ' + err.type, 'error');
      document.getElementById('connect-btn').disabled = false;
    });
  });

  peer.on('error', err => {
    const msg = err.type === 'peer-unavailable' ? `Code "${code}" not found — check it and try again` : 'Error: ' + err.type;
    setStatus('guest-status', msg, 'error');
    document.getElementById('connect-btn').disabled = false;
    peer?.destroy(); peer = null;
  });
}

// --- Events ---

document.getElementById('start-host-btn').addEventListener('click', startHost);
document.getElementById('start-guest-btn').addEventListener('click', () => {
  document.getElementById('step-init').hidden = true;
  document.getElementById('step-join').hidden = false;
  document.getElementById('join-code').focus();
});

document.getElementById('connect-btn').addEventListener('click', startGuest);
document.getElementById('join-code').addEventListener('keydown', ev => {
  if (ev.key === 'Enter') startGuest();
  requestAnimationFrame(() => { ev.target.value = ev.target.value.toUpperCase(); });
});

document.getElementById('copy-code-btn').addEventListener('click', () => {
  navigator.clipboard.writeText(document.getElementById('host-code').textContent);
  const btn = document.getElementById('copy-code-btn');
  btn.textContent = '✓ Copied';
  setTimeout(() => btn.textContent = '📋 Copy code', 1800);
});

document.getElementById('copy-url-btn').addEventListener('click', () => {
  const code = document.getElementById('host-code').textContent;
  navigator.clipboard.writeText(location.href.split('#')[0] + '#' + code);
  const btn = document.getElementById('copy-url-btn');
  btn.textContent = '✓ Copied';
  setTimeout(() => btn.textContent = '🔗 Copy link', 1800);
});

// Invite link: live-pad/#ABC123 pre-fills and shows join panel
const linkCode = location.hash.replace('#', '').trim().toUpperCase();
if (linkCode) {
  document.getElementById('join-code').value = linkCode;
  document.getElementById('step-init').hidden = true;
  document.getElementById('step-join').hidden = false;
}
