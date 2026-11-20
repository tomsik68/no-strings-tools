const passwordInput = document.getElementById("password-input");
const strengthMeter = document.getElementById("strength-meter");
const result = document.getElementById("result");

function calculateEntropy(password) {
  let charset = 0;
  if (/[a-z]/.test(password)) charset += 26;
  if (/[A-Z]/.test(password)) charset += 26;
  if (/[0-9]/.test(password)) charset += 10;
  if (/[^a-zA-Z0-9]/.test(password)) charset += 32;

  const entropy = password.length * Math.log2(charset);
  const crackTime = Math.pow(2, entropy) / 1e9 / 3600 / 24 / 365; // years at 1B guesses/sec

  let strength = "Weak";
  let color = "#c62828";
  let percent = 20;

  if (entropy >= 80) {
    strength = "Very Strong";
    color = "#2e7d32";
    percent = 100;
  } else if (entropy >= 60) {
    strength = "Strong";
    color = "#8bc34a";
    percent = 80;
  } else if (entropy >= 40) {
    strength = "Fair";
    color = "#ffc107";
    percent = 60;
  } else if (entropy >= 20) {
    strength = "Weak";
    color = "#ff9800";
    percent = 40;
  }

  return { entropy: entropy.toFixed(1), strength, color, percent, crackTime };
}

// Shannon entropy from the actual character frequencies in the text.
function shannon(text) {
  const chars = [...text], counts = {};
  chars.forEach((c) => (counts[c] = (counts[c] || 0) + 1));
  const perChar = -Object.values(counts).reduce((h, n) => h + (n / chars.length) * Math.log2(n / chars.length), 0);
  return { perChar: perChar.toFixed(3), total: (perChar * chars.length).toFixed(1) };
}

passwordInput.addEventListener("input", (e) => {
  if (!e.target.value) {
    strengthMeter.style.width = "0%";
    strengthMeter.textContent = "Weak";
    strengthMeter.style.background = "#d32f2f";
    result.textContent = "";
    return;
  }

  const { entropy, strength, color, percent, crackTime } = calculateEntropy(e.target.value);

  strengthMeter.style.width = percent + "%";
  strengthMeter.textContent = strength;
  strengthMeter.style.background = color;

  const sh = shannon(e.target.value);
  const crackTimeStr = crackTime > 1e9 ? "~forever" : crackTime.toFixed(0) + " years";

  result.innerHTML = `
    <div class="result-row"><span>Entropy</span><span>${entropy} bits</span></div>
    <div class="result-row"><span>Length</span><span>${e.target.value.length} chars</span></div>
    <div class="result-row"><span>Strength</span><span>${strength}</span></div>
    <div class="result-row"><span>Crack Time</span><span>${crackTimeStr}</span></div>
    <div class="result-row"><span>Shannon entropy</span><span>${sh.perChar} bits/char</span></div>
    <div class="result-row"><span>Shannon total</span><span>${sh.total} bits</span></div>
  `;
});
