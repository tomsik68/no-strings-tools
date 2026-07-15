const categorySelect = document.getElementById("category-select");
const table = document.getElementById("size-table");

const CATEGORIES = {
  "Women's clothing": {
    headers: ["EU", "US", "UK", "Intl"],
    rows: [
      [32, 0, 4, "XXS"], [34, 2, 6, "XS"], [36, 4, 8, "S"], [38, 6, 10, "M"],
      [40, 8, 12, "M"], [42, 10, 14, "L"], [44, 12, 16, "L"], [46, 14, 18, "XL"],
      [48, 16, 20, "XXL"],
    ],
  },
  "Men's shirts": {
    headers: ["EU (collar cm)", "US/UK (in)", "Intl"],
    rows: [
      [37, "14.5", "S"], [38, "15", "S"], [39, "15.5", "M"], [41, "16", "M"],
      [42, "16.5", "L"], [43, "17", "L"], [44, "17.5", "XL"], [45, "18", "XXL"],
    ],
  },
  "Women's shoes": {
    headers: ["EU", "US", "UK", "cm"],
    rows: [
      [35, 5, 2.5, 22.1], [36, 6, 3.5, 22.9], [37, 6.5, 4, 23.3], [38, 7.5, 5, 24.1],
      [39, 8.5, 6, 25], [40, 9, 6.5, 25.4], [41, 9.5, 7, 25.8], [42, 10.5, 8, 26.7],
    ],
  },
  "Men's shoes": {
    headers: ["EU", "US", "UK", "cm"],
    rows: [
      [40, 7, 6.5, 25], [41, 8, 7.5, 25.8], [42, 8.5, 8, 26.2], [43, 9.5, 9, 27.1],
      [44, 10, 9.5, 27.5], [45, 11, 10.5, 28.3], [46, 12, 11.5, 29.2], [47, 12.5, 12, 29.6],
    ],
  },
  "Kids' shoes": {
    headers: ["EU", "US", "UK", "cm"],
    rows: [
      [23, 7, 6, 14.3], [25, 8.5, 7.5, 15.4], [27, 10, 9, 16.7], [29, 11.5, 10.5, 18],
      [31, 13, 12, 19.3], [33, 2, 1, 20.6], [35, 3.5, 2.5, 21.9],
    ],
  },
};

for (const name of Object.keys(CATEGORIES)) {
  const opt = document.createElement("option");
  opt.value = name;
  opt.textContent = name;
  categorySelect.append(opt);
}

function render() {
  const { headers, rows } = CATEGORIES[categorySelect.value];
  table.innerHTML = "";
  const headRow = document.createElement("tr");
  for (const h of headers) {
    const th = document.createElement("th");
    th.textContent = h;
    headRow.append(th);
  }
  table.append(headRow);
  for (const row of rows) {
    const tr = document.createElement("tr");
    for (const cell of row) {
      const td = document.createElement("td");
      td.textContent = cell;
      tr.append(td);
    }
    table.append(tr);
  }
}

categorySelect.addEventListener("change", render);
categorySelect.focus();
render();
