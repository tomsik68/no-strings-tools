const knots = [
  { name: "Square Knot", icon: "🔗", use: "Tie two ropes of equal diameter together", steps: ["Cross right rope over left", "Wrap right around left and pull through", "Cross left rope over right", "Wrap left around right and pull through", "Tighten both ends"] },
  { name: "Bowline", icon: "🪢", use: "Create a fixed loop that won't slip", steps: ["Make a small loop in the rope", "Thread the loose end up through the loop", "Wrap it around the main rope", "Thread it back down through the loop", "Tighten by pulling the main rope"] },
  { name: "Clove Hitch", icon: "⚓", use: "Secure rope to a post or pole", steps: ["Wrap rope around post from front", "Cross rope over itself", "Wrap around again above the first wrap", "Thread loose end under the top loop", "Pull tight"] },
  { name: "Trucker's Hitch", icon: "🚚", use: "Mechanical advantage for tight loads", steps: ["Make a loop in the rope", "Thread the loose end around anchor point", "Bring it back and thread through the loop", "Pull to tighten with mechanical advantage", "Secure with a quick-release knot"] },
  { name: "Double Half Hitch", icon: "🔀", use: "Attach rope to ring or carabiner", steps: ["Take rope around the ring", "Cross rope over itself", "Wrap around the main rope twice", "Pull tight for first hitch", "Repeat below for second hitch"] },
  { name: "Figure Eight", icon: "8️⃣", use: "Create a stopper knot or loop", steps: ["Form a loop in the rope", "Thread the loose end over the loop", "Wrap around the main rope", "Thread back down through the loop", "Pull to tighten into a figure eight"] },
  { name: "Taut Line Hitch", icon: "🪝", use: "Adjust loop that slides but holds under load", steps: ["Form a loop in the rope", "Wrap the loose end around the main rope twice", "Thread through the loop", "Wrap once more around the main rope", "Thread through the loop again and tighten"] },
  { name: "Sheepshank", icon: "🐑", use: "Shorten a rope without cutting", steps: ["Create two loops side by side", "Fold the middle section over", "Loop the standing end through both loops", "Repeat on the other side", "Pull tight to lock the knot"] }
];

const grid = document.getElementById("knot-grid");
const detailContainer = document.getElementById("detail-container");

knots.forEach((knot, idx) => {
  const card = document.createElement("div");
  card.className = "knot-card";
  card.innerHTML = `<div class="knot-icon">${knot.icon}</div><div class="knot-name">${knot.name}</div>`;
  card.addEventListener("click", () => showDetail(idx));
  grid.appendChild(card);
});

function showDetail(idx) {
  const knot = knots[idx];
  let stepsHtml = knot.steps.map((step, i) => `
    <div class="step">
      <span class="step-number">${i + 1}</span>
      <span>${step}</span>
    </div>
  `).join("");

  detailContainer.innerHTML = `
    <div class="knot-detail">
      <h3>${knot.icon} ${knot.name}</h3>
      <p><strong>Use:</strong> ${knot.use}</p>
      <h4>Steps</h4>
      <div class="steps">${stepsHtml}</div>
      <button class="w3-button w3-light-grey w3-round" onclick="document.getElementById('detail-container').innerHTML = ''">Close</button>
    </div>
  `;
  detailContainer.scrollIntoView({ behavior: "smooth" });
}
