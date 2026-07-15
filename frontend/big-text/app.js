const form = document.getElementById("form");
const textInput = document.getElementById("text-input");
const banner = document.getElementById("banner");
const bannerText = document.getElementById("banner-text");

textInput.focus();

const SPEED = 0.25; // fraction of screen width per second

let running = false;
let rafId = null;

function show() {
  const text = textInput.value.trim();
  if (!text) return;
  bannerText.textContent = text;
  banner.style.display = "flex";
  running = true;

  const textWidth = bannerText.offsetWidth;
  const screenWidth = window.innerWidth;

  if (textWidth <= screenWidth) {
    // Fits — center it statically
    bannerText.style.transform = `translateX(${(screenWidth - textWidth) / 2}px)`;
    return;
  }

  // Marquee: scroll right-to-left, loop forever
  let x = screenWidth;
  let last = performance.now();
  const step = (now) => {
    if (!running) return;
    x -= SPEED * screenWidth * ((now - last) / 1000);
    last = now;
    if (x < -textWidth) x = screenWidth;
    bannerText.style.transform = `translateX(${x}px)`;
    rafId = requestAnimationFrame(step);
  };
  rafId = requestAnimationFrame(step);
}

function exit() {
  running = false;
  cancelAnimationFrame(rafId);
  banner.style.display = "none";
  textInput.focus();
  textInput.select();
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  show();
});

banner.addEventListener("click", exit);
document.addEventListener("keydown", (e) => {
  if (running && e.key === "Escape") exit();
});
