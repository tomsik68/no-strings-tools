const originalServings = document.getElementById("original-servings");
const desiredServings = document.getElementById("desired-servings");
const ingredientList = document.getElementById("ingredient-list");
const addBtn = document.getElementById("add-ingredient");

const KEY = "recipe-scaler";
const OLD_KEY = "recipe-ingredients";
function loadIngredients() {
  const raw = localStorage.getItem(KEY) ?? localStorage.getItem(OLD_KEY);
  if (raw) {
    const data = JSON.parse(raw);
    if (localStorage.getItem(OLD_KEY) && !localStorage.getItem(KEY)) {
      localStorage.setItem(KEY, raw);
      localStorage.removeItem(OLD_KEY);
    }
    return data;
  }
  return [
    { amount: 2, unit: "cups", name: "flour" },
    { amount: 1, unit: "tsp", name: "salt" },
    { amount: 1, unit: "cup", name: "milk" }
  ];
}
let ingredients = loadIngredients();

function escAttr(t) {
  return String(t ?? "").replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
}
function esc(t) {
  const d = document.createElement("div");
  d.textContent = t ?? "";
  return d.innerHTML;
}

function saveIngredients() {
  localStorage.setItem(KEY, JSON.stringify(ingredients));
}

function getScaleFactor() {
  const original = parseFloat(originalServings.value) || 1;
  const desired = parseFloat(desiredServings.value) || 1;
  return desired / original;
}

function renderIngredients() {
  const scale = getScaleFactor();
  ingredientList.innerHTML = ingredients.map((ing, idx) => {
    const scaledAmount = (ing.amount * scale).toFixed(2).replace(/\.?0+$/, "");
    return `
      <div class="ingredient-row">
        <input type="number" step="0.01" value="${escAttr(ing.amount)}" data-idx="${idx}" data-field="amount" placeholder="Amount" />
        <input type="text" value="${escAttr(ing.unit)}" data-idx="${idx}" data-field="unit" placeholder="Unit" style="flex: 0 0 60px;" />
        <input type="text" value="${escAttr(ing.name)}" data-idx="${idx}" data-field="name" placeholder="Ingredient" />
        <button class="w3-button w3-red w3-small delete-btn" data-idx="${idx}" aria-label="Delete">✕</button>
        <div class="scaled">${esc(scaledAmount)} ${esc(ing.unit)}</div>
      </div>
    `;
  }).join("");

  // Add event listeners
  ingredientList.querySelectorAll("input").forEach(input => {
    input.addEventListener("input", (e) => {
      const idx = parseInt(e.target.getAttribute("data-idx"));
      const field = e.target.getAttribute("data-field");
      ingredients[idx][field] = field === "amount" ? parseFloat(e.target.value) || 0 : e.target.value;
      saveIngredients();
      renderIngredients();
    });
  });

  ingredientList.querySelectorAll(".delete-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const idx = parseInt(e.target.getAttribute("data-idx"));
      ingredients.splice(idx, 1);
      saveIngredients();
      renderIngredients();
    });
  });
}

addBtn.addEventListener("click", () => {
  ingredients.push({ amount: 0, unit: "", name: "" });
  saveIngredients();
  renderIngredients();
});

originalServings.addEventListener("input", renderIngredients);
desiredServings.addEventListener("input", renderIngredients);

renderIngredients();
