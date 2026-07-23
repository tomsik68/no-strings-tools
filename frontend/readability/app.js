const textEl = document.getElementById("text");
const out = document.getElementById("out");

function countSyllables(word) {
  word = word.toLowerCase().replace(/[^a-z]/g, "");
  if (!word) return 0;
  if (word.length <= 3) return 1;
  word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, "").replace(/^y/, "");
  const m = word.match(/[aeiouy]{1,2}/g);
  return m ? m.length : 1;
}

function label(score) {
  if (score >= 90) return "Very easy";
  if (score >= 80) return "Easy";
  if (score >= 70) return "Fairly easy";
  if (score >= 60) return "Standard";
  if (score >= 50) return "Fairly difficult";
  if (score >= 30) return "Difficult";
  return "Very difficult";
}

function render() {
  const text = textEl.value.trim();
  if (!text) {
    out.innerHTML = '<p class="w3-text-grey">Paste text above.</p>';
    return;
  }
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length);
  const words = text.match(/[A-Za-zÀ-ÖØ-öø-ÿ0-9']+/g) || [];
  const chars = text.replace(/\s/g, "").length;
  const syl = words.reduce((s, w) => s + countSyllables(w), 0);
  const W = Math.max(1, words.length);
  const S = Math.max(1, sentences.length);
  const flesch = 206.835 - 1.015 * (W / S) - 84.6 * (syl / W);
  const grade = 0.39 * (W / S) + 11.8 * (syl / W) - 15.59;
  const score = Math.max(0, Math.min(100, flesch));

  out.innerHTML = `
    <div class="w3-panel w3-white w3-round w3-border" style="padding:16px;">
      <div class="w3-text-grey w3-small">Flesch Reading Ease</div>
      <div style="font-size:36px;font-weight:700;">${score.toFixed(0)}</div>
      <div style="font-weight:600;">${label(score)}</div>
      <div class="w3-text-grey w3-small w3-margin-top">Approx. US grade level: <strong>${Math.max(0, grade).toFixed(1)}</strong></div>
    </div>
    <div class="w3-panel w3-white w3-round w3-border" style="padding:12px 16px;">
      <table class="w3-table w3-small">
        <tr><td>Words</td><td><strong>${W}</strong></td></tr>
        <tr><td>Sentences</td><td><strong>${S}</strong></td></tr>
        <tr><td>Characters</td><td><strong>${chars}</strong></td></tr>
        <tr><td>Avg words / sentence</td><td><strong>${(W / S).toFixed(1)}</strong></td></tr>
        <tr><td>Avg syllables / word</td><td><strong>${(syl / W).toFixed(2)}</strong></td></tr>
      </table>
    </div>`;
}

textEl.addEventListener("input", render);
textEl.focus();
render();
