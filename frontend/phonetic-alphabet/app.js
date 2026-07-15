const phonetic = [
  { letter: "A", word: "Alfa" },
  { letter: "B", word: "Bravo" },
  { letter: "C", word: "Charlie" },
  { letter: "D", word: "Delta" },
  { letter: "E", word: "Echo" },
  { letter: "F", word: "Foxtrot" },
  { letter: "G", word: "Golf" },
  { letter: "H", word: "Hotel" },
  { letter: "I", word: "India" },
  { letter: "J", word: "Juliet" },
  { letter: "K", word: "Kilo" },
  { letter: "L", word: "Lima" },
  { letter: "M", word: "Mike" },
  { letter: "N", word: "November" },
  { letter: "O", word: "Oscar" },
  { letter: "P", word: "Papa" },
  { letter: "Q", word: "Quebec" },
  { letter: "R", word: "Romeo" },
  { letter: "S", word: "Sierra" },
  { letter: "T", word: "Tango" },
  { letter: "U", word: "Uniform" },
  { letter: "V", word: "Victor" },
  { letter: "W", word: "Whiskey" },
  { letter: "X", word: "X-ray" },
  { letter: "Y", word: "Yankee" },
  { letter: "Z", word: "Zulu" }
];

const grid = document.getElementById("phonetic-grid");
grid.innerHTML = phonetic.map(p => `
  <div class="phonetic-card">
    <div class="letter">${p.letter}</div>
    <div class="word">${p.word}</div>
  </div>
`).join("");
