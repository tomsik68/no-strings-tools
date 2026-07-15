const input = document.getElementById("iban-input");
const verdict = document.getElementById("verdict");
const formatted = document.getElementById("formatted");
const country = document.getElementById("country");

input.focus();

// IBAN registry lengths per country code
const LENGTHS = {
  AD: 24, AE: 23, AL: 28, AT: 20, AZ: 28, BA: 20, BE: 16, BG: 22, BH: 22, BI: 27,
  BR: 29, BY: 28, CH: 21, CR: 22, CY: 28, CZ: 24, DE: 22, DJ: 27, DK: 18, DO: 28,
  EE: 20, EG: 29, ES: 24, FI: 18, FO: 18, FR: 27, GB: 22, GE: 22, GI: 23, GL: 18,
  GR: 27, GT: 28, HR: 21, HU: 28, IE: 22, IL: 23, IQ: 23, IS: 26, IT: 27, JO: 30,
  KW: 30, KZ: 20, LB: 28, LC: 32, LI: 21, LT: 20, LU: 20, LV: 21, LY: 25, MC: 27,
  MD: 24, ME: 22, MK: 19, MN: 20, MR: 27, MT: 31, MU: 30, NI: 28, NL: 18, NO: 15,
  PK: 24, PL: 28, PS: 29, PT: 25, QA: 29, RO: 24, RS: 22, RU: 33, SA: 24, SC: 31,
  SD: 18, SE: 24, SI: 19, SK: 24, SM: 27, SO: 23, ST: 25, SV: 28, TL: 23, TN: 24,
  TR: 26, UA: 29, VA: 22, VG: 24, XK: 20,
};

const regionNames = new Intl.DisplayNames(["en"], { type: "region" });

function mod97(s) {
  let rem = 0;
  for (const ch of s) {
    const v = ch >= "A" ? String(ch.charCodeAt(0) - 55) : ch;
    for (const d of v) rem = (rem * 10 + Number(d)) % 97;
  }
  return rem;
}

function check(iban) {
  if (!/^[A-Z]{2}\d{2}[A-Z0-9]+$/.test(iban)) return "That doesn't look like an IBAN — it should start with a country code and two digits.";
  const cc = iban.slice(0, 2);
  const expected = LENGTHS[cc];
  if (!expected) return `Unknown country code "${cc}".`;
  if (iban.length !== expected) return `${cc} IBANs have ${expected} characters — this one has ${iban.length}.`;
  if (mod97(iban.slice(4) + iban.slice(0, 4)) !== 1) return "The checksum doesn't match — there's a typo somewhere.";
  return null;
}

function update() {
  const iban = input.value.replace(/[\s-]/g, "").toUpperCase();
  if (!iban) {
    verdict.style.display = "none";
    formatted.textContent = "";
    country.textContent = "";
    return;
  }

  const error = check(iban);
  verdict.style.display = "";
  verdict.className = "verdict " + (error ? "invalid" : "valid");
  verdict.textContent = error ? "✗ Invalid" : "✓ Valid IBAN";
  formatted.textContent = error ? error : iban.replace(/(.{4})/g, "$1 ").trim();

  let countryName = "";
  if (!error) {
    try { countryName = regionNames.of(iban.slice(0, 2)); } catch { /* non-ISO codes like XK */ }
  }
  country.textContent = countryName || "";
}

input.addEventListener("input", update);
