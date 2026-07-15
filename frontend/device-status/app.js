const batteryValue = document.getElementById("battery-value");
const batteryCard = document.getElementById("battery-card");
const networkValue = document.getElementById("network-value");
const networkCard = document.getElementById("network-card");
const deviceType = document.getElementById("device-type");
const screenSize = document.getElementById("screen-size");
const userAgent = document.getElementById("user-agent");
const ram = document.getElementById("ram");
const hardware = document.getElementById("hardware");
const cores = document.getElementById("cores");

function updateBatteryStatus() {
  navigator.getBattery?.().then((battery) => {
    const percent = Math.round(battery.level * 100);
    batteryValue.textContent = percent + "%";
    batteryCard.classList.toggle("low", percent < 20);
    batteryCard.classList.toggle("charging", battery.charging);
  });
}

function updateNetworkStatus() {
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  if (connection) {
    const type = connection.effectiveType || "unknown";
    networkValue.textContent = type.toUpperCase();
    networkCard.classList.toggle("online", type !== "4g");
  } else {
    networkValue.textContent = navigator.onLine ? "Online" : "Offline";
    networkCard.classList.toggle("online", navigator.onLine);
  }
}

function updateDeviceInfo() {
  const ua = navigator.userAgent;
  const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(ua.toLowerCase());

  deviceType.textContent = isMobile ? "Mobile" : "Desktop";
  screenSize.textContent = window.innerWidth + "x" + window.innerHeight;

  userAgent.textContent = ua.substring(0, 40) + "...";
  cores.textContent = navigator.hardwareConcurrency || "?";
  hardware.textContent = navigator.platform || "?";

  if (navigator.deviceMemory) {
    ram.textContent = navigator.deviceMemory + " GB";
  } else {
    ram.textContent = "Unknown";
  }
}

updateBatteryStatus();
updateNetworkStatus();
updateDeviceInfo();

setInterval(updateBatteryStatus, 5000);
window.addEventListener("online", updateNetworkStatus);
window.addEventListener("offline", updateNetworkStatus);
