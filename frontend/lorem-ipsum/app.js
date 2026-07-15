const countInput = document.getElementById("count-input");
const generateBtn = document.getElementById("generate-btn");
const copyBtn = document.getElementById("copy-btn");
const copyFeedback = document.getElementById("copy-feedback");
const output = document.getElementById("output");

const WORDS = ("lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore " +
  "et dolore magna aliqua enim ad minim veniam quis nostrud exercitation ullamco laboris nisi aliquip ex ea " +
  "commodo consequat duis aute irure in reprehenderit voluptate velit esse cillum eu fugiat nulla pariatur " +
  "excepteur sint occaecat cupidatat non proident sunt culpa qui officia deserunt mollit anim id est laborum").split(" ");

const rand = (n) => Math.floor(Math.random() * n);
const word = () => WORDS[rand(WORDS.length)];

function sentence() {
  const words = Array.from({ length: 6 + rand(10) }, word);
  return words.join(" ").replace(/^./, (c) => c.toUpperCase()) + ".";
}

function paragraph(first) {
  const sentences = Array.from({ length: 3 + rand(4) }, sentence);
  if (first) sentences[0] = "Lorem ipsum dolor sit amet, consectetur adipiscing elit.";
  return sentences.join(" ");
}

function generate() {
  const count = Math.min(50, Math.max(1, Number(countInput.value) || 3));
  output.value = Array.from({ length: count }, (_, i) => paragraph(i === 0)).join("\n\n");
  copyFeedback.textContent = "";
}

generateBtn.addEventListener("click", generate);
countInput.addEventListener("input", generate);

copyBtn.addEventListener("click", async () => {
  await navigator.clipboard.writeText(output.value);
  copyFeedback.textContent = "Copied ✓";
});

countInput.focus();
generate();
