const outcomeInput = document.getElementById("outcome-input");
const addOutcomeBtn = document.getElementById("add-outcome-btn");
const oddsSection = document.getElementById("odds-section");
const oddsBody = document.getElementById("odds-body");
const poolTotalEl = document.getElementById("pool-total");
const betSection = document.getElementById("bet-section");
const bettorInput = document.getElementById("bettor-input");
const betOutcomeSelect = document.getElementById("bet-outcome");
const amountInput = document.getElementById("amount-input");
const addBetBtn = document.getElementById("add-bet-btn");
const betsTable = document.getElementById("bets-table");
const betsBody = document.getElementById("bets-body");
const resultSection = document.getElementById("result-section");
const winnerBanner = document.getElementById("winner-banner");
const payoutsBody = document.getElementById("payouts-body");
const newRoundBtn = document.getElementById("new-round-btn");
const resetBtn = document.getElementById("reset-btn");

let state = JSON.parse(localStorage.getItem("bet-tracker")) || {
  outcomes: [],
  bets: [],
  winner: null,
};

function save() {
  localStorage.setItem("bet-tracker", JSON.stringify(state));
  render();
}

const money = (n) => n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function poolFor(outcome) {
  return state.bets.filter((b) => b.outcome === outcome).reduce((sum, b) => sum + b.amount, 0);
}

function totalPool() {
  return state.bets.reduce((sum, b) => sum + b.amount, 0);
}

function cell(text, className) {
  const td = document.createElement("td");
  if (className) td.className = className;
  td.textContent = text;
  return td;
}

function render() {
  const settled = state.winner !== null;
  const total = totalPool();

  // Odds table
  oddsSection.style.display = state.outcomes.length ? "block" : "none";
  oddsBody.innerHTML = "";
  for (const outcome of state.outcomes) {
    const pool = poolFor(outcome);
    const tr = document.createElement("tr");
    tr.appendChild(cell(outcome));
    tr.appendChild(cell(money(pool), "num"));
    tr.appendChild(cell(pool > 0 ? (total / pool).toFixed(2) + "×" : "—", "num odds"));

    const winTd = document.createElement("td");
    if (!settled && state.bets.length > 0) {
      const winBtn = document.createElement("button");
      winBtn.className = "w3-button w3-green w3-round win-btn";
      winBtn.textContent = "🏆 Won";
      winBtn.addEventListener("click", () => {
        state.winner = outcome;
        save();
      });
      winTd.appendChild(winBtn);
    }
    tr.appendChild(winTd);

    const removeTd = document.createElement("td");
    if (!settled && poolFor(outcome) === 0) {
      const rmBtn = document.createElement("button");
      rmBtn.className = "remove-btn";
      rmBtn.textContent = "✕";
      rmBtn.setAttribute("aria-label", `Remove outcome ${outcome}`);
      rmBtn.addEventListener("click", () => {
        state.outcomes = state.outcomes.filter((o) => o !== outcome);
        save();
      });
      removeTd.appendChild(rmBtn);
    }
    tr.appendChild(removeTd);
    oddsBody.appendChild(tr);
  }
  poolTotalEl.textContent = total > 0 ? `Total pool: ${money(total)}` : "";

  // Bet form + list
  betSection.style.display = state.outcomes.length >= 2 && !settled ? "block" : "none";
  betOutcomeSelect.innerHTML = "";
  for (const outcome of state.outcomes) {
    const opt = document.createElement("option");
    opt.value = outcome;
    opt.textContent = outcome;
    betOutcomeSelect.appendChild(opt);
  }

  betsTable.style.display = state.bets.length ? "table" : "none";
  betsBody.innerHTML = "";
  state.bets.forEach((bet, index) => {
    const tr = document.createElement("tr");
    tr.appendChild(cell(bet.name));
    tr.appendChild(cell(bet.outcome));
    tr.appendChild(cell(money(bet.amount), "num"));
    const td = document.createElement("td");
    const rmBtn = document.createElement("button");
    rmBtn.className = "remove-btn";
    rmBtn.textContent = "✕";
    rmBtn.setAttribute("aria-label", `Remove bet by ${bet.name}`);
    rmBtn.addEventListener("click", () => {
      state.bets.splice(index, 1);
      save();
    });
    td.appendChild(rmBtn);
    tr.appendChild(td);
    betsBody.appendChild(tr);
  });

  // Settlement
  resultSection.style.display = settled ? "block" : "none";
  if (settled) {
    winnerBanner.textContent = `🏆 Winning outcome: ${state.winner}`;
    payoutsBody.innerHTML = "";
    const winningPool = poolFor(state.winner);
    for (const bet of state.bets) {
      const payout = bet.outcome === state.winner ? (bet.amount / winningPool) * total : 0;
      const net = payout - bet.amount;
      const tr = document.createElement("tr");
      tr.appendChild(cell(bet.name));
      tr.appendChild(cell(money(bet.amount), "num"));
      tr.appendChild(cell(money(payout), "num"));
      tr.appendChild(cell((net >= 0 ? "+" : "") + money(net), "num " + (net >= 0 ? "payout-pos" : "payout-neg")));
      payoutsBody.appendChild(tr);
    }
  }

  newRoundBtn.style.display = state.bets.length || settled ? "inline-block" : "none";
  resetBtn.style.display = state.outcomes.length ? "inline-block" : "none";
}

addOutcomeBtn.addEventListener("click", () => {
  const name = outcomeInput.value.trim();
  if (!name || state.outcomes.includes(name)) return;
  state.outcomes.push(name);
  outcomeInput.value = "";
  outcomeInput.focus();
  save();
});
outcomeInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") addOutcomeBtn.click();
});

addBetBtn.addEventListener("click", () => {
  const name = bettorInput.value.trim();
  const amount = parseFloat(amountInput.value);
  if (!name || !betOutcomeSelect.value || !(amount > 0)) return;
  state.bets.push({ name, outcome: betOutcomeSelect.value, amount });
  amountInput.value = "";
  bettorInput.value = "";
  bettorInput.focus();
  save();
});
amountInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") addBetBtn.click();
});

newRoundBtn.addEventListener("click", () => {
  state.bets = [];
  state.winner = null;
  save();
});

resetBtn.addEventListener("click", () => {
  state = { outcomes: [], bets: [], winner: null };
  save();
});

outcomeInput.focus();
render();
