const morseMap = {
  "A": ".-", "B": "-...", "C": "-.-.", "D": "-..", "E": ".", "F": "..-.", "G": "--.", "H": "....", "I": "..", "J": ".---", "K": "-.-", "L": ".-..", "M": "--", "N": "-.", "O": "---", "P": ".--.", "Q": "--.-", "R": ".-.", "S": "...", "T": "-", "U": "..-", "V": "...-", "W": ".--", "X": "-..-", "Y": "-.--", "Z": "--..",
  "0": "-----", "1": ".----", "2": "..---", "3": "...--", "4": "....-", "5": ".....", "6": "-....", "7": "--...", "8": "---..", "9": "----.",
  ".": ".-.-.-", ",": "--..--", "?": "..--..", "'": ".----.", "!": "-.-.--", "/": "-..-.", "(": "-.--.", ")": "-.--.-", "&": ".-...", ":": "---...", ";": "-.-.-.", "=": "-...-", "+": ".-.-.", "-": "-....-", "_": "..--.-", "\"": ".-..-.", "$": "...-..-", "@": ".--.-."
};

const reverseMap = Object.fromEntries(Object.entries(morseMap).map(([k, v]) => [v, k]));

const encodeInput = document.getElementById("encode-input");
const encodeOutput = document.getElementById("encode-output");
const decodeInput = document.getElementById("decode-input");
const decodeOutput = document.getElementById("decode-output");
const morseTable = document.getElementById("morse-table");

function encode(text) {
  // Words are separated by " / " in morse
  return text.trim().toUpperCase().split(/\s+/)
    .map(word => word.split("").map(char => morseMap[char] || "?").join(" "))
    .join(" / ");
}

function decode(morse) {
  return morse.trim().split(/\s*\/\s*/)
    .map(word => word.split(/\s+/).map(code => reverseMap[code] || "?").join(""))
    .join(" ");
}

encodeInput.addEventListener("input", () => {
  encodeOutput.textContent = encode(encodeInput.value) || "--";
});

decodeInput.addEventListener("input", () => {
  decodeOutput.textContent = decode(decodeInput.value) || "--";
});

// Build reference table
let html = "";
Object.entries(morseMap).forEach(([char, code]) => {
  html += `<tr><td>${char}</td><td>${code}</td></tr>`;
});
morseTable.innerHTML = html;

// Tab switching
document.querySelectorAll(".tab").forEach(tab => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
    document.querySelectorAll(".tab-content").forEach(c => c.classList.remove("active"));
    tab.classList.add("active");
    document.getElementById(tab.getAttribute("data-tab")).classList.add("active");
  });
});
