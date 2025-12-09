document.addEventListener("DOMContentLoaded", () => {
  const overlay = document.getElementById("cookie-popup-overlay");
  const btnEssential = document.getElementById("cookie-popup-essential");
  const btnAll = document.getElementById("cookie-popup-accept-all");

  // Load nothing now — tracking removed completely.
  function loadTrackingScripts() {
    // Empty — because Analytics & Adsense removed
  }

  const saved = localStorage.getItem("cookie-choice");

  if (!saved) {
    overlay.classList.add("popup-visible");
    document.body.style.overflow = "hidden";
    document.body.classList.add("popup-open");
  } else {
    // Still call it (harmless, empty function)
    loadTrackingScripts();
  }

  function accept(choice) {
    localStorage.setItem("cookie-choice", choice);

    overlay.classList.remove("popup-visible");
    document.body.style.overflow = "";
    document.body.classList.remove("popup-open");

    loadTrackingScripts(); // does nothing, but kept for compatibility
  }

  // Both buttons do the same (close popup)
  btnEssential.addEventListener("click", () => accept("essential"));
  btnAll.addEventListener("click", () => accept("all"));
});
