const picker = document.getElementById("picker");
const hexEl = document.getElementById("hex");
const rgbEl = document.getElementById("rgb");
const hslEl = document.getElementById("hsl");
const swatch = document.getElementById("swatch");
const errorEl = document.getElementById("error");

function clamp(n, min, max) { return Math.min(max, Math.max(min, n)); }

function rgbToHex(r, g, b) {
  return "#" + [r, g, b].map((x) => clamp(Math.round(x), 0, 255).toString(16).padStart(2, "0")).join("");
}

function hexToRgb(hex) {
  let h = hex.trim().replace(/^#/, "");
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  if (!/^[0-9a-fA-F]{6}$/.test(h)) return null;
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}

function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      default: h = (r - g) / d + 4;
    }
    h /= 6;
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function hslToRgb(h, s, l) {
  h = ((h % 360) + 360) % 360;
  s = clamp(s, 0, 100) / 100;
  l = clamp(l, 0, 100) / 100;
  if (s === 0) {
    const v = Math.round(l * 255);
    return { r: v, g: v, b: v };
  }
  const hue2rgb = (p, q, t) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const hk = h / 360;
  return {
    r: Math.round(hue2rgb(p, q, hk + 1 / 3) * 255),
    g: Math.round(hue2rgb(p, q, hk) * 255),
    b: Math.round(hue2rgb(p, q, hk - 1 / 3) * 255),
  };
}

function parseRgb(str) {
  const m = str.trim().match(/^rgba?\(\s*(\d{1,3})\s*[, ]\s*(\d{1,3})\s*[, ]\s*(\d{1,3})/i);
  if (!m) return null;
  const r = +m[1], g = +m[2], b = +m[3];
  if ([r, g, b].some((x) => x > 255)) return null;
  return { r, g, b };
}

function parseHsl(str) {
  const m = str.trim().match(/^hsla?\(\s*([-\d.]+)\s*[, ]\s*([-\d.]+)%?\s*[, ]\s*([-\d.]+)%?/i);
  if (!m) return null;
  return { h: +m[1], s: +m[2], l: +m[3] };
}

function apply(rgb, source) {
  if (!rgb) {
    errorEl.textContent = "Invalid color";
    return;
  }
  errorEl.textContent = "";
  const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  swatch.style.background = hex;
  if (source !== "picker") picker.value = hex;
  if (source !== "hex") hexEl.value = hex;
  if (source !== "rgb") rgbEl.value = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
  if (source !== "hsl") hslEl.value = `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;
}

picker.addEventListener("input", () => apply(hexToRgb(picker.value), "picker"));
hexEl.addEventListener("input", () => apply(hexToRgb(hexEl.value), "hex"));
rgbEl.addEventListener("input", () => apply(parseRgb(rgbEl.value), "rgb"));
hslEl.addEventListener("input", () => {
  const hsl = parseHsl(hslEl.value);
  apply(hsl ? hslToRgb(hsl.h, hsl.s, hsl.l) : null, "hsl");
});

hexEl.focus();
