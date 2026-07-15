const get = (id) => parseFloat(document.getElementById(id).value);
const set = (id, text) => (document.getElementById(id).textContent = text);

const fmt = (n) =>
  !isFinite(n) ? "—" : Math.abs(n) < 1e-10 ? "0" : parseFloat(n.toFixed(4)).toLocaleString();

function calculate() {
  const [a1, b1] = [get("a1"), get("b1")];
  set("r1", isNaN(a1) || isNaN(b1) ? "—" : fmt((a1 * b1) / 100));

  const [a2, b2] = [get("a2"), get("b2")];
  set("r2", isNaN(a2) || isNaN(b2) || b2 === 0 ? "—" : fmt((a2 / b2) * 100) + "%");

  const [a3, b3] = [get("a3"), get("b3")];
  if (isNaN(a3) || isNaN(b3) || a3 === 0) {
    set("r3", "—");
  } else {
    const change = ((b3 - a3) / Math.abs(a3)) * 100;
    set("r3", (change > 0 ? "+" : "") + fmt(change) + "%");
  }
}

document.querySelectorAll("input").forEach((el) => el.addEventListener("input", calculate));
const first = document.getElementById("a1");
first.focus();
first.select();
calculate();
