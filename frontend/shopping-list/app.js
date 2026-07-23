const itemInput = document.getElementById("item-input");
const addBtn = document.getElementById("add-btn");
const itemsList = document.getElementById("items-list");

const KEY = "shopping-list";
const OLD_KEY = "shopping-items";
if (!localStorage.getItem(KEY) && localStorage.getItem(OLD_KEY)) {
  localStorage.setItem(KEY, localStorage.getItem(OLD_KEY));
  localStorage.removeItem(OLD_KEY);
}
let items = JSON.parse(localStorage.getItem(KEY) || "[]");

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

itemInput.focus();

function render() {
  itemsList.innerHTML = items
    .map(
      (item, index) => `
        <li style="padding: 12px 0; display: flex; align-items: center; gap: 8px; border-bottom: 1px solid #ddd;">
          <input
            type="checkbox"
            ${item.bought ? "checked" : ""}
            data-index="${index}"
            class="item-checkbox"
            style="width: 18px; height: 18px; cursor: pointer;"
          />
          <span
            data-index="${index}"
            class="item-text"
            style="flex: 1; cursor: pointer; ${item.bought ? "text-decoration: line-through; color: #999;" : ""}"
          >
            ${escapeHtml(item.text)}
          </span>
          <button
            data-index="${index}"
            class="delete-btn w3-button w3-red w3-small w3-round"
            style="padding: 4px 8px; font-size: 12px;"
          >
            Remove
          </button>
        </li>
      `
    )
    .join("");

  document.querySelectorAll(".item-checkbox").forEach((checkbox) => {
    checkbox.addEventListener("change", toggleBought);
  });

  document.querySelectorAll(".item-text").forEach((text) => {
    text.addEventListener("click", toggleBought);
  });

  document.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.addEventListener("click", deleteItem);
  });
}

function save() {
  localStorage.setItem(KEY, JSON.stringify(items));
  render();
}

function addItem() {
  const text = itemInput.value.trim();
  if (!text) return;

  items.push({ text, bought: false });
  itemInput.value = "";
  itemInput.focus();
  save();
}

function toggleBought(e) {
  const index = parseInt(
    e.target.getAttribute("data-index") ||
    e.target.closest("input, span").getAttribute("data-index")
  );
  items[index].bought = !items[index].bought;
  save();
}

function deleteItem(e) {
  const index = parseInt(e.target.getAttribute("data-index"));
  items.splice(index, 1);
  save();
}

addBtn.addEventListener("click", addItem);
itemInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") addItem();
});

render();
