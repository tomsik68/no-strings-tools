// Real IANA timezone list from the browser (no hand-maintained list, no invalid zones)
const TIMEZONES = ["UTC", ...Intl.supportedValuesOf("timeZone")];

const timeInput = document.getElementById("time-input");
const tz1Input = document.getElementById("tz1-input");
const tz1Dropdown = document.getElementById("tz1-dropdown");
const tz1Selected = document.getElementById("tz1-selected");
const tz2Input = document.getElementById("tz2-input");
const tz2Dropdown = document.getElementById("tz2-dropdown");
const tz2Selected = document.getElementById("tz2-selected");
const toTimeDisplay = document.getElementById("to-time");
const copyBtn = document.getElementById("copy-btn");
const copyFeedback = document.getElementById("copy-feedback");

let selectedTz1 = "UTC";
let selectedTz2 = "America/New_York";

// Set current time as default
const now = new Date();
const hours = String(now.getHours()).padStart(2, "0");
const minutes = String(now.getMinutes()).padStart(2, "0");
timeInput.value = `${hours}:${minutes}`;

// Initialize displays
updateSelectedTimezones();
convertTime();

// Auto-focus time input on load
timeInput.focus();

// Time input change
timeInput.addEventListener("change", convertTime);
timeInput.addEventListener("input", convertTime);

// Copy button
copyBtn.addEventListener("click", () => {
  const time = toTimeDisplay.textContent;
  if (time === "--:--") return;

  navigator.clipboard.writeText(time).then(() => {
    copyFeedback.textContent = "Copied!";
    setTimeout(() => {
      copyFeedback.textContent = "";
    }, 2000);
  });
});

// Also allow clicking the time to copy
toTimeDisplay.addEventListener("click", () => {
  copyBtn.click();
});

// Timezone 1 handlers
tz1Input.addEventListener("input", () => {
  filterAndShowDropdown(tz1Input, tz1Dropdown, 1);
});
tz1Input.addEventListener("focus", () => {
  tz1Dropdown.classList.add("active");
  filterAndShowDropdown(tz1Input, tz1Dropdown, 1);
});
document.addEventListener("click", (e) => {
  if (!e.target.closest("#tz1-input") && !e.target.closest("#tz1-dropdown")) {
    tz1Dropdown.classList.remove("active");
  }
});

// Timezone 2 handlers
tz2Input.addEventListener("input", () => {
  filterAndShowDropdown(tz2Input, tz2Dropdown, 2);
});
tz2Input.addEventListener("focus", () => {
  tz2Dropdown.classList.add("active");
  filterAndShowDropdown(tz2Input, tz2Dropdown, 2);
});
document.addEventListener("click", (e) => {
  if (!e.target.closest("#tz2-input") && !e.target.closest("#tz2-dropdown")) {
    tz2Dropdown.classList.remove("active");
  }
});

function filterAndShowDropdown(input, dropdown, tzIndex) {
  const searchTerm = input.value.toLowerCase();
  const filtered = TIMEZONES.filter((tz) =>
    tz.toLowerCase().includes(searchTerm)
  );

  dropdown.innerHTML = filtered
    .map((tz) => {
      const selected =
        (tzIndex === 1 && tz === selectedTz1) ||
        (tzIndex === 2 && tz === selectedTz2);
      return `<div class="timezone-option ${
        selected ? "selected" : ""
      }" data-tz="${tz}" data-index="${tzIndex}">${tz}</div>`;
    })
    .join("");

  dropdown.querySelectorAll(".timezone-option").forEach((option) => {
    option.addEventListener("click", selectTimezone);
  });
}

function selectTimezone(e) {
  const tz = e.target.getAttribute("data-tz");
  const index = parseInt(e.target.getAttribute("data-index"));

  if (index === 1) {
    selectedTz1 = tz;
    tz1Input.value = tz;
    tz1Dropdown.classList.remove("active");
  } else {
    selectedTz2 = tz;
    tz2Input.value = tz;
    tz2Dropdown.classList.remove("active");
  }

  updateSelectedTimezones();
  convertTime();
}

function updateSelectedTimezones() {
  tz1Selected.textContent = selectedTz1;
  tz2Selected.textContent = selectedTz2;
}

// Get the wall-clock time of `date` in `tz` as minutes since midnight
function wallMinutes(tz, date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(date);
  const h = Number(parts.find((p) => p.type === "hour").value) % 24;
  const m = Number(parts.find((p) => p.type === "minute").value);
  return h * 60 + m;
}

// Find the UTC instant at which `tz` shows today's date with time h:m
function wallTimeToInstant(tz, h, m) {
  // Today's date in tz (en-CA formats as YYYY-MM-DD)
  const dateStr = new Intl.DateTimeFormat("en-CA", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
  const [y, mo, d] = dateStr.split("-").map(Number);

  // First guess: interpret the wall time as UTC, then correct by the observed
  // difference. Two rounds handle DST transitions.
  let instant = new Date(Date.UTC(y, mo - 1, d, h, m));
  for (let i = 0; i < 2; i++) {
    let diff = h * 60 + m - wallMinutes(tz, instant);
    if (diff > 720) diff -= 1440;
    if (diff < -720) diff += 1440;
    if (diff === 0) break;
    instant = new Date(instant.getTime() + diff * 60000);
  }
  return instant;
}

function convertTime() {
  const timeValue = timeInput.value;
  if (!timeValue) {
    toTimeDisplay.textContent = "--:--";
    return;
  }

  const [hours, minutes] = timeValue.split(":").map(Number);

  const instant = wallTimeToInstant(selectedTz1, hours, minutes);

  const toFormatter = new Intl.DateTimeFormat("en-US", {
    timeZone: selectedTz2,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  toTimeDisplay.textContent = toFormatter.format(instant);
}
