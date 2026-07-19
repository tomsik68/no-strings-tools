let spot = null;
// In-progress form values (survive edit cancel)
let draft = { label: '', gps: null, spotPhoto: null, ticketPhoto: null };

try { spot = JSON.parse(localStorage.getItem('parking-spot')); } catch { spot = null; }

// ── Image resize ──────────────────────────────────────────
function resizeImage(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const MAX = 1200;
        const scale = Math.min(1, MAX / Math.max(img.width, img.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.82));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

// ── GPS ───────────────────────────────────────────────────
document.getElementById('gps-btn').addEventListener('click', () => {
  const btn = document.getElementById('gps-btn');
  const status = document.getElementById('gps-status');

  if (!navigator.geolocation) {
    status.innerHTML = '<span class="err">GPS not available on this device.</span>';
    return;
  }
  btn.disabled = true;
  btn.textContent = '⏳ Getting location…';
  status.textContent = '';

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      draft.gps = { lat: pos.coords.latitude, lng: pos.coords.longitude, accuracy: Math.round(pos.coords.accuracy) };
      btn.disabled = false;
      btn.textContent = '📍 GPS captured';
      status.innerHTML = `<span class="ok">±${draft.gps.accuracy} m accuracy</span>`;
    },
    (err) => {
      btn.disabled = false;
      btn.textContent = '📍 Capture GPS';
      status.innerHTML = `<span class="err">${err.code === 1 ? 'Permission denied.' : 'Could not get location.'}</span>`;
    },
    { enableHighAccuracy: true, timeout: 15000 }
  );
});

// ── Photo slots ───────────────────────────────────────────
function setSlot(key, src) {
  const img = document.getElementById(`${key}-img`);
  const empty = document.getElementById(`${key}-empty`);
  const slot = document.getElementById(`${key}-slot`);
  const remove = document.getElementById(`${key}-remove`);
  if (src) {
    img.src = src;
    img.hidden = false;
    empty.hidden = true;
    remove.hidden = false;
    slot.classList.add('filled');
  } else {
    img.src = '';
    img.hidden = true;
    empty.hidden = false;
    remove.hidden = true;
    slot.classList.remove('filled');
  }
}

function removePhoto(key) {
  draft[`${key}Photo`] = null;
  document.getElementById(`${key}-file`).value = '';
  setSlot(key, null);
}

async function handleFile(key, file) {
  if (!file) return;
  const data = await resizeImage(file);
  draft[`${key}Photo`] = data;
  setSlot(key, data);
}

document.getElementById('spot-file').addEventListener('change', (e) => handleFile('spot', e.target.files[0]));
document.getElementById('ticket-file').addEventListener('change', (e) => handleFile('ticket', e.target.files[0]));

// ── Lightbox ──────────────────────────────────────────────
const lightbox = document.getElementById('lightbox');
function showLightbox(src) {
  document.getElementById('lightbox-img').src = src;
  lightbox.showModal();
}
document.getElementById('lightbox-close').addEventListener('click', () => lightbox.close());
lightbox.addEventListener('click', (e) => { if (e.target === lightbox) lightbox.close(); });

// ── Save ──────────────────────────────────────────────────
document.getElementById('save-btn').addEventListener('click', () => {
  draft.label = document.getElementById('label-input').value.trim();

  if (!draft.label && !draft.gps && !draft.spotPhoto && !draft.ticketPhoto) {
    alert('Add at least a location note, GPS pin, or photo.');
    return;
  }

  spot = { ...draft, savedAt: new Date().toISOString() };

  try {
    localStorage.setItem('parking-spot', JSON.stringify(spot));
  } catch {
    // Photos likely exceeded quota — save without them
    const slim = { label: spot.label, gps: spot.gps, savedAt: spot.savedAt };
    localStorage.setItem('parking-spot', JSON.stringify(slim));
    spot = slim;
    alert('Storage full — saved label and GPS only. Photos were too large to store.');
  }

  showDisplay();
});

// ── Edit ──────────────────────────────────────────────────
document.getElementById('edit-btn').addEventListener('click', () => {
  if (spot) draft = { label: spot.label || '', gps: spot.gps || null, spotPhoto: spot.spotPhoto || null, ticketPhoto: spot.ticketPhoto || null };
  showForm(true);
});

document.getElementById('cancel-btn').addEventListener('click', showDisplay);

// ── Found my car ──────────────────────────────────────────
document.getElementById('found-btn').addEventListener('click', () => {
  if (!confirm('Clear your saved parking spot?')) return;
  spot = null;
  draft = { label: '', gps: null, spotPhoto: null, ticketPhoto: null };
  localStorage.removeItem('parking-spot');
  showForm(false);
});

// ── Render helpers ────────────────────────────────────────
function esc(text) {
  const d = document.createElement('div');
  d.textContent = text;
  return d.innerHTML;
}

function relTime(iso) {
  const mins = Math.floor((Date.now() - new Date(iso)) / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const h = Math.floor(mins / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function showDisplay() {
  document.getElementById('form').hidden = true;
  document.getElementById('view').hidden = false;

  document.getElementById('display-label').innerHTML = spot.label
    ? `<div class="big-label w3-margin-bottom">${esc(spot.label)}</div>` : '';

  if (spot.gps) {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${spot.gps.lat},${spot.gps.lng}`;
    document.getElementById('display-gps').innerHTML = `
      <div style="display:flex; align-items:center; gap:12px; margin-bottom:14px; flex-wrap:wrap;">
        <span class="ok" style="font-size:14px;">📍 GPS saved (±${spot.gps.accuracy} m)</span>
        <a href="${url}" target="_blank" rel="noopener"
           class="w3-button w3-green w3-round nav-btn">🗺 Navigate</a>
      </div>`;
  } else {
    document.getElementById('display-gps').innerHTML = '';
  }

  function photoSection(id, label, src) {
    const el = document.getElementById(id);
    if (src) {
      el.innerHTML = `
        <div style="margin-bottom:14px;">
          <div class="section-label">${label}</div>
          <img src="${src}" class="display-thumb" onclick="showLightbox(this.src)" alt="${label}" />
        </div>`;
    } else { el.innerHTML = ''; }
  }
  photoSection('display-spot-photo', 'Parking spot', spot.spotPhoto);
  photoSection('display-ticket-photo', 'Parking ticket', spot.ticketPhoto);

  document.getElementById('display-time').textContent = spot.savedAt ? `Saved ${relTime(spot.savedAt)}` : '';
}

function showForm(editing) {
  document.getElementById('view').hidden = true;
  document.getElementById('form').hidden = false;
  document.getElementById('cancel-btn').hidden = !editing;

  document.getElementById('label-input').value = draft.label;

  const gpsBtn = document.getElementById('gps-btn');
  const gpsStatus = document.getElementById('gps-status');
  if (draft.gps) {
    gpsBtn.textContent = '📍 GPS captured';
    gpsStatus.innerHTML = `<span class="ok">±${draft.gps.accuracy} m accuracy</span>`;
  } else {
    gpsBtn.textContent = '📍 Capture GPS';
    gpsStatus.textContent = '';
  }

  setSlot('spot', draft.spotPhoto);
  setSlot('ticket', draft.ticketPhoto);

  document.getElementById('label-input').focus();
}

// ── Boot ──────────────────────────────────────────────────
if (spot) {
  draft = { label: spot.label || '', gps: spot.gps || null, spotPhoto: spot.spotPhoto || null, ticketPhoto: spot.ticketPhoto || null };
  showDisplay();
} else {
  showForm(false);
}
