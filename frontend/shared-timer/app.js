const ID_PREFIX = 'NOSTRINGS-TIMER-';

let peer = null;
let isHost = false;
const guests = new Map();
let hostConn = null;

// Timer state (host is authoritative)
let totalSeconds = 15 * 60;
let remaining = totalSeconds;
let running = false;
let startedAt = null;
let ticker = null;

function generateCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

function fmtTime(s) {
  s = Math.max(0, s);
  return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0');
}

function getRemaining() {
  if (!running || !startedAt) return remaining;
  return Math.max(0, totalSeconds - Math.floor((Date.now() - startedAt) / 1000));
}

function playBeep() {
  try {
    const ctx = new AudioContext();
    [0, 0.35, 0.7].forEach(t => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 800;
      gain.gain.setValueAtTime(0, ctx.currentTime + t);
      gain.gain.linearRampToValueAtTime(0.35, ctx.currentTime + t + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + t + 0.28);
      osc.start(ctx.currentTime + t);
      osc.stop(ctx.currentTime + t + 0.28);
    });
  } catch {}
}

function renderTimer() {
  const r = getRemaining();
  const display = document.getElementById('timer-display');
  display.textContent = fmtTime(r);
  const ratio = totalSeconds > 0 ? r / totalSeconds : 1;
  display.style.color = r === 0 ? '#c62828' : ratio < 0.2 ? '#d32f2f' : ratio < 0.4 ? '#e65100' : '#222';

  if (isHost) {
    const startBtn = document.getElementById('start-btn');
    startBtn.textContent = running ? '⏸ Pause' : '▶ Start';
    startBtn.disabled = r === 0 && !running;
  }
}

function broadcastState(extra = {}) {
  const msg = { type: 'state', totalSeconds, remaining: getRemaining(), running, startedAt, ...extra };
  for (const [, conn] of guests) if (conn.open) conn.send(msg);
}

function onTimerDone() {
  clearInterval(ticker); ticker = null;
  running = false; startedAt = null; remaining = 0;
  renderTimer();
  document.getElementById('timer-done-msg').style.display = 'block';
  playBeep();
  if (isHost) broadcastState({ type: 'done' });
}

function tick() {
  remaining = getRemaining();
  renderTimer();
  broadcastState();
  if (remaining <= 0) onTimerDone();
}

// Host controls

function timerStart() {
  if (remaining <= 0) return;
  if (!running) {
    startedAt = Date.now() - (totalSeconds - remaining) * 1000;
    running = true;
    document.getElementById('timer-done-msg').style.display = 'none';
    clearInterval(ticker);
    ticker = setInterval(tick, 1000);
    broadcastState();
    renderTimer();
  } else {
    remaining = getRemaining();
    running = false; startedAt = null;
    clearInterval(ticker); ticker = null;
    broadcastState();
    renderTimer();
  }
}

function timerReset() {
  clearInterval(ticker); ticker = null;
  running = false; startedAt = null; remaining = totalSeconds;
  document.getElementById('timer-done-msg').style.display = 'none';
  broadcastState();
  renderTimer();
}

function setStatus(id, msg, type = 'info') {
  const el = document.getElementById(id);
  el.textContent = msg;
  el.className = 'status ' + type;
  el.hidden = false;
}

// --- Host flow ---

function startHost() {
  document.getElementById('step-setup').hidden = true;
  document.getElementById('step-host').hidden = false;
  document.getElementById('step-timer').hidden = false;
  document.getElementById('timer-controls').hidden = false;
  isHost = true;
  renderTimer();

  const code = generateCode();
  document.getElementById('host-code').textContent = code;

  peer = new Peer(ID_PREFIX + code);
  peer.on('open', () => setStatus('host-status', 'Waiting for guests…', 'info'));

  peer.on('connection', conn => {
    guests.set(conn.peer, conn);

    conn.on('open', () => {
      conn.send({ type: 'state', totalSeconds, remaining: getRemaining(), running, startedAt });
      const n = guests.size;
      setStatus('host-status', `${n} guest${n > 1 ? 's' : ''} connected`, 'success');
    });

    conn.on('close', () => {
      guests.delete(conn.peer);
      const n = guests.size;
      setStatus('host-status', n ? `${n} guest${n > 1 ? 's' : ''} connected` : 'Waiting for guests…', n ? 'success' : 'info');
    });

    conn.on('error', () => guests.delete(conn.peer));
  });

  peer.on('error', err => setStatus('host-status', 'Error: ' + err.type, 'error'));
}

// --- Guest flow ---

function startGuest() {
  const code = document.getElementById('join-code').value.trim().toUpperCase();
  if (code.length < 4) { document.getElementById('join-code').focus(); return; }
  setStatus('guest-status', 'Connecting…', 'info');
  document.getElementById('connect-btn').disabled = true;

  peer = new Peer();
  peer.on('open', () => {
    hostConn = peer.connect(ID_PREFIX + code, { reliable: true });

    hostConn.on('data', msg => {
      if (msg.type === 'done') {
        remaining = 0; running = false; startedAt = null;
        renderTimer();
        document.getElementById('timer-done-msg').style.display = 'block';
        playBeep();
        return;
      }
      if (msg.type !== 'state') return;

      totalSeconds = msg.totalSeconds;
      remaining = msg.remaining;
      running = msg.running;
      startedAt = msg.startedAt;

      if (document.getElementById('step-join').hidden === false) {
        document.getElementById('step-join').hidden = true;
        document.getElementById('step-timer').hidden = false;
        document.getElementById('timer-guest-status').hidden = false;
      }
      renderTimer();
    });

    hostConn.on('close', () => {
      running = false; startedAt = null;
      const el = document.getElementById('timer-guest-status');
      el.textContent = 'Host disconnected — timer paused.';
      el.className = 'status error';
      el.hidden = false;
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

// --- Duration selection ---

document.querySelectorAll('.preset-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    document.getElementById('custom-min').value = '';
    totalSeconds = parseInt(btn.dataset.min) * 60;
    remaining = totalSeconds;
  });
});

document.getElementById('custom-min').addEventListener('input', ev => {
  const v = parseInt(ev.target.value);
  if (v > 0) {
    document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('selected'));
    totalSeconds = v * 60;
    remaining = totalSeconds;
  }
});

// --- Events ---

document.getElementById('start-host-btn').addEventListener('click', startHost);
document.getElementById('start-guest-btn').addEventListener('click', () => {
  document.getElementById('step-setup').hidden = true;
  document.getElementById('step-join').hidden = false;
  document.getElementById('join-code').focus();
});

document.getElementById('connect-btn').addEventListener('click', startGuest);
document.getElementById('join-code').addEventListener('keydown', ev => {
  if (ev.key === 'Enter') startGuest();
  requestAnimationFrame(() => { ev.target.value = ev.target.value.toUpperCase(); });
});

document.getElementById('start-btn').addEventListener('click', timerStart);
document.getElementById('reset-btn').addEventListener('click', timerReset);

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

// Invite link: shared-timer/#ABC123 pre-fills and shows join panel
const linkCode = location.hash.replace('#', '').trim().toUpperCase();
if (linkCode) {
  document.getElementById('join-code').value = linkCode;
  document.getElementById('step-setup').hidden = true;
  document.getElementById('step-join').hidden = false;
}
