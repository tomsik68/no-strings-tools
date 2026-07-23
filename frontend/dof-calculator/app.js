const $ = (id) => document.getElementById(id);

function fmt(m) {
  if (!Number.isFinite(m) || m === Infinity) return "∞";
  if (m >= 10) return m.toFixed(1) + " m";
  if (m >= 1) return m.toFixed(2) + " m";
  return Math.round(m * 1000) + " mm";
}

function render() {
  const f = parseFloat($("fl").value); // mm
  const N = parseFloat($("f").value);
  const s = parseFloat($("dist").value); // m
  const c = parseFloat($("sensor").value); // mm CoC
  if (!(f > 0 && N > 0 && s > 0 && c > 0)) {
    $("out").innerHTML = '<span class="w3-text-grey">Enter values above.</span>';
    return;
  }
  const fM = f / 1000;
  const cM = c / 1000;
  const H = (fM * fM) / (N * cM) + fM; // hyperfocal m
  const Dn = (s * (H - fM)) / (H + s - 2 * fM);
  let Df = (s * (H - fM)) / (H - s);
  if (s >= H) Df = Infinity;
  const total = Df === Infinity ? Infinity : Math.max(0, Df - Dn);

  $("out").innerHTML = `
    <div class="w3-text-grey w3-small">Near limit</div>
    <div style="font-size:22px;font-weight:700;">${fmt(Dn)}</div>
    <div class="w3-text-grey w3-small w3-margin-top">Far limit</div>
    <div style="font-size:22px;font-weight:700;">${fmt(Df)}</div>
    <div class="w3-text-grey w3-small w3-margin-top">Total DoF</div>
    <div style="font-size:22px;font-weight:700;">${fmt(total)}</div>
    <div class="w3-text-grey w3-small w3-margin-top">Hyperfocal</div>
    <div style="font-weight:600;">${fmt(H)}</div>`;
}

["fl", "f", "dist", "sensor"].forEach((id) => $(id).addEventListener("input", render));
$("fl").focus();
render();
