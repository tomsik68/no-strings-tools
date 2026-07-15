const countInput = document.getElementById("count-input");
const generateBtn = document.getElementById("generate-btn");
const copyAllBtn = document.getElementById("copy-all-btn");
const uuidList = document.getElementById("uuid-list");
const copyFeedback = document.getElementById("copy-feedback");

let uuids = [];

generateBtn.addEventListener("click", generate);
copyAllBtn.addEventListener("click", copyAll);

function generateUuid() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function generate() {
  const count = parseInt(countInput.value) || 1;
  uuids = Array.from({ length: count }, () => generateUuid());
  render();
}

function render() {
  if (uuids.length === 0) {
    uuidList.innerHTML = '<div style="padding: 20px; text-align: center; color: #999;">Click Generate to create UUIDs</div>';
    return;
  }

  uuidList.innerHTML = uuids
    .map(
      (uuid, index) => `
        <div class="uuid-item">
          <span class="uuid-value">${uuid}</span>
          <button class="uuid-copy-btn" data-index="${index}">Copy</button>
        </div>
      `
    )
    .join("");

  uuidList.querySelectorAll(".uuid-copy-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const index = parseInt(e.target.getAttribute("data-index"));
      navigator.clipboard.writeText(uuids[index]).then(() => {
        copyFeedback.textContent = "Copied!";
        setTimeout(() => {
          copyFeedback.textContent = "";
        }, 1500);
      });
    });
  });
}

function copyAll() {
  if (uuids.length === 0) return;
  navigator.clipboard.writeText(uuids.join("\n")).then(() => {
    copyFeedback.textContent = "All UUIDs copied!";
    setTimeout(() => {
      copyFeedback.textContent = "";
    }, 1500);
  });
}

countInput.focus();
generate();
