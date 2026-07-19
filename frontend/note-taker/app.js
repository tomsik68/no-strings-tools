// marked v11 API: use marked.use() for renderer hooks; code() receives a token object
marked.use({
  breaks: true,
  gfm: true,
  renderer: {
    code({ text, lang }) {
      if (lang && hljs.getLanguage(lang)) {
        return `<pre><code class="hljs language-${lang}">${hljs.highlight(text, { language: lang }).value}</code></pre>`;
      }
      return `<pre><code class="hljs">${hljs.highlightAuto(text).value}</code></pre>`;
    }
  }
});

let notes = JSON.parse(localStorage.getItem("note-taker-notes")) || [];
let currentId = localStorage.getItem("note-taker-current") || null;

// Migrate old single-note format
const legacy = localStorage.getItem("note-taker-content");
if (legacy !== null) {
  notes.push({ id: genId(), content: legacy, updatedAt: new Date().toISOString() });
  localStorage.removeItem("note-taker-content");
  save();
}

// Seed with one blank note if nothing exists
if (notes.length === 0) {
  const n = { id: genId(), content: "", updatedAt: new Date().toISOString() };
  notes.push(n);
  currentId = n.id;
  save();
} else if (!currentId || !notes.find(n => n.id === currentId)) {
  currentId = notes[notes.length - 1].id;
}

function genId() {
  return Math.random().toString(36).slice(2, 10);
}

function save() {
  localStorage.setItem("note-taker-notes", JSON.stringify(notes));
  localStorage.setItem("note-taker-current", currentId);
}

function currentNote() {
  return notes.find(n => n.id === currentId);
}

function noteTitle(note) {
  const line = note.content.split("\n").find(l => l.trim());
  if (!line) return "Untitled";
  return line.replace(/^#+\s*/, "").trim() || "Untitled";
}

function relTime(iso) {
  const mins = Math.floor((Date.now() - new Date(iso)) / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const h = Math.floor(mins / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function esc(text) {
  const d = document.createElement("div");
  d.textContent = text;
  return d.innerHTML;
}

function renderSidebar() {
  const list = document.getElementById("note-list");
  // Show newest-modified first
  const sorted = notes.slice().sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  list.innerHTML = sorted.map(n => `
    <div class="note-item${n.id === currentId ? " active" : ""}" data-id="${n.id}">
      <div class="note-item-title">${esc(noteTitle(n))}</div>
      <div class="note-item-meta">${relTime(n.updatedAt)}</div>
      <button class="note-del" data-id="${n.id}" title="Delete note">×</button>
    </div>
  `).join("");
}

function renderPreview() {
  const note = currentNote();
  document.getElementById("preview").innerHTML = note ? marked.parse(note.content) : "";
}

function switchTo(id) {
  currentId = id;
  const note = currentNote();
  document.getElementById("note").value = note ? note.content : "";
  save();
  renderSidebar();
  renderPreview();
}

// Sidebar clicks (delegation)
document.getElementById("note-list").addEventListener("click", (e) => {
  if (e.target.classList.contains("note-del")) {
    const id = e.target.dataset.id;
    if (notes.length === 1) { alert("Can't delete the only note."); return; }
    if (!confirm("Delete this note?")) return;
    const idx = notes.findIndex(n => n.id === id);
    notes.splice(idx, 1);
    if (currentId === id) {
      currentId = (notes[idx] || notes[idx - 1] || notes[0]).id;
    }
    save();
    switchTo(currentId);
    return;
  }
  const item = e.target.closest(".note-item");
  if (item && item.dataset.id !== currentId) switchTo(item.dataset.id);
});

// New note
document.getElementById("new-note-btn").addEventListener("click", () => {
  const n = { id: genId(), content: "", updatedAt: new Date().toISOString() };
  notes.push(n);
  currentId = n.id;
  save();
  document.getElementById("note").value = "";
  document.getElementById("preview").innerHTML = "";
  renderSidebar();
  document.getElementById("note").focus();
});

// Editor input
document.getElementById("note").addEventListener("input", (e) => {
  const note = currentNote();
  if (!note) return;
  note.content = e.target.value;
  note.updatedAt = new Date().toISOString();
  save();
  renderPreview();
  renderSidebar();
});

// Boot
switchTo(currentId);
document.getElementById("note").focus();
