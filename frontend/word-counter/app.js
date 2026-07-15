const input = document.getElementById("input");
const out = {
  words: document.getElementById("words"),
  chars: document.getElementById("chars"),
  charsNs: document.getElementById("chars-ns"),
  sentences: document.getElementById("sentences"),
  paragraphs: document.getElementById("paragraphs"),
  reading: document.getElementById("reading"),
};

const wordSeg = new Intl.Segmenter(undefined, { granularity: "word" });
const sentenceSeg = new Intl.Segmenter(undefined, { granularity: "sentence" });
const READING_WPM = 200;

function update() {
  const text = input.value;

  const words = [...wordSeg.segment(text)].filter((s) => s.isWordLike).length;
  out.words.textContent = words;
  out.chars.textContent = [...text].length;
  out.charsNs.textContent = [...text.replace(/\s/gu, "")].length;
  out.sentences.textContent = text.trim() ? [...sentenceSeg.segment(text)].filter((s) => /\S/.test(s.segment)).length : 0;
  out.paragraphs.textContent = text.split(/\n\s*\n/).filter((p) => p.trim()).length;
  out.reading.textContent = words ? `${Math.max(1, Math.round(words / READING_WPM))} min` : "0 min";
}

input.addEventListener("input", update);
input.focus();
update();
