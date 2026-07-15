const passwordInput = document.getElementById("password-input");
const textInput = document.getElementById("text-input");
const encryptBtn = document.getElementById("encrypt-btn");
const decryptBtn = document.getElementById("decrypt-btn");
const copyBtn = document.getElementById("copy-btn");
const clearBtn = document.getElementById("clear-btn");
const outputText = document.getElementById("output-text");
const feedback = document.getElementById("feedback");

passwordInput.focus();

encryptBtn.addEventListener("click", encrypt);
decryptBtn.addEventListener("click", decrypt);
copyBtn.addEventListener("click", copyOutput);
clearBtn.addEventListener("click", clear);

function encrypt() {
  const password = passwordInput.value;
  const text = textInput.value;

  if (!password) {
    showFeedback("Please enter a password", "error");
    return;
  }

  if (!text) {
    showFeedback("Please enter text to encrypt", "error");
    return;
  }

  try {
    const encrypted = CryptoJS.AES.encrypt(text, password).toString();
    displayOutput(encrypted);
    showFeedback("Encrypted successfully!");
  } catch (error) {
    showFeedback("Encryption failed: " + error.message, "error");
  }
}

function decrypt() {
  const password = passwordInput.value;
  const text = textInput.value;

  if (!password) {
    showFeedback("Please enter a password", "error");
    return;
  }

  if (!text) {
    showFeedback("Please enter text to decrypt", "error");
    return;
  }

  try {
    const decrypted = CryptoJS.AES.decrypt(text, password).toString(CryptoJS.enc.Utf8);
    if (!decrypted) {
      showFeedback("Decryption failed: wrong password or invalid ciphertext", "error");
      return;
    }
    displayOutput(decrypted);
    showFeedback("Decrypted successfully!");
  } catch (error) {
    showFeedback("Decryption failed: " + error.message, "error");
  }
}

function copyOutput() {
  const text = outputText.textContent;
  if (text === "Output will appear here..." || !text) {
    showFeedback("Nothing to copy", "error");
    return;
  }

  navigator.clipboard.writeText(text).then(() => {
    showFeedback("Copied to clipboard!");
  });
}

function clear() {
  textInput.value = "";
  outputText.innerHTML = '<span class="empty-output">Output will appear here...</span>';
  feedback.textContent = "";
  textInput.focus();
}

function displayOutput(text) {
  outputText.textContent = text;
}

function showFeedback(message, type = "success") {
  feedback.textContent = message;
  feedback.style.color = type === "error" ? "#f44336" : "#4caf50";
  setTimeout(() => {
    feedback.textContent = "";
  }, 3000);
}
