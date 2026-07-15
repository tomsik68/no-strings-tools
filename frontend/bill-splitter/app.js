const payerInput = document.getElementById("payer-input");
const addItemBtn = document.getElementById("add-item-btn");
const itemstbody = document.getElementById("items-tbody");
const summaryContent = document.getElementById("summary-content");

let items = JSON.parse(localStorage.getItem("bill-items")) || [];
let payer = localStorage.getItem("bill-payer") || "";

payerInput.value = payer;
payerInput.focus();

payerInput.addEventListener("input", () => {
  payer = payerInput.value;
  localStorage.setItem("bill-payer", payer);
  updateSummary();
});

addItemBtn.addEventListener("click", () => {
  items.push({ description: "", price: "", buyer: "" });
  saveAndRender();
  // Focus the new description input
  setTimeout(() => {
    const inputs = itemstbody.querySelectorAll("input");
    if (inputs.length > 0) {
      inputs[inputs.length - 3].focus();
    }
  }, 0);
});

function saveAndRender() {
  localStorage.setItem("bill-items", JSON.stringify(items));
  renderTable();
  updateSummary();
}

function renderTable() {
  itemstbody.innerHTML = items
    .map(
      (item, index) => `
        <tr>
          <td>
            <input
              type="text"
              value="${escapeHtml(item.description)}"
              placeholder="Item name..."
              data-index="${index}"
              data-field="description"
            />
          </td>
          <td>
            <input
              type="number"
              step="0.01"
              value="${item.price}"
              placeholder="0.00"
              data-index="${index}"
              data-field="price"
            />
          </td>
          <td>
            <input
              type="text"
              value="${escapeHtml(item.buyer)}"
              placeholder="Buyer name..."
              data-index="${index}"
              data-field="buyer"
            />
          </td>
          <td>
            <button class="delete-btn" data-index="${index}">Delete</button>
          </td>
        </tr>
      `
    )
    .join("");

  attachEventListeners();
}

function attachEventListeners() {
  itemstbody.querySelectorAll("input").forEach((input) => {
    input.addEventListener("input", (e) => {
      const index = parseInt(e.target.getAttribute("data-index"));
      const field = e.target.getAttribute("data-field");
      items[index][field] = e.target.value;
      localStorage.setItem("bill-items", JSON.stringify(items));
      updateSummary();
    });
  });

  itemstbody.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const index = parseInt(e.target.getAttribute("data-index"));
      items.splice(index, 1);
      saveAndRender();
    });
  });
}

function updateSummary() {
  if (items.length === 0) {
    summaryContent.innerHTML = "No items yet.";
    return;
  }

  const totalBill = items.reduce((sum, item) => sum + (parseFloat(item.price) || 0), 0);

  const byBuyer = {};
  items.forEach((item) => {
    if (item.buyer && item.price && item.buyer !== payer) {
      if (!byBuyer[item.buyer]) {
        byBuyer[item.buyer] = 0;
      }
      byBuyer[item.buyer] += parseFloat(item.price) || 0;
    }
  });

  if (Object.keys(byBuyer).length === 0) {
    summaryContent.innerHTML = `<div class="total">Total: $${totalBill.toFixed(2)}</div>`;
    return;
  }

  const summary = Object.entries(byBuyer)
    .map(
      ([buyer, amount]) =>
        `<div class="summary-item"><strong>${escapeHtml(buyer)} owes ${escapeHtml(payer || "Payer")}:</strong> <strong>$${amount.toFixed(2)}</strong></div>`
    )
    .join("");

  summaryContent.innerHTML = `
    ${summary}
    <div class="total">Total: $${totalBill.toFixed(2)}</div>
  `;
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

renderTable();
updateSummary();
