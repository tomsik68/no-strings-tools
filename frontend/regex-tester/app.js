const patternInput = document.getElementById("pattern");
const textInput = document.getElementById("text");
const flagG = document.getElementById("flag-g");
const flagI = document.getElementById("flag-i");
const flagM = document.getElementById("flag-m");
const results = document.getElementById("results");

function escapeHtml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function testRegex() {
  const pattern = patternInput.value;
  const text = textInput.value;
  let flags = "";

  if (flagG.checked) flags += "g";
  if (flagI.checked) flags += "i";
  if (flagM.checked) flags += "m";

  if (!pattern) {
    results.innerHTML = "";
    return;
  }

  try {
    const regex = new RegExp(pattern, flags);
    const matches = [];
    let match;

    if (flagG.checked) {
      while ((match = regex.exec(text)) !== null) {
        matches.push({ text: match[0], index: match.index, groups: match.slice(1) });
        // Zero-width match: advance manually or exec() loops forever
        if (match[0] === "") regex.lastIndex++;
      }
    } else {
      match = regex.exec(text);
      if (match) {
        matches.push({ text: match[0], index: match.index, groups: match.slice(1) });
      }
    }

    if (matches.length === 0) {
      results.innerHTML = '<div style="color: #666;">No matches found</div>';
      return;
    }

    let html = `<div style="margin-bottom: 12px; color: #4caf50; font-weight: 600;">✓ ${matches.length} match${matches.length !== 1 ? "es" : ""}</div>`;
    html += '<div class="match-list">';

    matches.forEach((m, idx) => {
      html += `<div class="match-item">
        <strong>#${idx + 1}:</strong> "${escapeHtml(m.text)}" <span style="color: #999;">(pos ${m.index})</span>
        ${m.groups.length > 0 ? `<div style="margin-top: 4px; color: #666;">Groups: ${m.groups.map((g, i) => `$${i + 1}="${escapeHtml(g ?? "")}"`).join(", ")}</div>` : ""}
      </div>`;
    });

    html += "</div>";

    // Highlight matches: build escaped HTML segment by segment
    let highlightedText = "";
    let cursor = 0;
    matches.forEach(m => {
      highlightedText += escapeHtml(text.substring(cursor, m.index));
      highlightedText += `<span class="match">${escapeHtml(m.text)}</span>`;
      cursor = m.index + m.text.length;
    });
    highlightedText += escapeHtml(text.substring(cursor));

    html += `<h4 style="margin-top: 16px;">Highlighted Text</h4>
             <div style="background: white; padding: 12px; border-radius: 4px; border: 1px solid #ddd; font-size: 13px; line-height: 1.6; word-break: break-all;">${highlightedText}</div>`;

    results.innerHTML = html;
  } catch (error) {
    results.innerHTML = `<div class="error">❌ ${escapeHtml(error.message)}</div>`;
  }
}

patternInput.addEventListener("input", testRegex);
textInput.addEventListener("input", testRegex);
flagG.addEventListener("change", testRegex);
flagI.addEventListener("change", testRegex);
flagM.addEventListener("change", testRegex);

testRegex();
