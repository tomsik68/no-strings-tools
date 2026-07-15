const cronInput = document.getElementById("cron-input");
const explanation = document.getElementById("explanation");

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function expandRange(expr, max) {
  if (expr === "*") return Array.from({length: max}, (_, i) => i);
  if (expr.includes("-")) {
    const [start, end] = expr.split("-").map(Number);
    return Array.from({length: end - start + 1}, (_, i) => start + i);
  }
  if (expr.includes("/")) {
    const [range, step] = expr.split("/");
    const max_val = range === "*" ? max : Number(range);
    return Array.from({length: Math.ceil(max_val / Number(step))}, (_, i) => i * Number(step));
  }
  return [Number(expr)];
}

function explainCron(cronExpr) {
  if (!cronExpr.trim()) {
    return "";
  }

  const parts = cronExpr.trim().split(/\s+/);

  if (parts.length !== 5) {
    return "<div style='color: #c62828; padding: 12px; background: #ffcdd2; border-radius: 4px;'>❌ Need 5 fields: minute hour day month day-of-week</div>";
  }

  const [minute, hour, day, month, dayOfWeek] = parts;

  let minuteExp = expandRange(minute, 60).slice(0, 10).join(", ");
  if (minute === "*") minuteExp = "every minute";
  else if (minute.includes("/")) minuteExp = `every ${minute.split("/")[1]} minutes`;

  let hourExp = expandRange(hour, 24).slice(0, 10).join(", ");
  if (hour === "*") hourExp = "every hour";
  else if (hour.includes("/")) hourExp = `every ${hour.split("/")[1]} hours`;

  let dayExp = day === "*" ? "any day" : `day ${day}`;

  let monthExp = month === "*" ? "every month" : `${MONTHS[Number(month) - 1]}`;

  let dayOfWeekExp = dayOfWeek === "*" ? "any day" :
    dayOfWeek.includes("-") ? dayOfWeek.split("-").map(d => DAYS[Number(d)]).join("-") :
    DAYS[Number(dayOfWeek)];

  const english = `${minuteExp} ${hourExp} on ${dayExp} of ${monthExp}, ${dayOfWeekExp}`;

  return `
    <div class="field">
      <div class="field-name">⏱️ Minute</div>
      <div class="field-value"><code>${minute}</code> = ${minute === "*" ? "every minute (0-59)" : "at " + minute}</div>
    </div>
    <div class="field">
      <div class="field-name">⏰ Hour</div>
      <div class="field-value"><code>${hour}</code> = ${hour === "*" ? "every hour (0-23)" : "at " + hour + " o'clock"}</div>
    </div>
    <div class="field">
      <div class="field-name">📅 Day of Month</div>
      <div class="field-value"><code>${day}</code> = ${day === "*" ? "any day of month (1-31)" : "day " + day}</div>
    </div>
    <div class="field">
      <div class="field-name">📆 Month</div>
      <div class="field-value"><code>${month}</code> = ${month === "*" ? "any month (1-12)" : MONTHS[Number(month) - 1]}</div>
    </div>
    <div class="field">
      <div class="field-name">🗓️ Day of Week</div>
      <div class="field-value"><code>${dayOfWeek}</code> = ${dayOfWeek === "*" ? "any day (0=Sun, 6=Sat)" : DAYS[Number(dayOfWeek)]}</div>
    </div>
    <div class="english">✓ ${english}</div>
  `;
}

cronInput.addEventListener("input", (e) => {
  explanation.innerHTML = explainCron(e.target.value);
});

// Initial explanation
explanation.innerHTML = explainCron(cronInput.value);
