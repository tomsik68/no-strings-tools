const arena = document.getElementById("arena");
const mainEl = document.getElementById("arena-main");
const subEl = document.getElementById("arena-sub");
const progressEl = document.getElementById("progress");

const ROUNDS = 5;

let state = "idle"; // idle | waiting | go | pause | done
let goTime = 0;
let waitTimer = null;
let results = [];

function show(main, sub, cls) {
  arena.className = "arena" + (cls ? " " + cls : "");
  mainEl.innerHTML = main;
  subEl.textContent = sub;
  progressEl.textContent = results.length ? `Round ${Math.min(results.length + 1, ROUNDS)} / ${ROUNDS}` : "";
}

function scheduleGo() {
  state = "waiting";
  show("Wait for green…", "", "waiting");
  waitTimer = setTimeout(() => {
    state = "go";
    goTime = performance.now();
    show("TAP!", "", "go");
  }, 1500 + Math.random() * 3000);
}

function finish() {
  state = "done";
  const avg = Math.round(results.reduce((a, b) => a + b, 0) / results.length);
  const best = Math.min(...results);
  results = [];
  show(
    `<span class="big">${avg} ms</span>`,
    `average of ${ROUNDS} · best ${best} ms · tap to try again`,
    "go"
  );
  progressEl.textContent = "";
}

arena.addEventListener("pointerdown", (e) => {
  e.preventDefault();
  if (state === "idle" || state === "done") {
    results = [];
    scheduleGo();
  } else if (state === "waiting") {
    clearTimeout(waitTimer);
    state = "idle";
    show("Too soon! 😅", "That round doesn't count — tap to continue.", "");
  } else if (state === "go") {
    const ms = Math.round(performance.now() - goTime);
    results.push(ms);
    if (results.length >= ROUNDS) {
      finish();
    } else {
      state = "pause";
      show(`${ms} ms`, "", "");
      progressEl.textContent = `Round ${results.length + 1} / ${ROUNDS}`;
      setTimeout(() => {
        if (state === "pause") scheduleGo();
      }, 900);
    }
  }
});
