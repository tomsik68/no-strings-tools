const input = document.getElementById("ua-input");
const results = document.getElementById("results");

function match(ua, re) {
  const m = ua.match(re);
  return m ? m[1] : null;
}

function parseBrowser(ua) {
  // Order matters — check specific engines/browsers first
  if (/EdgA?\/([\d.]+)/.test(ua)) return { name: "Edge", version: RegExp.$1 };
  if (/OPR\/([\d.]+)/.test(ua) || /Opera\/([\d.]+)/.test(ua)) return { name: "Opera", version: RegExp.$1 };
  if (/SamsungBrowser\/([\d.]+)/.test(ua)) return { name: "Samsung Internet", version: RegExp.$1 };
  if (/Brave/.test(ua)) return { name: "Brave", version: match(ua, /Chrome\/([\d.]+)/) || "?" };
  if (/Firefox\/([\d.]+)/.test(ua) || /FxiOS\/([\d.]+)/.test(ua)) return { name: "Firefox", version: RegExp.$1 };
  if (/CriOS\/([\d.]+)/.test(ua)) return { name: "Chrome (iOS)", version: RegExp.$1 };
  if (/Chrome\/([\d.]+)/.test(ua) && !/Chromium/.test(ua)) return { name: "Chrome", version: RegExp.$1 };
  if (/Chromium\/([\d.]+)/.test(ua)) return { name: "Chromium", version: RegExp.$1 };
  if (/Version\/([\d.]+).*Safari/.test(ua) || (/Safari\//.test(ua) && /Version\/([\d.]+)/.test(ua)))
    return { name: "Safari", version: match(ua, /Version\/([\d.]+)/) || "?" };
  if (/MSIE ([\d.]+)/.test(ua) || /Trident\/.*rv:([\d.]+)/.test(ua)) return { name: "Internet Explorer", version: RegExp.$1 };
  return { name: "Unknown", version: "—" };
}

function parseOS(ua) {
  if (/Windows NT 10/.test(ua)) return /Windows NT 10\.0; Win64|Windows NT 10\.0.*rv:/.test(ua) ? "Windows 10/11" : "Windows 10";
  if (/Windows NT 6\.3/.test(ua)) return "Windows 8.1";
  if (/Windows NT 6\.2/.test(ua)) return "Windows 8";
  if (/Windows NT 6\.1/.test(ua)) return "Windows 7";
  if (/Windows NT/.test(ua)) return "Windows";
  if (/Android ([\d.]+)/.test(ua)) return "Android " + RegExp.$1;
  if (/iPhone OS ([\d_]+)/.test(ua) || /iPad.*OS ([\d_]+)/.test(ua) || /CPU OS ([\d_]+)/.test(ua))
    return "iOS " + RegExp.$1.replace(/_/g, ".");
  if (/Mac OS X ([\d_]+)/.test(ua)) return "macOS " + RegExp.$1.replace(/_/g, ".");
  if (/CrOS/.test(ua)) return "Chrome OS";
  if (/Linux/.test(ua)) return "Linux";
  if (/FreeBSD/.test(ua)) return "FreeBSD";
  return "Unknown";
}

function parseDevice(ua) {
  if (/iPad/.test(ua)) return "iPad";
  if (/iPhone/.test(ua)) return "iPhone";
  if (/iPod/.test(ua)) return "iPod";
  if (/Android/.test(ua)) {
    if (/Mobile/.test(ua)) return "Android phone";
    return "Android tablet";
  }
  if (/Mobile|webOS|BlackBerry|Opera Mini|IEMobile/i.test(ua)) return "Mobile";
  if (/Tablet|Kindle|Silk/i.test(ua)) return "Tablet";
  return "Desktop";
}

function parseEngine(ua) {
  if (/Edg\//.test(ua) || /Chrome\//.test(ua) || /Chromium\//.test(ua)) {
    const v = match(ua, /Chrome\/([\d.]+)/);
    return v ? `Blink (Chrome ${v})` : "Blink";
  }
  if (/AppleWebKit\/([\d.]+)/.test(ua) && /Safari/.test(ua) && !/Chrome|Chromium|Edg/.test(ua))
    return "WebKit " + RegExp.$1;
  if (/Gecko\/|Firefox\//.test(ua)) return "Gecko" + (match(ua, /rv:([\d.]+)/) ? " " + RegExp.$1 : "");
  if (/Trident\/([\d.]+)/.test(ua)) return "Trident " + RegExp.$1;
  return "—";
}

function row(label, value) {
  return `<tr>
    <td class="w3-text-grey" style="padding: 8px 12px 8px 0; white-space: nowrap;">${label}</td>
    <td style="padding: 8px 0; font-weight: 600; word-break: break-word;">${value}</td>
  </tr>`;
}

function render() {
  const ua = input.value.trim();
  if (!ua) {
    results.innerHTML = "";
    return;
  }
  const browser = parseBrowser(ua);
  const os = parseOS(ua);
  const device = parseDevice(ua);
  const engine = parseEngine(ua);
  const bot = /bot|crawl|spider|slurp|facebookexternalhit|preview/i.test(ua);

  results.innerHTML = `
    <table class="w3-table" style="background: white; border-radius: 8px;">
      ${row("Browser", `${browser.name} ${browser.version}`)}
      ${row("OS", os)}
      ${row("Device", device)}
      ${row("Engine", engine)}
      ${row("Bot / crawler", bot ? "Likely yes" : "No")}
    </table>`;
}

input.value = navigator.userAgent || "";
input.addEventListener("input", render);
input.focus();
render();
