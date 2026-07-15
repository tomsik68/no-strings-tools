const masterPassword = document.getElementById("master-password");
const siteName = document.getElementById("site-name");
const login = document.getElementById("login");
const passwordDisplay = document.getElementById("password-display");
const passwordValue = document.getElementById("password-value");
const lengthSlider = document.getElementById("length-slider");
const lengthValue = document.getElementById("length-value");
const useUppercase = document.getElementById("use-uppercase");
const useLowercase = document.getElementById("use-lowercase");
const useNumbers = document.getElementById("use-numbers");
const useSymbols = document.getElementById("use-symbols");
const copyFeedback = document.getElementById("copy-feedback");
const toggleVisibility = document.getElementById("toggle-visibility");

let actualPassword = "";
let isVisible = false;

masterPassword.focus();

// Event listeners
masterPassword.addEventListener("input", generatePassword);
siteName.addEventListener("input", generatePassword);
login.addEventListener("input", generatePassword);
lengthSlider.addEventListener("input", () => {
  lengthValue.textContent = lengthSlider.value;
  generatePassword();
});
useUppercase.addEventListener("change", generatePassword);
useLowercase.addEventListener("change", generatePassword);
useNumbers.addEventListener("change", generatePassword);
useSymbols.addEventListener("change", generatePassword);

passwordDisplay.addEventListener("click", copyPassword);
toggleVisibility.addEventListener("click", (e) => {
  e.stopPropagation();
  isVisible = !isVisible;
  updatePasswordDisplay();
  toggleVisibility.textContent = isVisible ? "🙈" : "👁️";
});

// --- LessPass v2 algorithm (deterministic, compatible with lesspass.com) ---
// PBKDF2-SHA256(master, site+login+counter, 100k iterations) -> big integer,
// then consume it digit-by-digit to pick characters.

const CHARACTER_SUBSETS = {
  lowercase: "abcdefghijklmnopqrstuvwxyz",
  uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  digits: "0123456789",
  symbols: "!\"#$%&'()*+,-./:;<=>?@[\\]^_`{|}~",
};
const RULE_ORDER = ["lowercase", "uppercase", "digits", "symbols"];

async function calcEntropy(site, user, master, counter) {
  const salt = site + user + counter.toString(16);
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(master),
    "PBKDF2",
    false,
    ["deriveBits"]
  );
  const bits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: new TextEncoder().encode(salt),
      iterations: 100000,
      hash: "SHA-256",
    },
    key,
    256
  );
  const hex = Array.from(new Uint8Array(bits))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return BigInt("0x" + hex);
}

function consumeEntropy(generated, quotient, charset, maxLength) {
  while (generated.length < maxLength) {
    const remainder = quotient % BigInt(charset.length);
    quotient = quotient / BigInt(charset.length);
    generated += charset[Number(remainder)];
  }
  return { value: generated, entropy: quotient };
}

function renderPassword(entropy, rules, length) {
  const setOfCharacters = rules.map((r) => CHARACTER_SUBSETS[r]).join("");
  let result = consumeEntropy("", entropy, setOfCharacters, length - rules.length);

  // One guaranteed character per selected rule
  let charactersToAdd = "";
  let remaining = result.entropy;
  for (const rule of rules) {
    const picked = consumeEntropy("", remaining, CHARACTER_SUBSETS[rule], 1);
    charactersToAdd += picked.value;
    remaining = picked.entropy;
  }

  // Insert them at pseudo-random positions
  let password = result.value;
  for (const char of charactersToAdd) {
    const position = Number(remaining % BigInt(password.length));
    remaining = remaining / BigInt(password.length);
    password = password.substring(0, position) + char + password.substring(position);
  }
  return password;
}

let generateToken = 0;

async function generatePassword() {
  const master = masterPassword.value;
  const site = siteName.value;
  const user = login.value;

  const rules = RULE_ORDER.filter((rule) => ({
    lowercase: useLowercase.checked,
    uppercase: useUppercase.checked,
    digits: useNumbers.checked,
    symbols: useSymbols.checked,
  })[rule]);

  if (!master || !site || !user || rules.length === 0) {
    actualPassword = "";
    updatePasswordDisplay();
    return;
  }

  const token = ++generateToken;
  try {
    const entropy = await calcEntropy(site, user, master, 1);
    if (token !== generateToken) return; // stale result, newer input arrived
    actualPassword = renderPassword(entropy, rules, parseInt(lengthSlider.value));
    updatePasswordDisplay();
  } catch (error) {
    actualPassword = "";
    updatePasswordDisplay();
    console.error("Password generation error:", error);
  }
}

function updatePasswordDisplay() {
  if (!actualPassword) {
    passwordValue.textContent = "-";
    return;
  }

  if (isVisible) {
    passwordValue.textContent = actualPassword;
  } else {
    passwordValue.textContent = "•".repeat(actualPassword.length);
  }
}

function copyPassword() {
  // Copy the real password, not the displayed text (which may be ••• dots)
  if (!actualPassword) return;

  navigator.clipboard.writeText(actualPassword).then(() => {
    copyFeedback.textContent = "Copied!";
    setTimeout(() => {
      copyFeedback.textContent = "";
    }, 2000);
  });
}

generatePassword();
