const ID_PREFIX = 'NOSTRINGS-SYNC-';

// --- Data helpers ---

function getAll() {
  const data = {};
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    data[k] = localStorage.getItem(k);
  }
  return data;
}

function mergeJSON(a, b) {
  if (Array.isArray(a) && Array.isArray(b)) {
    // Arrays of objects with ids: union by id
    if ((a.length && a[0]?.id) || (b.length && b[0]?.id)) {
      const map = new Map();
      for (const x of a) if (x?.id) map.set(x.id, x);
      for (const x of b) {
        if (!x?.id) continue;
        if (!map.has(x.id)) {
          map.set(x.id, x);
        } else {
          // Keep the richer object (more content = more recent edits)
          const ex = map.get(x.id);
          if (JSON.stringify(x).length > JSON.stringify(ex).length) map.set(x.id, x);
        }
      }
      return [...map.values()];
    }
    // Arrays without ids: union by value equality
    const seen = new Set(a.map(JSON.stringify));
    return [...a, ...b.filter(x => !seen.has(JSON.stringify(x)))];
  }
  if (a !== null && b !== null && typeof a === 'object' && typeof b === 'object') {
    // Objects (date-keyed logs, nested structures): deep merge, a wins on leaf conflicts
    const merged = { ...a };
    for (const [k, v] of Object.entries(b)) {
      merged[k] = k in merged ? mergeJSON(merged[k], v) : v;
    }
    return merged;
  }
  // Primitives: a wins (host wins)
  return a;
}

function countNewEntries(before, after) {
  let added = 0;
  for (const [key, afterVal] of Object.entries(after)) {
    const beforeVal = before[key];
    if (!beforeVal) {
      try { const v = JSON.parse(afterVal); added += Array.isArray(v) ? v.length : typeof v === 'object' ? Object.keys(v).length : 1; } catch { added += 1; }
      continue;
    }
    if (beforeVal === afterVal) continue;
    try {
      const bv = JSON.parse(beforeVal);
      const av = JSON.parse(afterVal);
      if (Array.isArray(bv) && Array.isArray(av)) { added += Math.max(0, av.length - bv.length); }
      else if (bv && typeof bv === 'object') { added += Math.max(0, Object.keys(av || {}).length - Object.keys(bv).length); }
    } catch { /* ignore */ }
  }
  return added;
}

function computeMerge(remoteRaw) {
  const local = getAll();
  const result = {};
  const allKeys = new Set([...Object.keys(local), ...Object.keys(remoteRaw)]);
  for (const key of allKeys) {
    const lv = local[key];
    const rv = remoteRaw[key];
    if (lv === undefined) { result[key] = rv; continue; }
    if (rv === undefined) { result[key] = lv; continue; }
    if (lv === rv) { result[key] = lv; continue; }
    try {
      const merged = mergeJSON(JSON.parse(lv), JSON.parse(rv));
      result[key] = JSON.stringify(merged);
    } catch {
      result[key] = lv;
    }
  }
  return result;
}

function applyMerged(mergedRaw) {
  const before = getAll();
  for (const [key, val] of Object.entries(mergedRaw)) {
    localStorage.setItem(key, val);
  }
  const after = getAll();
  const keysChanged = Object.keys(mergedRaw).filter(k => before[k] !== mergedRaw[k]).length;
  const entriesAdded = countNewEntries(before, after);
  return { keysChanged, entriesAdded };
}

// --- UI helpers ---

function show(stepId) {
  ['step-init', 'step-host', 'step-join', 'step-done'].forEach(id => {
    document.getElementById(id).hidden = (id !== stepId);
  });
}

function setHostStatus(msg, type = 'info') {
  const el = document.getElementById('host-status');
  el.textContent = msg;
  el.className = 'status ' + type;
}

function setGuestStatus(msg, type = 'info') {
  const el = document.getElementById('guest-status');
  el.textContent = msg;
  el.className = 'status ' + type;
  el.hidden = false;
}

function showDone(keysChanged, entriesAdded) {
  document.getElementById('stat-keys').textContent = keysChanged;
  document.getElementById('stat-entries').textContent = entriesAdded;
  show('step-done');
}

function generateCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// --- Host ---

let peer = null;

function startHost() {
  show('step-host');
  const code = generateCode();
  document.getElementById('host-code').textContent = code;

  peer = new Peer(ID_PREFIX + code);
  peer.on('open', () => setHostStatus('Waiting for the other device to join…', 'info'));

  peer.on('connection', conn => {
    setHostStatus('Connected. Syncing…', 'info');

    conn.on('data', msg => {
      if (msg.type !== 'data') return;
      const merged = computeMerge(msg.payload);  // host's local wins on conflicts
      const { keysChanged, entriesAdded } = applyMerged(merged);
      conn.send({ type: 'merged', payload: merged });
      peer.destroy(); peer = null;
      showDone(keysChanged, entriesAdded);
    });

    conn.on('error', err => setHostStatus('Connection error: ' + err.type, 'error'));
    conn.on('close', () => { if (peer) setHostStatus('Other device disconnected.', 'error'); });
  });

  peer.on('error', err => {
    const msg = err.type === 'unavailable-id' ? 'Code already in use — try again' : 'Error: ' + err.type;
    setHostStatus(msg, 'error');
  });
}

// --- Guest ---

function startGuest() {
  const code = document.getElementById('join-code').value.trim().toUpperCase();
  if (code.length < 4) { document.getElementById('join-code').focus(); return; }
  setGuestStatus('Connecting…', 'info');
  document.getElementById('connect-btn').disabled = true;

  peer = new Peer();
  peer.on('open', () => {
    const conn = peer.connect(ID_PREFIX + code, { reliable: true });

    conn.on('open', () => {
      setGuestStatus('Connected. Sending data…', 'info');
      conn.send({ type: 'data', payload: getAll() });
    });

    conn.on('data', msg => {
      if (msg.type !== 'merged') return;
      const { keysChanged, entriesAdded } = applyMerged(msg.payload);
      peer.destroy(); peer = null;
      showDone(keysChanged, entriesAdded);
    });

    conn.on('error', err => { setGuestStatus('Connection error: ' + err.type, 'error'); document.getElementById('connect-btn').disabled = false; });
    conn.on('close', () => { if (peer) { setGuestStatus('Connection closed before sync completed.', 'error'); document.getElementById('connect-btn').disabled = false; } });
  });

  peer.on('error', err => {
    const msg = err.type === 'peer-unavailable' ? `Code "${code}" not found — check it and try again` : 'Error: ' + err.type;
    setGuestStatus(msg, 'error');
    document.getElementById('connect-btn').disabled = false;
    if (peer) { peer.destroy(); peer = null; }
  });
}

// --- Events ---

document.getElementById('start-host-btn').addEventListener('click', startHost);
document.getElementById('start-guest-btn').addEventListener('click', () => {
  show('step-join');
  document.getElementById('join-code').focus();
});

document.getElementById('connect-btn').addEventListener('click', startGuest);
document.getElementById('join-code').addEventListener('keydown', ev => {
  if (ev.key === 'Enter') startGuest();
  // Force uppercase as user types
  requestAnimationFrame(() => { ev.target.value = ev.target.value.toUpperCase(); });
});

document.getElementById('copy-code-btn').addEventListener('click', () => {
  const code = document.getElementById('host-code').textContent;
  navigator.clipboard.writeText(code);
  const btn = document.getElementById('copy-code-btn');
  btn.textContent = '✓ Copied';
  setTimeout(() => btn.textContent = '📋 Copy code', 1800);
});

document.getElementById('copy-url-btn').addEventListener('click', () => {
  const code = document.getElementById('host-code').textContent;
  const url = location.href.split('#')[0] + '#' + code;
  navigator.clipboard.writeText(url);
  const btn = document.getElementById('copy-url-btn');
  btn.textContent = '✓ Copied';
  setTimeout(() => btn.textContent = '🔗 Copy link', 1800);
});

document.getElementById('again-btn').addEventListener('click', () => {
  if (peer) { peer.destroy(); peer = null; }
  document.getElementById('join-code').value = '';
  document.getElementById('guest-status').hidden = true;
  document.getElementById('connect-btn').disabled = false;
  show('step-init');
});

// Invite link: data-sync/#ABC123 pre-fills code and shows join panel
const linkCode = location.hash.replace('#', '').trim().toUpperCase();
if (linkCode) {
  document.getElementById('join-code').value = linkCode;
  show('step-join');
}
