const $ = (id) => document.getElementById(id);

function render() {
  const sex = $("sex").value;
  const age = parseFloat($("age").value);
  const h = parseFloat($("h").value);
  const w = parseFloat($("w").value);
  const mult = parseFloat($("act").value);
  if (!(age > 0 && h > 0 && w > 0)) {
    $("out").textContent = "—";
    return;
  }
  // Mifflin–St Jeor
  let bmr = 10 * w + 6.25 * h - 5 * age;
  bmr += sex === "m" ? 5 : -161;
  const tdee = bmr * mult;
  $("out").innerHTML = `
    <div class="w3-text-grey w3-small">BMR (at rest)</div>
    <div style="font-size:28px;font-weight:700;">${Math.round(bmr)} kcal</div>
    <div class="w3-text-grey w3-small w3-margin-top">TDEE (maintenance)</div>
    <div style="font-size:28px;font-weight:700;">${Math.round(tdee)} kcal</div>
    <div class="w3-text-grey w3-small w3-margin-top">Rough targets</div>
    <div>Cut ≈ <strong>${Math.round(tdee - 500)}</strong> · Bulk ≈ <strong>${Math.round(tdee + 300)}</strong></div>`;
}

["sex", "age", "h", "w", "act"].forEach((id) => $(id).addEventListener("input", render));
$("w").focus();
render();
