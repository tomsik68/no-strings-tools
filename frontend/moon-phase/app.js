const dateInput = document.getElementById("date-input");
const emojiEl = document.getElementById("moon-emoji");
const nameEl = document.getElementById("phase-name");
const detailEl = document.getElementById("phase-detail");
const nextFullEl = document.getElementById("next-full");
const nextNewEl = document.getElementById("next-new");

const SYNODIC_DAYS = 29.530588853;
const NEW_MOON_EPOCH = Date.UTC(2000, 0, 6, 18, 14); // known new moon

const PHASES = [
  ["🌑", "New Moon"],
  ["🌒", "Waxing Crescent"],
  ["🌓", "First Quarter"],
  ["🌔", "Waxing Gibbous"],
  ["🌕", "Full Moon"],
  ["🌖", "Waning Gibbous"],
  ["🌗", "Last Quarter"],
  ["🌘", "Waning Crescent"],
];

function moonAgeDays(date) {
  const days = (date.getTime() - NEW_MOON_EPOCH) / 86400000;
  return ((days % SYNODIC_DAYS) + SYNODIC_DAYS) % SYNODIC_DAYS;
}

const fmtDate = (d) => d.toLocaleDateString([], { day: "numeric", month: "long" });

function update() {
  if (!dateInput.value) return;
  const date = new Date(dateInput.value + "T12:00:00");
  const age = moonAgeDays(date);

  const [emoji, name] = PHASES[Math.round((age / SYNODIC_DAYS) * 8) % 8];
  const illumination = Math.round(((1 - Math.cos((2 * Math.PI * age) / SYNODIC_DAYS)) / 2) * 100);

  emojiEl.textContent = emoji;
  nameEl.textContent = name;
  detailEl.textContent = `${illumination}% illuminated · ${age.toFixed(1)} days old`;

  const msPerDay = 86400000;
  const half = SYNODIC_DAYS / 2;
  const daysToFull = age < half ? half - age : SYNODIC_DAYS - age + half;
  const daysToNew = SYNODIC_DAYS - age;
  nextFullEl.textContent = fmtDate(new Date(date.getTime() + daysToFull * msPerDay));
  nextNewEl.textContent = fmtDate(new Date(date.getTime() + daysToNew * msPerDay));
}

dateInput.addEventListener("input", update);

// Local date in yyyy-mm-dd (toISOString would shift near midnight)
const now = new Date();
dateInput.value = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
dateInput.focus();
update();
