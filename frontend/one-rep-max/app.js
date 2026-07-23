const wEl = document.getElementById("weight");
const rEl = document.getElementById("reps");
const out = document.getElementById("out");

function render() {
  const w = parseFloat(wEl.value) || 0;
  const r = parseInt(rEl.value, 10) || 0;
  if (!(w > 0 && r >= 1)) {
    out.innerHTML = '<p class="w3-text-grey">Enter weight and reps.</p>';
    return;
  }
  if (r === 1) {
    out.innerHTML = `<div class="w3-panel w3-white w3-round w3-border" style="padding:16px;"><div style="font-size:28px;font-weight:700;">${w.toFixed(1)}</div><div class="w3-text-grey w3-small">That's already a 1RM</div></div>`;
    return;
  }
  if (r > 12) {
    out.innerHTML = '<p class="w3-text-orange">Estimates get unreliable above ~12 reps. Use a heavier set if you can.</p>';
  }
  const epley = w * (1 + r / 30);
  const brzycki = r >= 37 ? epley : w * (36 / (37 - r));
  const avg = (epley + brzycki) / 2;
  const pcts = [0.95, 0.9, 0.85, 0.8, 0.75, 0.7, 0.65, 0.6];
  out.innerHTML = `
    <div class="w3-panel w3-white w3-round w3-border" style="padding:16px;">
      <div class="w3-text-grey w3-small">Estimated 1RM (average)</div>
      <div style="font-size:32px;font-weight:700;">${avg.toFixed(1)}</div>
      <div class="w3-text-grey w3-small">Epley ${epley.toFixed(1)} · Brzycki ${brzycki.toFixed(1)}</div>
    </div>
    <div class="w3-panel w3-white w3-round w3-border" style="padding:12px 16px;">
      <div class="w3-text-grey w3-small w3-margin-bottom">Training loads</div>
      <table class="w3-table w3-small">
        ${pcts.map((p) => `<tr><td>${Math.round(p * 100)}%</td><td><strong>${(avg * p).toFixed(1)}</strong></td></tr>`).join("")}
      </table>
    </div>`;
}

wEl.addEventListener("input", render);
rEl.addEventListener("input", render);
wEl.focus();
render();
