const widthEl = document.getElementById("width-px");
const heightEl = document.getElementById("height-px");
const dpiEl = document.getElementById("dpi");
const results = document.getElementById("results");

function round(n, d = 2) {
  const f = 10 ** d;
  return Math.round(n * f) / f;
}

function render() {
  const w = parseFloat(widthEl.value);
  const h = parseFloat(heightEl.value);
  const dpi = parseFloat(dpiEl.value);

  if (!(w > 0 && h > 0 && dpi > 0)) {
    results.innerHTML = '<p class="w3-text-grey">Enter positive width, height and DPI.</p>';
    return;
  }

  const win = w / dpi;
  const hin = h / dpi;
  const wcm = win * 2.54;
  const hcm = hin * 2.54;
  const wmm = wcm * 10;
  const hmm = hcm * 10;
  const megapixels = (w * h) / 1e6;

  results.innerHTML = `
    <div class="w3-panel w3-white w3-round w3-border" style="padding: 16px;">
      <div class="w3-text-grey w3-small">Print size</div>
      <div style="font-size: 22px; font-weight: 700; margin: 4px 0;">${round(win)}" × ${round(hin)}"</div>
      <div style="font-size: 18px; font-weight: 600;">${round(wcm)} × ${round(hcm)} cm</div>
      <div class="w3-text-grey w3-small" style="margin-top: 8px;">${round(wmm, 1)} × ${round(hmm, 1)} mm · ${round(megapixels, 1)} MP</div>
    </div>
    <div class="w3-panel w3-white w3-round w3-border" style="padding: 12px 16px;">
      <div class="w3-text-grey w3-small">At other DPI (same pixels)</div>
      <table class="w3-table w3-small" style="margin-top: 4px;">
        ${[72, 150, 300, 600].map((d) => {
          const wi = w / d, hi = h / d;
          return `<tr><td>${d} DPI</td><td><strong>${round(wi)}" × ${round(hi)}"</strong></td><td>${round(wi * 2.54)} × ${round(hi * 2.54)} cm</td></tr>`;
        }).join("")}
      </table>
    </div>`;
}

[widthEl, heightEl, dpiEl].forEach((el) => el.addEventListener("input", render));

document.querySelectorAll(".dpi-preset").forEach((btn) => {
  btn.addEventListener("click", () => {
    dpiEl.value = btn.dataset.dpi;
    render();
  });
});

widthEl.focus();
render();
