(function () {
  const outputEl = document.getElementById("password-generator-output");
  if (!outputEl) return;

  // ELEMENTS
  const lengthRange = document.getElementById("password-generator-length");
  const lengthValue = document.getElementById(
    "password-generator-length-value"
  );

  const chkLower = document.getElementById("password-generator-lowercase");
  const chkUpper = document.getElementById("password-generator-uppercase");
  const chkNumbers = document.getElementById("password-generator-numbers");
  const chkSymbols = document.getElementById("password-generator-symbols");

  const chkNoSimilar = document.getElementById("password-generator-no-similar");
  const chkNoAmbiguous = document.getElementById(
    "password-generator-no-ambiguous"
  );
  const chkNoRepeat = document.getElementById("password-generator-no-repeat");

  const copyBtn = document.getElementById("password-generator-copy-btn");
  const toggleBtn = document.getElementById("password-generator-toggle-btn");
  const generateBtn = document.getElementById(
    "password-generator-generate-btn"
  );
  const clearBtn = document.getElementById("password-generator-clear-btn");
  const warningEl = document.getElementById("password-generator-warning");

  const strengthLabel = document.getElementById(
    "password-generator-strength-label"
  );
  const strengthFill = document.getElementById(
    "password-generator-strength-fill"
  );

  const batchBtn = document.getElementById("password-generator-batch-btn");
  const copyAllBtn = document.getElementById("password-generator-copy-all-btn");
  const batchList = document.getElementById("password-generator-batch-list");

  const historyList = document.getElementById(
    "password-generator-history-list"
  );

  const qtyBtns = document.querySelectorAll(".qty-btn");
  const customQtyInput = document.getElementById(
    "password-generator-custom-qty"
  );
  const regenerateBtn = document.getElementById(
    "password-generator-regenerate-btn"
  );
  const downloadAllBtn = document.getElementById(
    "password-generator-download-all-btn"
  );

  // CHARACTER SETS
  const LOWER = "abcdefghijklmnopqrstuvwxyz";
  const UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const NUMBERS = "0123456789";
  const SYMBOLS = "!@#$%^&*()-_=+[]{};:,.<>/?|~";

  const SIMILAR = new Set(["i", "l", "1", "0", "o", "O"]);
  const AMBIGUOUS = new Set([
    "{",
    "}",
    "[",
    "]",
    "(",
    ")",
    "/",
    "\\",
    "'",
    '"',
    ",",
    ";",
    ":",
    ".",
    "<",
    ">",
  ]);

  let history = [];
  let lastBatchQty = 10;

  function secureRandomInt(max) {
    const arr = new Uint32Array(1);
    crypto.getRandomValues(arr);
    return arr[0] % max;
  }

  function buildCharPool() {
    let pool = "";

    if (chkLower.checked) pool += LOWER;
    if (chkUpper.checked) pool += UPPER;
    if (chkNumbers.checked) pool += NUMBERS;
    if (chkSymbols.checked) pool += SYMBOLS;

    if (chkNoSimilar.checked) {
      pool = pool
        .split("")
        .filter((ch) => !SIMILAR.has(ch))
        .join("");
    }

    if (chkNoAmbiguous.checked) {
      pool = pool
        .split("")
        .filter((ch) => !AMBIGUOUS.has(ch))
        .join("");
    }

    return pool;
  }

  // MAIN STRENGTH BAR (TOP)
  function updateStrengthDisplay(password, poolLength) {
    if (!password) {
      strengthLabel.textContent = "—";
      strengthFill.style.width = "0%";
      strengthFill.className = "password-generator-strength-fill";
      return;
    }

    if (!poolLength || poolLength <= 1) {
      strengthLabel.textContent = "Weak";
      strengthFill.style.width = "25%";
      strengthFill.className =
        "password-generator-strength-fill password-generator-strength-weak";
      return;
    }

    const len = password.length;
    const entropyPerChar = Math.log2(poolLength);
    const totalEntropy = len * entropyPerChar;

    let label = "";
    let width = 0;
    let cls = "password-generator-strength-fill ";

    if (totalEntropy < 28) {
      label = "Weak";
      width = 25;
      cls += "password-generator-strength-weak";
    } else if (totalEntropy < 45) {
      label = "Medium";
      width = 50;
      cls += "password-generator-strength-medium";
    } else if (totalEntropy < 70) {
      label = "Strong";
      width = 75;
      cls += "password-generator-strength-strong";
    } else {
      label = "Very Strong";
      width = 100;
      cls += "password-generator-strength-very-strong";
    }

    strengthLabel.textContent = label;
    strengthFill.style.width = width + "%";
    strengthFill.className = cls;
  }

  // SIMPLE STRENGTH CATEGORY FOR DOTS
  function getStrengthCategory(password) {
    if (!password) return "weak";

    const len = password.length;
    let sets = 0;
    if (/[a-z]/.test(password)) sets++;
    if (/[A-Z]/.test(password)) sets++;
    if (/[0-9]/.test(password)) sets++;
    if (/[^A-Za-z0-9]/.test(password)) sets++;

    const score = len + sets * 2;

    if (score < 12) return "weak";
    if (score < 20) return "medium";
    if (score < 28) return "strong";
    return "very-strong";
  }

  function generatePassword(updateStrength = true) {
    const length = parseInt(lengthRange.value, 10);
    const avoidRepeat = chkNoRepeat.checked;
    warningEl.textContent = "";

    let pool = buildCharPool();
    if (!pool.length) {
      warningEl.textContent = "Please select at least one character type.";
      return null;
    }

    if (avoidRepeat && length > pool.length) {
      warningEl.textContent =
        "Reduce length or enable more characters to avoid repeats.";
      return null;
    }

    let chars = [];

    if (avoidRepeat) {
      let available = pool.split("");
      for (let i = 0; i < length; i++) {
        const idx = secureRandomInt(available.length);
        chars.push(available[idx]);
        available.splice(idx, 1);
      }
    } else {
      for (let i = 0; i < length; i++) {
        const idx = secureRandomInt(pool.length);
        chars.push(pool[idx]);
      }
    }

    const pwd = chars.join("");

    // Strength bar sirf single generate ke time update hoga
    if (updateStrength) {
      updateStrengthDisplay(pwd, pool.length);
    }

    return pwd;
  }

  function addToHistory(pwd) {
    if (!pwd) return;
    history.unshift(pwd);
    if (history.length > 10) history.pop(); // 10 recent passwords
    renderHistory();
  }

  function renderHistory() {
    historyList.innerHTML = "";
    history.forEach((pwd) => {
      const li = document.createElement("li");
      li.className = "password-generator-list-item";

      const dot = document.createElement("span");
      const cat = getStrengthCategory(pwd);
      let dotClass = "password-generator-strength-dot ";
      if (cat === "weak") dotClass += "password-generator-strength-dot-weak";
      else if (cat === "medium")
        dotClass += "password-generator-strength-dot-medium";
      else if (cat === "strong")
        dotClass += "password-generator-strength-dot-strong";
      else dotClass += "password-generator-strength-dot-very-strong";
      dot.className = dotClass;

      const span = document.createElement("span");
      span.className = "password-generator-list-text";
      span.textContent = pwd;

      const btn = document.createElement("button");
      btn.className = "password-generator-btn ghost";
      btn.textContent = "Copy";
      btn.addEventListener("click", () => {
        navigator.clipboard.writeText(pwd);
        const old = btn.textContent;
        btn.textContent = "Copied!";
        setTimeout(() => (btn.textContent = old), 1000);
      });

      li.appendChild(dot);
      li.appendChild(span);
      li.appendChild(btn);
      historyList.appendChild(li);
    });
  }

  function generateBatch(qtyOverride) {
    batchList.innerHTML = "";

    let qty;

    // priority: explicit override → custom input → lastBatchQty
    if (typeof qtyOverride === "number" && !Number.isNaN(qtyOverride)) {
      qty = qtyOverride;
    } else {
      const customVal = parseInt(customQtyInput.value || "", 10);
      if (!Number.isNaN(customVal)) {
        qty = customVal;
      } else {
        qty = lastBatchQty;
      }
    }

    if (qty < 1) qty = 1;
    if (qty > 200) qty = 200;
    lastBatchQty = qty;

    for (let i = 0; i < qty; i++) {
      const pwd = generatePassword(false); // no top strength update
      if (!pwd) break;

      const li = document.createElement("li");
      li.className = "password-generator-list-item";

      const dot = document.createElement("span");
      const cat = getStrengthCategory(pwd);
      let dotClass = "password-generator-strength-dot ";

      if (cat === "weak") dotClass += "password-generator-strength-dot-weak";
      else if (cat === "medium")
        dotClass += "password-generator-strength-dot-medium";
      else if (cat === "strong")
        dotClass += "password-generator-strength-dot-strong";
      else dotClass += "password-generator-strength-dot-very-strong";

      dot.className = dotClass;

      const span = document.createElement("span");
      span.className = "password-generator-list-text";
      span.textContent = pwd;

      const btn = document.createElement("button");
      btn.className = "password-generator-btn ghost";
      btn.textContent = "Copy";
      btn.addEventListener("click", () => {
        navigator.clipboard.writeText(pwd);
        const old = btn.textContent;
        btn.textContent = "Copied!";
        setTimeout(() => (btn.textContent = old), 900);
      });

      li.appendChild(dot);
      li.appendChild(span);
      li.appendChild(btn);
      batchList.appendChild(li);
    }

    // batch generate → top strength bar blank
    updateStrengthDisplay("", 0);
  }

  function regenerateAllBatch() {
    if (!lastBatchQty) return;
    generateBatch(lastBatchQty);
  }

  function copyAllBatch() {
    const items = batchList.querySelectorAll(".password-generator-list-text");
    if (!items.length) return;

    const text = Array.from(items)
      .map((el,i) => `${i + 1}.${el.textContent}`)
      .join("\r\n");
    navigator.clipboard.writeText(text);

    const old = copyAllBtn.textContent;
    copyAllBtn.textContent = "Copied All!";
    setTimeout(() => (copyAllBtn.textContent = old), 1000);
  }

  function downloadAllBatch() {
    const items = batchList.querySelectorAll(".password-generator-list-text");
    if (!items.length) return;

    const text = Array.from(items)
      .map((el, i) => `${i + 1}.${el.textContent}`)
      .join("\r\n");

    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "passwords.txt";
    a.click();

    URL.revokeObjectURL(url);
  }

  // DEFAULTS ON PAGE LOAD / CLEAR
  function resetAll() {
    outputEl.value = "";
    warningEl.textContent = "";
    history = [];
    renderHistory();
    batchList.innerHTML = "";

    lengthRange.value = 15;
    lengthValue.textContent = "15";

    // Recommended defaults
    chkLower.checked = true;
    chkUpper.checked = true;
    chkNumbers.checked = true;
    chkSymbols.checked = false;
    chkNoSimilar.checked = false;
    chkNoAmbiguous.checked = false;
    chkNoRepeat.checked = false;

    customQtyInput.value = "";
    lastBatchQty = 10;

    updateStrengthDisplay("", 0);
  }

  window.addEventListener("load", resetAll);

  // EVENTS
  lengthRange.addEventListener("input", () => {
    lengthValue.textContent = lengthRange.value;
  });

  generateBtn.addEventListener("click", () => {
    const pwd = generatePassword(true);
    if (!pwd) return;
    outputEl.value = pwd;
    addToHistory(pwd);
  });

  copyBtn.addEventListener("click", () => {
    if (!outputEl.value) return;
    navigator.clipboard.writeText(outputEl.value);
    const old = copyBtn.textContent;
    copyBtn.textContent = "Copied!";
    setTimeout(() => (copyBtn.textContent = old), 1000);
  });

  let shown = false;
  toggleBtn.addEventListener("click", () => {
    shown = !shown;
    outputEl.type = shown ? "text" : "password";
    toggleBtn.textContent = shown ? "Hide" : "Show";
  });

  clearBtn.addEventListener("click", resetAll);

  batchBtn.addEventListener("click", () => {
    generateBatch();
  });

  copyAllBtn.addEventListener("click", copyAllBatch);
  regenerateBtn.addEventListener("click", regenerateAllBatch);
  downloadAllBtn.addEventListener("click", downloadAllBatch);

  qtyBtns.forEach((btn) =>
    btn.addEventListener("click", () => {
      const val = parseInt(btn.dataset.val, 10);
      if (Number.isNaN(val)) return;
      customQtyInput.value = "";
      lastBatchQty = val;
      generateBatch(val);
    })
  );
})();

/* ---------------------------------------------------------
   PASSWORD GENERATOR – ANIMATION INJECTION (NON-DESTRUCTIVE)
---------------------------------------------------------- */

// Page container reveal
window.addEventListener("DOMContentLoaded", () => {
  const container = document.querySelector(".password-generator-container");
  if (container) {
    requestAnimationFrame(() => {
      container.classList.add("pg-visible");
    });
  }
});

// Reveal sections on scroll
(function () {
  const blocks = document.querySelectorAll(
    ".password-generator-output-card, .password-generator-options-card, .password-generator-batch-section, .password-generator-history-section, .password-generator-content, .password-generator-faq"
  );

  if (!("IntersectionObserver" in window)) {
    blocks.forEach((b) => b.classList.add("pg-block-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("pg-block-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
  );

  blocks.forEach((block) => observer.observe(block));
})();

// Enable fade-in for history & batch items
const pgListObserver = new MutationObserver((mutations) => {
  mutations.forEach((m) => {
    m.addedNodes.forEach((node) => {
      if (
        node.classList &&
        node.classList.contains("password-generator-list-item")
      ) {
        requestAnimationFrame(() => {
          node.classList.add("pg-item-visible");
        });
      }
    });
  });
});

document.querySelectorAll(".password-generator-list").forEach((list) => {
  pgListObserver.observe(list, { childList: true });
});

/* ---------------------------------------------------------
   MOBILE BUTTON TAP FEEDBACK (NON-DESTRUCTIVE)
---------------------------------------------------------- */

(function () {
  const isTouch = window.matchMedia(
    "(hover: none) and (pointer: coarse)"
  ).matches;
  if (!isTouch) return;

  document.querySelectorAll(".password-generator-btn").forEach((btn) => {
    btn.addEventListener("touchstart", () => {
      btn.classList.add("pg-tap");
    });

    btn.addEventListener("touchend", () => {
      setTimeout(() => btn.classList.remove("pg-tap"), 120);
    });
  });
})();
