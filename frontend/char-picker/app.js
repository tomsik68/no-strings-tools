const sectionsEl = document.getElementById("sections");
const toast = document.getElementById("toast");

const SECTIONS = {
  "Dashes & hyphens": [
    ["–", "en dash"], ["—", "em dash"], ["−", "minus sign"], ["‐", "hyphen"], ["…", "ellipsis"],
  ],
  Quotes: [
    ["„", "low double quote"], ["“", "left double quote"], ["”", "right double quote"],
    ["‚", "low single quote"], ["‘", "left single quote"], ["’", "right single quote / apostrophe"],
    ["«", "left guillemet"], ["»", "right guillemet"],
  ],
  "Math & science": [
    ["±", "plus-minus"], ["×", "multiplication"], ["÷", "division"], ["≈", "almost equal"],
    ["≠", "not equal"], ["≤", "less or equal"], ["≥", "greater or equal"], ["°", "degree"],
    ["µ", "micro"], ["‰", "per mille"], ["√", "square root"], ["∞", "infinity"],
    ["²", "superscript two"], ["³", "superscript three"], ["½", "one half"], ["⅓", "one third"],
    ["¼", "one quarter"], ["¾", "three quarters"],
  ],
  Arrows: [
    ["←", "left arrow"], ["→", "right arrow"], ["↑", "up arrow"], ["↓", "down arrow"],
    ["↔", "left-right arrow"], ["⇐", "left double arrow"], ["⇒", "right double arrow"], ["↵", "return"],
  ],
  "Currency & legal": [
    ["€", "euro"], ["£", "pound"], ["¥", "yen"], ["¢", "cent"], ["©", "copyright"],
    ["®", "registered"], ["™", "trademark"], ["§", "section"], ["¶", "pilcrow"], ["†", "dagger"],
  ],
  Misc: [
    ["•", "bullet"], ["·", "middle dot"], ["★", "star"], ["☆", "outline star"],
    ["✓", "check mark"], ["✗", "cross mark"], ["♥", "heart"], ["№", "numero"],
  ],
};

for (const [title, chars] of Object.entries(SECTIONS)) {
  const heading = document.createElement("h4");
  heading.textContent = title;
  const grid = document.createElement("div");
  grid.className = "char-grid";
  for (const [ch, name] of chars) {
    const btn = document.createElement("button");
    btn.className = "char-btn";
    btn.textContent = ch;
    btn.title = name;
    btn.setAttribute("aria-label", `Copy ${name}`);
    btn.addEventListener("click", async () => {
      await navigator.clipboard.writeText(ch);
      toast.textContent = `Copied ${ch} (${name})`;
      toast.style.display = "block";
      clearTimeout(toast.hideTimer);
      toast.hideTimer = setTimeout(() => (toast.style.display = "none"), 1500);
    });
    grid.append(btn);
  }
  sectionsEl.append(heading, grid);
}
