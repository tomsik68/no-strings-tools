let mode = "paint";
const $ = (id) => document.getElementById(id);

function render() {
  const L = parseFloat($("len").value) || 0;
  const W = parseFloat($("wid").value) || 0;
  const H = parseFloat($("hei").value) || 0;

  if (mode === "paint") {
    const coats = parseInt($("coats").value, 10) || 2;
    const cov = parseFloat($("coverage").value) || 10;
    const can = parseFloat($("can").value) || 2.5;
    const doors = parseFloat($("doors").value) || 0;
    const wall = Math.max(0, 2 * (L + W) * H - doors);
    const litres = (wall * coats) / cov;
    const cans = Math.ceil(litres / can);
    $("out").innerHTML = `
      <div class="w3-text-grey w3-small">Wall area</div>
      <div style="font-size: 22px; font-weight: 700;">${wall.toFixed(1)} m²</div>
      <div class="w3-text-grey w3-small w3-margin-top">Paint needed (${coats} coats)</div>
      <div style="font-size: 22px; font-weight: 700;">${litres.toFixed(1)} L</div>
      <div class="w3-text-grey w3-small w3-margin-top">Buy</div>
      <div style="font-size: 28px; font-weight: 700;">${cans} × ${can} L can${cans !== 1 ? "s" : ""}</div>`;
  } else {
    const waste = (parseFloat($("waste").value) || 0) / 100;
    const area = L * W;
    const buy = area * (1 + waste);
    $("out").innerHTML = `
      <div class="w3-text-grey w3-small">Floor area</div>
      <div style="font-size: 22px; font-weight: 700;">${area.toFixed(2)} m²</div>
      <div class="w3-text-grey w3-small w3-margin-top">With waste</div>
      <div style="font-size: 28px; font-weight: 700;">${buy.toFixed(2)} m²</div>
      <div class="w3-text-grey w3-small">≈ ${(buy * 10.764).toFixed(1)} ft²</div>`;
  }
}

function setMode(m) {
  mode = m;
  $("mode-paint").className = "w3-bar-item w3-button " + (m === "paint" ? "w3-blue" : "w3-white w3-border");
  $("mode-floor").className = "w3-bar-item w3-button " + (m === "floor" ? "w3-blue" : "w3-white w3-border");
  $("paint-opts").hidden = m !== "paint";
  $("floor-opts").hidden = m !== "floor";
  $("height-wrap").hidden = m !== "paint";
  render();
}

$("mode-paint").addEventListener("click", () => setMode("paint"));
$("mode-floor").addEventListener("click", () => setMode("floor"));
["len", "wid", "hei", "coats", "coverage", "can", "doors", "waste"].forEach((id) => {
  $(id).addEventListener("input", render);
});
$("len").focus();
render();
