const noteInput = document.getElementById("note");
const preview = document.getElementById("preview");

// Configure marked
marked.setOptions({
  breaks: true,
  gfm: true,
  pedantic: false,
});

// Syntax highlight code blocks
marked.setOptions({
  renderer: {
    code(code, lang) {
      if (lang && hljs.getLanguage(lang)) {
        return `<pre><code class="language-${lang} hljs">${hljs.highlight(code, { language: lang }).value}</code></pre>`;
      }
      return `<pre><code class="hljs">${hljs.highlightAuto(code).value}</code></pre>`;
    }
  }
});

function renderPreview() {
  const markdown = noteInput.value;
  const html = marked.parse(markdown);
  preview.innerHTML = html;

  // Add highlight classes if present
  preview.querySelectorAll("pre code").forEach(block => {
    hljs.highlightElement(block);
  });
}

function saveNote() {
  localStorage.setItem("note-taker-content", noteInput.value);
}

// Load from localStorage
const saved = localStorage.getItem("note-taker-content");
if (saved) {
  noteInput.value = saved;
}

// Auto-save on input
noteInput.addEventListener("input", () => {
  saveNote();
  renderPreview();
});

// Initial render
renderPreview();

// Auto-focus
noteInput.focus();
