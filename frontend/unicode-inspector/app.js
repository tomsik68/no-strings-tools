const textInput = document.getElementById("text-input");
const statsEl = document.getElementById("stats");
const charList = document.getElementById("char-list");
const cleanBtn = document.getElementById("clean-btn");
const cleanFeedback = document.getElementById("clean-feedback");

textInput.focus();

// Invisible or easily-confused characters worth flagging
const SPECIALS = {
  0x0009: "tab",
  0x000a: "newline",
  0x000d: "carriage return",
  0x00a0: "no-break space",
  0x00ad: "soft hyphen",
  0x061c: "arabic letter mark",
  0x180e: "mongolian vowel sep.",
  0x2000: "en quad", 0x2001: "em quad", 0x2002: "en space", 0x2003: "em space",
  0x2004: "1/3 em space", 0x2005: "1/4 em space", 0x2006: "1/6 em space",
  0x2007: "figure space", 0x2008: "punct. space", 0x2009: "thin space", 0x200a: "hair space",
  0x200b: "zero-width space",
  0x200c: "zero-width non-joiner",
  0x200d: "zero-width joiner",
  0x200e: "left-to-right mark",
  0x200f: "right-to-left mark",
  0x2028: "line separator",
  0x2029: "paragraph separator",
  0x202a: "LTR embedding", 0x202b: "RTL embedding", 0x202c: "pop directional",
  0x202d: "LTR override", 0x202e: "RTL override",
  0x202f: "narrow no-break space",
  0x205f: "math space",
  0x2060: "word joiner",
  0x2066: "LTR isolate", 0x2067: "RTL isolate", 0x2068: "first strong isolate", 0x2069: "pop isolate",
  0x3000: "ideographic space",
  0xfeff: "BOM / zero-width NBSP",
};

// Characters "Copy cleaned text" removes (or, for odd spaces, turns into a plain space)
const REMOVE_RE = /[\u00AD\u061C\u180E\u200B-\u200F\u202A-\u202E\u2060\u2066-\u2069\uFEFF]/g;
const SPACE_RE = /[\u00A0\u2000-\u200A\u202F\u205F\u3000]/g;

const MAX_CELLS = 1000;

function update() {
  const text = textInput.value;
  const codepoints = [...text];

  let invisibleCount = 0;
  charList.innerHTML = "";
  const frag = document.createDocumentFragment();

  for (const ch of codepoints.slice(0, MAX_CELLS)) {
    const cp = ch.codePointAt(0);
    const label = SPECIALS[cp];
    const cell = document.createElement("div");
    cell.className = "char-cell";

    const glyph = document.createElement("div");
    glyph.className = "glyph";
    glyph.textContent = ch === " " ? "␣" : label ? "·" : ch;

    const code = document.createElement("div");
    code.className = "code";
    code.textContent = "U+" + cp.toString(16).toUpperCase().padStart(4, "0");

    cell.append(glyph, code);
    if (label) {
      if (ch !== "\n" && ch !== "\t" && ch !== "\r") invisibleCount++;
      cell.classList.add("invisible-char");
      const lab = document.createElement("div");
      lab.className = "label";
      lab.textContent = label;
      cell.append(lab);
    }
    frag.append(cell);
  }
  charList.append(frag);

  // Count flagged chars beyond the render cap too
  for (const ch of codepoints.slice(MAX_CELLS)) {
    const cp = ch.codePointAt(0);
    if (SPECIALS[cp] && ch !== "\n" && ch !== "\t" && ch !== "\r") invisibleCount++;
  }

  const utf8Bytes = new TextEncoder().encode(text).length;
  statsEl.innerHTML = "";
  const stats = [
    `${codepoints.length} codepoints`,
    `${text.length} UTF-16 units`,
    `${utf8Bytes} UTF-8 bytes`,
    `${invisibleCount} hidden/odd`,
  ];
  for (const s of stats) {
    const span = document.createElement("span");
    span.textContent = s;
    if (s.endsWith("hidden/odd") && invisibleCount > 0) span.className = "w3-text-orange";
    statsEl.append(span);
  }
  if (codepoints.length > MAX_CELLS) {
    const note = document.createElement("span");
    note.textContent = `(showing first ${MAX_CELLS})`;
    statsEl.append(note);
  }

  cleanBtn.style.display = invisibleCount > 0 ? "" : "none";
  cleanFeedback.textContent = "";
}

cleanBtn.addEventListener("click", async () => {
  const cleaned = textInput.value.replace(REMOVE_RE, "").replace(SPACE_RE, " ");
  await navigator.clipboard.writeText(cleaned);
  cleanFeedback.textContent = " Copied without hidden characters ✓";
});

textInput.addEventListener("input", update);
update();
