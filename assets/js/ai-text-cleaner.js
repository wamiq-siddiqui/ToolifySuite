document.addEventListener("DOMContentLoaded", () => {
  /* ===============================
     ELEMENTS
  =============================== */
  const input = document.getElementById("ai-text-cleaner-input");
  const output = document.getElementById("ai-text-cleaner-output");

  const runBtn = document.getElementById("ai-text-cleaner-run");
  const resetBtn = document.getElementById("ai-text-cleaner-reset");
  const copyBtn = document.getElementById("ai-text-cleaner-copy");
  const downloadBtn = document.getElementById("ai-text-cleaner-download");

  const wordStat = document.getElementById("ai-text-cleaner-words");
  const charStat = document.getElementById("ai-text-cleaner-chars");
  const sentenceStat = document.getElementById("ai-text-cleaner-sentences");

  const modeSelect = document.getElementById("ai-text-cleaner-mode");

  const opts = {
    removeRepetition: document.getElementById(
      "ai-text-cleaner-remove-repetition"
    ),
    fixGrammar: document.getElementById("ai-text-cleaner-fix-grammar"),
    humanize: document.getElementById("ai-text-cleaner-humanize"),
    simplify: document.getElementById("ai-text-cleaner-simplify"),
    removeAIPatterns: document.getElementById(
      "ai-text-cleaner-remove-ai-patterns"
    ),
    improveFlow: document.getElementById("ai-text-cleaner-improve-flow"),
    activeVoice: document.getElementById("ai-text-cleaner-active-voice"),
    preserveMeaning: document.getElementById(
      "ai-text-cleaner-preserve-meaning"
    ),
  };

  /* ===============================
     HELPERS
  =============================== */

  // Windows Notepad safe
  const normalizeLineBreaks = (text) => text.replace(/\r?\n/g, "\r\n");

  const updateStats = (text) => {
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const chars = text.length;
    const sentences = text.match(/[^.!?]+[.!?]+/g)?.length || 0;

    wordStat.textContent = words;
    charStat.textContent = chars;
    sentenceStat.textContent = sentences;
  };

  const fixQuotes = (text) => text.replace(/[“”]/g, '"').replace(/[‘’]/g, "'");

  const smartPunctuationFix = (text) =>
    text.replace(/\s+([,.!?])/g, "$1").replace(/([,.!?])([^\s])/g, "$1 $2");

  const sentenceCase = (text) =>
    text.toLowerCase().replace(/(^\s*\w|[.!?]\s*\w)/g, (c) => c.toUpperCase());

  /* ===============================
     RESET TO DEFAULT (FIX)
  =============================== */
  function resetToolState() {
    input.value = "";
    output.value = "";

    modeSelect.value = "clean";

    opts.removeRepetition.checked = true;
    opts.fixGrammar.checked = true;
    opts.humanize.checked = true;
    opts.simplify.checked = false;
    opts.removeAIPatterns.checked = true;
    opts.improveFlow.checked = true;
    opts.activeVoice.checked = false;
    opts.preserveMeaning.checked = true;

    updateStats("");
  }

  /* ===============================
     REWRITE MODES
  =============================== */
  function applyRewriteMode(text, mode) {
    switch (mode) {
      case "simplify":
        return text.replace(
          /\b(very|really|basically|actually|quite|extremely|highly)\b/gi,
          ""
        );

      case "formal":
        return text
          .replace(/\bcan't\b/gi, "cannot")
          .replace(/\bwon't\b/gi, "will not")
          .replace(/\bI'm\b/gi, "I am")
          .replace(/\bdon't\b/gi, "do not")
          .replace(/\bit's\b/gi, "it is");

      case "casual":
        return text
          .replace(/\bdo not\b/gi, "don't")
          .replace(/\bcannot\b/gi, "can't")
          .replace(/\bwill not\b/gi, "won't")
          .replace(/\bit is\b/gi, "it's");

      default:
        return text;
    }
  }

  /* ===============================
     CLEANING LOGIC
  =============================== */
  function cleanText() {
    let text = input.value;
    if (!text) {
      output.value = "";
      updateStats("");
      return;
    }

    text = normalizeLineBreaks(text);
    text = text.replace(/[ \t]+/g, " ");
    text = text.replace(/\r\n{3,}/g, "\r\n\r\n");

    if (opts.removeRepetition.checked) {
      text = text.replace(/\b(\w+)(\s+\1\b)+/gi, "$1");
    }

    if (opts.removeAIPatterns.checked) {
      text = text.replace(
        /\b(in conclusion|moreover|furthermore|as an ai language model|overall|to summarize)\b/gi,
        ""
      );
    }

    if (opts.fixGrammar.checked) {
      text = smartPunctuationFix(text);
      text = fixQuotes(text);
      text = sentenceCase(text);
    }

    if (opts.simplify.checked) {
      text = text.replace(/\b(very|really|basically|actually|quite)\b/gi, "");
    }

    if (opts.humanize.checked) {
      const replacements = {
        utilize: "use",
        therefore: "so",
        moreover: "also",
        however: "but",
        additionally: "also",
        numerous: "many",
      };
      for (let key in replacements) {
        text = text.replace(
          new RegExp(`\\b${key}\\b`, "gi"),
          replacements[key]
        );
      }
    }

    if (opts.activeVoice.checked) {
      text = text.replace(/\bwas\b\s+(\w+ed)\b/gi, "$1");
    }

    if (opts.improveFlow.checked) {
      text = text.replace(/\. +/g, ".\r\n");
    }

    text = applyRewriteMode(text, modeSelect.value);
    text = normalizeLineBreaks(text).trim();

    output.value = text;
    updateStats(text);
  }

  /* ===============================
     EVENTS
  =============================== */
  runBtn.addEventListener("click", cleanText);
  resetBtn.addEventListener("click", resetToolState);

  copyBtn.addEventListener("click", () => {
    if (!output.value) return;
    navigator.clipboard.writeText(normalizeLineBreaks(output.value));
    copyBtn.textContent = "Copied ✓";
    setTimeout(() => (copyBtn.textContent = "Copy"), 1200);
  });

  downloadBtn.addEventListener("click", () => {
    if (!output.value) return;
    const blob = new Blob([normalizeLineBreaks(output.value)], {
      type: "text/plain;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "cleaned-text.txt";
    a.click();
    URL.revokeObjectURL(url);
  });

  input.addEventListener("input", () => updateStats(input.value));

  window.addEventListener("beforeunload", resetToolState);

  // Force clean state on load (browser cache fix)
  resetToolState();
});
