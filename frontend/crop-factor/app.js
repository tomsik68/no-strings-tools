const flEl = document.getElementById("fl");
const cropEl = document.getElementById("crop");
const customEl = document.getElementById("custom");
const out = document.getElementById("out");

function render() {
  const fl = parseFloat(flEl.value) || 0;
  const custom = parseFloat(customEl.value);
  const crop = Number.isFinite(custom) && custom > 0 ? custom : parseFloat(cropEl.value);
  if (!(fl > 0 && crop > 0)) {
    out.innerHTML = '<span class="w3-text-grey">Enter a focal length.</span>';
    return;
  }
  const eq = fl * crop;
  out.innerHTML = `
    <div class="w3-text-grey w3-small">Full-frame equivalent</div>
    <div style="font-size:36px;font-weight:700;">${eq % 1 === 0 ? eq : eq.toFixed(1)} mm</div>
    <div class="w3-text-grey w3-small">${fl} mm × ${crop}× crop</div>
    <div class="w3-text-grey w3-small w3-margin-top">Field of view similar to a ${eq.toFixed(0)} mm lens on full frame.</div>`;
}

[flEl, cropEl, customEl].forEach((el) => el.addEventListener("input", render));
flEl.focus();
render();
