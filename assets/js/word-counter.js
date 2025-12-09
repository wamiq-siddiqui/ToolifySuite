const input = document.getElementById("wordCounterInput");

// STATS
const wcWordCount = document.getElementById("wcWordCount");
const wcCharCount = document.getElementById("wcCharCount");
const wcCharNoSpace = document.getElementById("wcCharNoSpace");
const wcSentenceCount = document.getElementById("wcSentenceCount");
const wcParagraphCount = document.getElementById("wcParagraphCount");
const wcReadingTime = document.getElementById("wcReadingTime");

// BUTTONS
const copyBtn = document.getElementById("wcCopyBtn");
const downloadBtn = document.getElementById("wcDownloadBtn");
const clearBtn = document.getElementById("wcClearBtn");

// CLEAR TEXT ON PAGE LOAD
window.addEventListener("load", () => {
  input.value = "";
  updateWordCounter();
  revealWordCounter();
});

// MAIN FUNCTION
function updateWordCounter() {
  const text = input.value;

  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const chars = text.length;
  const charsNoSpace = text.replace(/\s/g, "").length;
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim()).length;
  const paragraphs = text.split(/\n+/).filter((p) => p.trim()).length;
  const read = Math.ceil(words / 200);

  wcWordCount.textContent = words;
  wcCharCount.textContent = chars;
  wcCharNoSpace.textContent = charsNoSpace;
  wcSentenceCount.textContent = sentences;
  wcParagraphCount.textContent = paragraphs;
  wcReadingTime.textContent = read + " min";
}

input.addEventListener("input", updateWordCounter);

// COPY
copyBtn.addEventListener("click", () => {
  if (!input.value) return;
  const formatted = input.value.replace(/\r?\n/g, "\r\n");
  navigator.clipboard.writeText(formatted);
  copyBtn.textContent = "Copied!";
  setTimeout(() => (copyBtn.textContent = "Copy"), 1200);
});

// DOWNLOAD
downloadBtn.addEventListener("click", () => {
  if (!input.value) return;

  const formatted = input.value.replace(/\r?\n/g, "\r\n");
  const blob = new Blob([formatted], { type: "text/plain;charset=utf-8"});
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "word-counter-text.txt";
  a.click();

  URL.revokeObjectURL(url);
});

// CLEAR
clearBtn.addEventListener("click", () => {
  input.value = "";
  updateWordCounter();
});

/* ----------------------------
   ANIMATION REVEAL LOGIC
---------------------------- */
function revealWordCounter() {
  document.querySelectorAll(".word-counter-animate").forEach((el, i) => {
    setTimeout(() => {
      el.classList.add("show");
    }, 80 * i);
  });
}

/* ----------------------------
   FORCE TAP FEEDBACK ON MOBILE
---------------------------- */
function addMobileTapFeedback() {
  const tappables = document.querySelectorAll(
    ".word-counter-buttons button, .word-counter-stat-box, .word-counter-ad"
  );

  tappables.forEach((el) => {
    el.addEventListener("touchstart", () => {
      el.style.transform = "scale(0.95)";
    });

    el.addEventListener("touchend", () => {
      el.style.transform = "";
    });

    el.addEventListener("touchcancel", () => {
      el.style.transform = "";
    });
  });
}

addMobileTapFeedback();
