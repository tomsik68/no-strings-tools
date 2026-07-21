let contacts = JSON.parse(localStorage.getItem('contact-notes')) || [];
let openId = null;

function save() { localStorage.setItem('contact-notes', JSON.stringify(contacts)); }
function genId() { return Math.random().toString(36).slice(2, 9); }
function escHtml(t) { const d = document.createElement('div'); d.textContent = t; return d.innerHTML; }

function initials(name) {
  return name.trim().split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

function avatarColor(name) {
  const colors = ['#009688','#1976d2','#e91e63','#ff9800','#9c27b0','#43a047','#f44336','#00bcd4'];
  let h = 0;
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) & 0xffff;
  return colors[h % colors.length];
}

function render() {
  const list = document.getElementById('contacts-list');
  if (contacts.length === 0) {
    list.innerHTML = '<div class="empty">No contacts yet — add one below.</div>';
    return;
  }

  const sorted = [...contacts].sort((a, b) => a.name.localeCompare(b.name));

  list.innerHTML = sorted.map(c => {
    const isOpen = c.id === openId;
    const preview = c.notes?.trim() || (c.gifts?.length ? `${c.gifts.length} gift idea${c.gifts.length !== 1 ? 's' : ''}` : '');
    const giftsHtml = (c.gifts || []).map(g => `
      <div class="gift-row">
        <input type="checkbox" class="gift-check" data-contact-id="${c.id}" data-id="${g.id}" ${g.bought ? 'checked' : ''} />
        <label class="gift-label${g.bought ? ' bought' : ''}">${escHtml(g.text)}</label>
        <button class="gift-del" data-contact-id="${c.id}" data-id="${g.id}" title="Remove">×</button>
      </div>`).join('');

    return `<div class="contact-card">
      <div class="contact-header" data-id="${c.id}">
        <div class="contact-avatar" style="background:${avatarColor(c.name)}">${escHtml(initials(c.name))}</div>
        <span class="contact-name">${escHtml(c.name)}</span>
        ${preview ? `<span class="contact-preview">${escHtml(preview)}</span>` : ''}
        <span class="chevron${isOpen ? ' open' : ''}">▶</span>
      </div>
      <div class="contact-body${isOpen ? ' open' : ''}">
        <div class="section-label">Notes</div>
        <textarea class="notes-area" data-id="${c.id}" placeholder="Anything useful — preferences, allergies, things they mentioned…">${escHtml(c.notes || '')}</textarea>
        <div class="section-label">Gift ideas</div>
        ${giftsHtml || '<div style="color:#ccc;font-size:13px;padding:4px 0;">No ideas yet.</div>'}
        <div class="gift-add-row">
          <input class="gift-input" data-contact-id="${c.id}" type="text" placeholder="Add a gift idea…" autocomplete="off" />
          <button class="gift-add-btn w3-button w3-round" data-contact-id="${c.id}" style="background:#009688;color:white;font-size:13px;padding:6px 12px;">Add</button>
        </div>
        <button class="contact-del" data-id="${c.id}">Delete contact</button>
      </div>
    </div>`;
  }).join('');
}

const listEl = document.getElementById('contacts-list');

// Toggle expand/collapse
listEl.addEventListener('click', e => {
  const header = e.target.closest('.contact-header');
  if (header) {
    openId = openId === header.dataset.id ? null : header.dataset.id;
    render();
    if (openId) {
      const area = listEl.querySelector(`.notes-area[data-id="${openId}"]`);
      if (area) area.focus();
    }
    return;
  }

  // Gift checkbox
  const giftCheck = e.target.closest('.gift-check');
  if (giftCheck) {
    const c = contacts.find(c => c.id === giftCheck.dataset.contactId);
    const g = c?.gifts?.find(g => g.id === giftCheck.dataset.id);
    if (g) { g.bought = giftCheck.checked; save(); render(); }
    return;
  }

  // Gift delete
  const giftDel = e.target.closest('.gift-del');
  if (giftDel) {
    const c = contacts.find(c => c.id === giftDel.dataset.contactId);
    if (c) { c.gifts = (c.gifts || []).filter(g => g.id !== giftDel.dataset.id); save(); render(); }
    return;
  }

  // Add gift
  const giftAddBtn = e.target.closest('.gift-add-btn');
  if (giftAddBtn) {
    const contactId = giftAddBtn.dataset.contactId;
    const input = listEl.querySelector(`.gift-input[data-contact-id="${contactId}"]`);
    const text = input?.value.trim();
    if (!text) return;
    const c = contacts.find(c => c.id === contactId);
    if (c) {
      if (!c.gifts) c.gifts = [];
      c.gifts.push({ id: genId(), text, bought: false });
      input.value = '';
      save(); render();
    }
    return;
  }

  // Delete contact
  const contactDel = e.target.closest('.contact-del');
  if (contactDel) {
    const c = contacts.find(c => c.id === contactDel.dataset.id);
    if (!c) return;
    if (!confirm(`Delete ${c.name} and all their notes?`)) return;
    contacts = contacts.filter(c => c.id !== contactDel.dataset.id);
    if (openId === contactDel.dataset.id) openId = null;
    save(); render();
  }
});

// Notes auto-save (no re-render to preserve focus)
listEl.addEventListener('input', e => {
  const area = e.target.closest('.notes-area');
  if (area) {
    const c = contacts.find(c => c.id === area.dataset.id);
    if (c) { c.notes = area.value; save(); }
    return;
  }
});

// Gift input: Enter key to add
listEl.addEventListener('keydown', e => {
  if (e.key !== 'Enter') return;
  const input = e.target.closest('.gift-input');
  if (!input) return;
  const contactId = input.dataset.contactId;
  const text = input.value.trim();
  if (!text) return;
  const c = contacts.find(c => c.id === contactId);
  if (c) {
    if (!c.gifts) c.gifts = [];
    c.gifts.push({ id: genId(), text, bought: false });
    input.value = '';
    save(); render();
  }
});

function addContact() {
  const input = document.getElementById('new-contact');
  const name = input.value.trim();
  if (!name) return;
  const id = genId();
  contacts.push({ id, name, notes: '', gifts: [] });
  input.value = '';
  openId = id;
  save(); render();
  const area = listEl.querySelector(`.notes-area[data-id="${id}"]`);
  if (area) area.focus();
}

document.getElementById('add-contact-btn').addEventListener('click', addContact);
document.getElementById('new-contact').addEventListener('keydown', e => { if (e.key === 'Enter') addContact(); });

document.getElementById('new-contact').focus();
render();
