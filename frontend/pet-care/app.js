const KEY = "pet-care";
let pets = JSON.parse(localStorage.getItem(KEY) || "[]");

const save = () => localStorage.setItem(KEY, JSON.stringify(pets));
const esc = (t) => { const d = document.createElement("div"); d.textContent = t; return d.innerHTML; };
const todayStr = () => new Date().toISOString().slice(0, 10);

const CARE = [
  { id: "vaccine", label: "Vaccine", days: 365 },
  { id: "flea", label: "Flea / tick", days: 30 },
  { id: "deworm", label: "Deworm", days: 90 },
  { id: "weight", label: "Weight", days: 0 },
];

const ICONS = { dog: "🐕", cat: "🐈", other: "🐾" };

function lastOf(pet, type) {
  const logs = (pet.logs || []).filter((l) => l.type === type).sort((a, b) => b.date.localeCompare(a.date));
  return logs[0] || null;
}

function daysBetween(a, b) {
  return Math.round((new Date(b + "T00:00:00") - new Date(a + "T00:00:00")) / 86400000);
}

function statusFor(pet, care) {
  const last = lastOf(pet, care.id);
  if (!last) return { cls: "w3-grey", text: "Never" };
  if (!care.days) {
    return { cls: "w3-blue", text: last.note ? `${last.note} · ${fmtDate(last.date)}` : fmtDate(last.date) };
  }
  const due = new Date(last.date + "T00:00:00");
  due.setDate(due.getDate() + care.days);
  const dueStr = due.toISOString().slice(0, 10);
  const d = daysBetween(todayStr(), dueStr);
  if (d < 0) return { cls: "w3-red", text: `${Math.abs(d)}d overdue` };
  if (d <= 14) return { cls: "w3-orange", text: `due in ${d}d` };
  return { cls: "w3-green", text: `ok · ${fmtDate(last.date)}` };
}

function fmtDate(s) {
  return new Date(s + "T00:00:00").toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function render() {
  const list = document.getElementById("pet-list");
  if (!pets.length) {
    list.innerHTML = '<p class="w3-text-grey w3-center">No pets yet — add one below.</p>';
    return;
  }

  list.innerHTML = pets.map((pet) => {
    const rows = CARE.map((c) => {
      const st = statusFor(pet, c);
      return `<div style="display: flex; align-items: center; gap: 8px; margin-top: 8px; flex-wrap: wrap;">
        <span style="min-width: 90px; font-size: 13px;">${c.label}</span>
        <span class="w3-tag w3-round ${st.cls}" style="font-size: 11px;">${esc(st.text)}</span>
        <button class="w3-button w3-small w3-border w3-round log-btn" data-pet="${pet.id}" data-type="${c.id}" style="padding: 2px 10px;">
          ${c.id === "weight" ? "Log" : "Done today"}
        </button>
      </div>`;
    }).join("");

    return `<div class="w3-panel w3-white w3-round w3-border" style="padding: 14px 16px; margin: 0 0 12px;">
      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="font-size: 22px;">${ICONS[pet.type] || ICONS.other}</span>
        <strong style="flex: 1;">${esc(pet.name)}</strong>
        <button class="w3-button w3-small w3-text-grey del-pet" data-id="${pet.id}" aria-label="Remove pet">×</button>
      </div>
      ${rows}
    </div>`;
  }).join("");
}

document.getElementById("pet-list").addEventListener("click", (ev) => {
  const del = ev.target.closest(".del-pet");
  if (del) {
    const pet = pets.find((p) => p.id === del.dataset.id);
    if (pet && confirm(`Remove ${pet.name}?`)) {
      pets = pets.filter((p) => p.id !== del.dataset.id);
      save();
      render();
    }
    return;
  }

  const log = ev.target.closest(".log-btn");
  if (!log) return;
  const pet = pets.find((p) => p.id === log.dataset.pet);
  if (!pet) return;
  pet.logs = pet.logs || [];
  let note = "";
  if (log.dataset.type === "weight") {
    note = prompt("Weight (e.g. 12.5 kg)") || "";
    if (!note) return;
  }
  pet.logs.push({ type: log.dataset.type, date: todayStr(), note });
  save();
  render();
});

function addPet() {
  const name = document.getElementById("pet-name").value.trim();
  if (!name) return;
  const type = document.getElementById("pet-type").value;
  pets.push({ id: crypto.randomUUID(), name, type, logs: [] });
  save();
  render();
  document.getElementById("pet-name").value = "";
  document.getElementById("pet-name").focus();
}

document.getElementById("add-pet").addEventListener("click", addPet);
document.getElementById("pet-name").addEventListener("keydown", (e) => {
  if (e.key === "Enter") addPet();
});

document.getElementById("pet-name").focus();
render();
