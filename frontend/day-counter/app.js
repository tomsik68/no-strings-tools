const form = document.getElementById("add-form");
const dateInput = document.getElementById("date-input");
const labelInput = document.getElementById("label-input");
const listEl = document.getElementById("list");
const emptyEl = document.getElementById("empty");

const STORAGE_KEY = "day-counter";

let entries = [];
try {
  entries = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
} catch {
  entries = [];
}

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

// Calendar-day difference; both ends are UTC midnights so DST can't skew it
function daysFromToday(isoDate) {
  const [y, m, d] = isoDate.split("-").map(Number);
  const now = new Date();
  return Math.round((Date.UTC(y, m - 1, d) - Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())) / 86400000);
}

function describe(days) {
  if (days === 0) return "today";
  const s = Math.abs(days) === 1 ? "" : "s";
  return days > 0 ? `in ${days} day${s}` : `${-days} day${s} ago`;
}

function formatDate(isoDate) {
  const [y, m, d] = isoDate.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, { weekday: "short", year: "numeric", month: "short", day: "numeric" });
}

function render() {
  listEl.innerHTML = "";
  emptyEl.style.display = entries.length ? "none" : "block";

  const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date));
  for (const entry of sorted) {
    const days = daysFromToday(entry.date);

    const count = document.createElement("div");
    count.className = "count " + (days === 0 ? "w3-text-green" : days > 0 ? "w3-text-blue" : "w3-text-dark-grey");
    count.textContent = describe(days);

    const sub = document.createElement("div");
    sub.className = "w3-small w3-text-grey";
    sub.textContent = entry.label ? `${entry.label} — ${formatDate(entry.date)}` : formatDate(entry.date);

    const info = document.createElement("div");
    info.append(count, sub);

    const del = document.createElement("button");
    del.className = "delete-btn";
    del.textContent = "×";
    del.setAttribute("aria-label", `Delete ${entry.label || formatDate(entry.date)}`);
    del.addEventListener("click", () => {
      entries = entries.filter((e) => e !== entry);
      save();
      render();
    });

    const li = document.createElement("li");
    li.className = "w3-card w3-white w3-round entry";
    li.append(info, del);
    listEl.appendChild(li);
  }
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  entries.push({ date: dateInput.value, label: labelInput.value.trim() });
  save();
  render();
  form.reset();
  dateInput.focus();
});

render();

// Refresh the counts when the tab is revisited on a later day
document.addEventListener("visibilitychange", () => {
  if (!document.hidden) render();
});
