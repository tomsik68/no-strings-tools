// Real IANA timezone list from the browser (no hand-maintained list, no invalid zones)
const TIMEZONES = ["UTC", ...Intl.supportedValuesOf("timeZone")];

const addInput = document.getElementById("add-tz-input");
const addDropdown = document.getElementById("add-tz-dropdown");
const addBtn = document.getElementById("add-tz-btn");
const clocksContainer = document.getElementById("clocks-container");

function isValidTimezone(tz) {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

// Detect browser timezone
function detectBrowserTimezone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch (error) {
    return "UTC";
  }
}

let homeTz = localStorage.getItem("world-clock-home") || detectBrowserTimezone();
let clocks = JSON.parse(localStorage.getItem("world-clock-clocks")) || [];

// Drop any invalid zones persisted by older versions (they crashed the app)
if (!isValidTimezone(homeTz)) homeTz = detectBrowserTimezone();
const validClocks = clocks.filter(isValidTimezone);
if (validClocks.length !== clocks.length) {
  clocks = validClocks;
  localStorage.setItem("world-clock-clocks", JSON.stringify(clocks));
}

// Add timezone handlers
addInput.addEventListener("input", () => {
  filterAndShow(addInput, addDropdown, "add");
});
addInput.addEventListener("focus", () => {
  addDropdown.classList.add("active");
  filterAndShow(addInput, addDropdown, "add");
});
addBtn.addEventListener("click", () => {
  const tz = addInput.value.trim();
  if (!tz || !TIMEZONES.includes(tz)) return;
  if (!clocks.includes(tz)) {
    clocks.push(tz);
    localStorage.setItem("world-clock-clocks", JSON.stringify(clocks));
    addInput.value = "";
    render();
  }
});
document.addEventListener("click", (e) => {
  if (!e.target.closest("#add-tz-input") && !e.target.closest("#add-tz-dropdown")) {
    addDropdown.classList.remove("active");
  }
});

function filterAndShow(input, dropdown, type) {
  const searchTerm = input.value.toLowerCase();
  const filtered = TIMEZONES.filter((tz) => tz.toLowerCase().includes(searchTerm));

  dropdown.innerHTML = filtered
    .map((tz) => {
      return `<div class="timezone-option" data-tz="${tz}" data-type="${type}">${tz}</div>`;
    })
    .join("");

  dropdown.querySelectorAll(".timezone-option").forEach((option) => {
    option.addEventListener("click", (e) => {
      const tz = e.target.getAttribute("data-tz");
      addInput.value = tz;
      addDropdown.classList.remove("active");
    });
  });
}

// Exact UTC offset in hours (handles :30 and :45 zones) via formatToParts
function getOffsetForDate(tz, date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).formatToParts(date);
  const v = {};
  parts.forEach((p) => {
    if (p.type !== "literal") v[p.type] = Number(p.value);
  });
  const wallUTC = Date.UTC(v.year, v.month - 1, v.day, v.hour % 24, v.minute);
  const truncated = Math.floor(date.getTime() / 60000) * 60000;
  return (wallUTC - truncated) / 3600000;
}

function getUtcOffset(tz) {
  return getOffsetForDate(tz, new Date());
}

function getCurrentTime(tz) {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
  return formatter.format(new Date());
}

function getDSTStatus(tz) {
  const now = new Date();

  // Compare January and July offsets; DST offset is the LARGER of the two
  // (July is winter in the southern hemisphere)
  const january = new Date(now.getFullYear(), 0, 1);
  const july = new Date(now.getFullYear(), 6, 1);

  const janOffset = getOffsetForDate(tz, january);
  const julyOffset = getOffsetForDate(tz, july);
  const currentOffset = getOffsetForDate(tz, now);

  if (janOffset !== julyOffset) {
    const dstOffset = Math.max(janOffset, julyOffset);
    if (currentOffset === dstOffset) {
      return { status: "summer", icon: "☀️", label: "Observing summer time" };
    } else {
      return { status: "winter", icon: "❄️", label: "Observing winter time" };
    }
  } else {
    return { status: "none", icon: "➖", label: "No daylight savings" };
  }
}

function formatOffset(offset) {
  const sign = offset >= 0 ? "+" : "-";
  const abs = Math.abs(offset);
  const h = Math.floor(abs);
  const m = Math.round((abs - h) * 60);
  return `${sign}${h}${m ? ":" + String(m).padStart(2, "0") : ""}`;
}

function render() {
  // Always include home timezone
  const allClocks = [homeTz, ...clocks.filter((tz) => tz !== homeTz)];

  const homeOffset = getUtcOffset(homeTz);
  const sortedClocks = [...allClocks].sort((a, b) => {
    const offsetA = getUtcOffset(a) - homeOffset;
    const offsetB = getUtcOffset(b) - homeOffset;
    return offsetA - offsetB;
  });

  clocksContainer.innerHTML = sortedClocks
    .map((tz) => {
      const isHome = tz === homeTz;
      const offset = getUtcOffset(tz);
      const time = getCurrentTime(tz);
      const dst = getDSTStatus(tz);
      return `
        <div class="clock-card ${isHome ? "home" : ""}">
          ${!isHome ? `<button class="delete-btn" data-tz="${tz}">✕</button>` : ""}
          <div class="dst-indicator" title="${dst.label}">${dst.icon}</div>
          <div class="clock-timezone">${tz}</div>
          <div class="clock-time">${time}</div>
          <div class="clock-offset">UTC ${formatOffset(offset)}</div>
          ${isHome ? '<div class="home-badge">HOME</div>' : ""}
        </div>
      `;
    })
    .join("");

  clocksContainer.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const tz = e.target.getAttribute("data-tz");
      clocks = clocks.filter((t) => t !== tz);
      localStorage.setItem("world-clock-clocks", JSON.stringify(clocks));
      render();
    });
  });
}

render();

// One interval for the whole app (previously created inside render — one new
// interval per render, compounding every second until the page froze)
setInterval(render, 1000);
