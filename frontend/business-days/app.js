const startEl = document.getElementById("start");
const nEl = document.getElementById("n");
const fromEl = document.getElementById("from");
const toEl = document.getElementById("to");
const addOut = document.getElementById("add-out");
const countOut = document.getElementById("count-out");

function parse(s) {
  if (!s) return null;
  const d = new Date(s + "T00:00:00");
  return Number.isNaN(d.getTime()) ? null : d;
}

function isWeekend(d) {
  const day = d.getDay();
  return day === 0 || day === 6;
}

function addBusinessDays(start, n) {
  const d = new Date(start);
  let left = n;
  const step = n >= 0 ? 1 : -1;
  left = Math.abs(left);
  while (left > 0) {
    d.setDate(d.getDate() + step);
    if (!isWeekend(d)) left--;
  }
  return d;
}

function countBusinessDays(from, to) {
  if (to < from) return -countBusinessDays(to, from);
  let count = 0;
  const d = new Date(from);
  d.setDate(d.getDate() + 1); // exclusive start, inclusive end is common for "due in N days from"
  // Count days from `from` to `to` inclusive of start if it's a weekday? Standard: days strictly after from until to inclusive
  // Better: number of weekdays in (from, to] when adding, or [from, to) 
  // User-friendly: working days from from→to, not counting start day if same
  const cur = new Date(from);
  if (from.getTime() === to.getTime()) return isWeekend(from) ? 0 : 0;
  cur.setDate(cur.getDate() + 1);
  while (cur <= to) {
    if (!isWeekend(cur)) count++;
    cur.setDate(cur.getDate() + 1);
  }
  return count;
}

function fmt(d) {
  return d.toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" });
}

function renderAdd() {
  const s = parse(startEl.value);
  const n = parseInt(nEl.value, 10);
  if (!s || !Number.isFinite(n)) { addOut.textContent = "—"; return; }
  const end = addBusinessDays(s, n);
  addOut.textContent = fmt(end);
}

function renderCount() {
  const a = parse(fromEl.value);
  const b = parse(toEl.value);
  if (!a || !b) { countOut.textContent = "—"; return; }
  const c = countBusinessDays(a, b);
  countOut.textContent = `${c} working day${Math.abs(c) !== 1 ? "s" : ""}`;
}

const today = new Date().toISOString().slice(0, 10);
startEl.value = today;
fromEl.value = today;
const t2 = new Date(); t2.setDate(t2.getDate() + 14);
toEl.value = t2.toISOString().slice(0, 10);

[startEl, nEl].forEach((el) => el.addEventListener("input", renderAdd));
[fromEl, toEl].forEach((el) => el.addEventListener("input", renderCount));
nEl.focus();
renderAdd();
renderCount();
